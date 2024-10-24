import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import {
  CANCEL_ORDER,
  CREATE_ORDER,
  GET_DEPTH,
  GET_OPEN_ORDERS,
  MessageFromApi,
  ON_RAMP,
  ORDER_UPDATE,
  TRADE_ADDED,
} from "@opinix/types";
import { Fill, Order, Orderbook } from "./Orderbook";
import { RedisManager } from "@repo/order-queue";

export const EXAMPLE_EVENT = "bitcoin-to-be-priced-at-6811470-usdt-or-more-at-0735-pm";
export const CURRENCY = "INR";

interface UserBalance {
  available: number;
  locked: number;
}
export class Engine {
  private balances: Map<string, UserBalance> = new Map();
  private orderbooks: Orderbook[] = [];
  constructor() {
    let snapshot = null;
    try {
      if (process.env.WITH_SNAPSHOT) {
        snapshot = fs.readFileSync("./snapshot.json");
      }
    } catch (error) {
      console.log("No snapshot found");
    }
    if (snapshot) {
      const parsedSnapShot = JSON.parse(snapshot.toString());
      this.orderbooks = parsedSnapShot.orderbook.map(
        (o: any) =>
          new Orderbook(o.bids, o.asks, o.lastTradeId, o.currentPrice, o.event)
      );
      this.balances = new Map(parsedSnapShot.balance);
    } else {
      const lastTradeId = 1; // for now assuming this random id as lastTradeId
      this.orderbooks = [new Orderbook([], [], lastTradeId, 0, EXAMPLE_EVENT)];
      this.setBaseBalances();
    }
    setInterval(() => {
      this.saveSnapshot();
    }, 1000 * 3);
  }

  saveSnapshot() {
    const snapshotSnapshot = {
      orderbooks: this.orderbooks.map((o) => o.getSnapshot()),
      balances: Array.from(this.balances.entries()),
    };
    fs.writeFileSync("./snapshot.json", JSON.stringify(snapshotSnapshot));
  }
  processOrders({
    message,
    clientId,
  }: {
    message: MessageFromApi;
    clientId: string;
  }) {
    console.log("message", message, "clientId", clientId);
    switch (message.type) {
      case CREATE_ORDER:
        try {
          const { executedQty, fills, orderId } = this.createOrders(
            message.data.market,
            message.data.price,
            message.data.quantity,
            message.data.side,
            message.data.userId
          );
          // publish it to the server via redis
          RedisManager.getInstance().sendToApi(clientId, {
            type: "ORDER_PLACED",
            payload: {
              orderId,
              executedQty,
              fills,
            },
          });
          console.log("Pushed ORDER_PLACED into REDIS");
          console.log("Asked after ");
          console.log(`user ${message.data.userId} balanace`, this.balances.get(message.data.userId));

        } catch (error) {
          console.log(error);
          // publish it to the server via redis
          RedisManager.getInstance().sendToApi(clientId, {
            type: "ORDER_CANCELLED",
            payload: {
              orderId: "",
              executedQty: 0,
              remainingQty: 0,
            },
          });
        }
        break;
      case CANCEL_ORDER:
        try {
          const orderId = message.data.orderId;
          const cancelMarket = message.data.market;
          const cancelOrderbook = this.orderbooks.find(
            (o) => o.market === cancelMarket
          );
          if (!cancelOrderbook) {
            throw new Error("No orderbook found");
          }
          const order =
            cancelOrderbook.asks.find((o) => o.orderId === orderId) ||
            cancelOrderbook.bids.find((o) => o.orderId === orderId);
          if (!order) {
            console.log("No order found");
            throw new Error("No order found");
          }
          if (order.side === "yes") {
            const price = cancelOrderbook.cancelBid(order);
            const leftQuantity = (order.quantity - order.filled) * order.price;
            //@ts-ignore
            this.balances.get(order.userId)[CURRENCY].available += leftQuantity;
            //@ts-ignore
            this.balances.get(order.userId)[CURRENCY].locked -= leftQuantity;
            if (price) {
              this.sendUpdatedDepthAt(price.toString(), cancelMarket);
            }
          } else {
            const price = cancelOrderbook.cancelAsk(order);
            const leftQuantity = order.quantity - order.filled;
            //@ts-ignore
            this.balances.get(order.userId)[quoteAsset].available +=
              leftQuantity;
            //@ts-ignore
            this.balances.get(order.userId)[quoteAsset].locked -= leftQuantity;
            if (price) {
              this.sendUpdatedDepthAt(price.toString(), cancelMarket);
            }
          }
          // publish it to the server via redis
          RedisManager.getInstance().sendToApi(clientId, {
            type: "ORDER_CANCELLED",
            payload: {
              orderId,
              executedQty: 0,
              remainingQty: 0,
            },
          });
        } catch (error) {
          console.log("Error hwile cancelling order");
          console.log(error);
        }
        break;
      case GET_OPEN_ORDERS:
        try {
          const openOrderbook = this.orderbooks.find(
            (o) => o.market === message.data.market
          );
          if (!openOrderbook) {
            throw new Error("No orderbook found");
          }
          const openOrders = openOrderbook.getOpenOrders(message.data.userId);
          RedisManager.getInstance().sendToApi(clientId, {
            type: "OPEN_ORDERS",
            payload: openOrders,
          });
        } catch (error) {
          console.log(error);
        }
        break;
      case ON_RAMP:
        const userId = message.data.userId;
        const amount = Number(message.data.amount);
        this.onRamp(userId, amount);
        break;
      case GET_DEPTH:
        try {
          const market = message.data.market;
          const orderbook = this.orderbooks.find((o) => o.market === market);
          if (!orderbook) {
            throw new Error("No orderbook found");
          }
          RedisManager.getInstance().sendToApi(clientId, {
            type: "DEPTH",
            payload: orderbook.getMarketDepth(),
          });
        } catch (e) {
          console.log(e);
          RedisManager.getInstance().sendToApi(clientId, {
            type: "DEPTH",
            payload: {
              bids: [],
              asks: [],
            },
          });
        }
        break;
    }
  }
  addOrderbook(orderbook: Orderbook) {
    this.orderbooks.push(orderbook);
  }
  createOrders(
    market: string,
    price: number,
    quantity: number,
    side: "yes" | "no",
    userId: string
  ): {
    executedQty: number;
    fills: Fill[];
    orderId: string;
  } {
    const orderbook = this.orderbooks.find((o) => o.market === market);
    console.log("orderbook", orderbook);

    if (!orderbook) {
      throw new Error("No orderbook found");
    }
    // Check and Lock funds
    this.checkAndLockFunds(side, userId, price, quantity);
    const order: Order = {
      price: Number(price),
      quantity: Number(quantity),
      orderId: uuidv4(),
      filled: 0,
      side,
      userId,
    };
    const { fills, executedQty } = orderbook.addOrder(order);
    this.updateBalance(userId, side, fills);

    this.createDbTrades(fills, market, userId);

    this.updateDbOrders(order, executedQty, fills, market);

    this.publisWsDepthUpdates(fills, price, side, market);

    this.publishWsTrades(fills, userId, market);

    return { executedQty, fills, orderId: order.orderId };
  }
  checkAndLockFunds(
    side: "yes" | "no",
    userId: string,
    price: number,
    quantity: number
  ) {
    if (side === "yes") {
      if ((this.balances.get(userId)?.available || 0) < quantity * price) {
        throw new Error("Insufficient balance");
      }
      //@ts-ignore
      this.balances.get(userId).available = this.balances.get(userId)?.available - quantity * price;
      //@ts-ignore
      this.balances.get(userId).locked = this.balances.get(userId)?.locked + quantity * price;
    } else {
      console.log(`user ${userId} balanace`, this.balances.get(userId));

      if ((this.balances.get(userId)?.locked || 0) < Number(quantity)) {
        throw new Error("Insufficient funds");
      }
      //@ts-ignore
      this.balances.get(userId).available = this.balances.get(userId)?.available - Number(quantity);
      //@ts-ignore
      this.balances.get(userId).locked = this.balances.get(userId)?.locked + Number(quantity);
    }
  }
  updateBalance(userId: string, side: "yes" | "no", fills: Fill[]) {
    console.log("----------------Balance updating------------");
    if (side === "yes") {
      fills.forEach((fill) => {
        const makerBalance = this.balances.get(fill.otherUserId);
        const takerBalance = this.balances.get(userId);
        console.log("userBalance in yes update", takerBalance)
        if (makerBalance && takerBalance) {
          // Update quote asset balance
          makerBalance.available = makerBalance.available + fill.qty * fill.price;
          takerBalance.locked = takerBalance.locked - fill.qty * fill.price;

          // Update base asset balance
          makerBalance.locked = makerBalance.locked - fill.qty;
          takerBalance.available = takerBalance.available + fill.qty;
        }
      });
    } else {
      fills.forEach((fill) => {
        const takerBalance = this.balances.get(fill.otherUserId);
        const makerBalance = this.balances.get(userId);
        console.log("userBalance in no update", takerBalance)
        if (takerBalance && makerBalance) {
          // Update quote asset balance
          takerBalance.locked = takerBalance.locked - fill.qty * fill.price;
          makerBalance.available = makerBalance.available + fill.qty * fill.price;

          // Update base asset balance
          takerBalance.available = takerBalance.available + fill.qty;
          makerBalance.locked = makerBalance.locked - fill.qty;
        }
      });
    }
  }
  createDbTrades(fills: Fill[], market: string, userId: string) {
    console.log("-------------Creating DB Trades------------");
    fills.forEach((fill) => {
      RedisManager.getInstance().pushMessage({
        type: TRADE_ADDED,
        data: {
          market: market,
          id: fill.tradeId.toString(),
          isBuyerMaker: fill.otherUserId === userId, // TODO: Is this right?
          price: fill.price,
          quantity: fill.qty,
          timestamp: Date.now(),
        },
      });
    });
  }
  updateDbOrders(
    order: Order,
    executedQty: number,
    fills: Fill[],
    market: string
  ) {
    console.log("-----------DB Orders Updating--------------");
    RedisManager.getInstance().pushMessage({
      type: ORDER_UPDATE,
      data: {
        orderId: order.orderId,
        executedQty: executedQty,
        market: market,
        price: order.price.toString(),
        quantity: order.quantity.toString(),
        side: order.side,
      },
    });
    fills.forEach((fill) => {
      RedisManager.getInstance().pushMessage({
        type: ORDER_UPDATE,
        data: {
          orderId: fill.marketOrderId,
          executedQty: fill.qty,
        },
      });
    });
  }
  publisWsDepthUpdates(
    fills: Fill[],
    price: number,
    side: "yes" | "no",
    market: string
  ) {
    console.log("------------Publishing WS Depth--------");
    const orderbook = this.orderbooks.find((o) => o.market === market);
    if (!orderbook) {
      return;
    }
    const depth = orderbook.getMarketDepth();
    if (side === "yes") {
      const updatedAsks = depth?.asks.filter((x) => fills.map((f) => f.price));
      const updatedBid = depth?.bids.find((x) => x[0] === price.toString());
      console.log("----------publishing no ws depth updates--------------");
      RedisManager.getInstance().publishMessage(`depth@${market}`, {
        stream: `depth@${market}`,
        data: {
          a: updatedAsks,
          b: updatedBid ? [updatedBid] : [],
          e: "depth",
        },
      });
    }
    if (side === "no") {
      const updatedBids = depth?.bids.filter((x) => fills.map((f) => f.price));
      const updatedAsk = depth?.asks.find((x) => x[0] === price.toString());
      console.log("----------publishing yes ws depth updates--------------");
      RedisManager.getInstance().publishMessage(`depth@${market}`, {
        stream: `depth@${market}`,
        data: {
          a: updatedAsk ? [updatedAsk] : [],
          b: updatedBids,
          e: "depth",
        },
      });
    }
  }
  publishWsTrades(fills: Fill[], userId: string, market: string) {
    console.log("------------publishing WsTrades------------");
    fills.forEach((fill) => {
      RedisManager.getInstance().publishMessage(`trade@${market}`, {
        stream: `trade@${market}`,
        data: {
          e: "trade",
          t: fill.tradeId,
          m: fill.otherUserId === userId, // CheckCheck
          p: fill.price,
          q: fill.qty.toString(),
          s: market,
        },
      });
    });
  }
  onRamp(userId: string, amount: number) {
    const userBalance = this.balances.get(userId);
    if (!userBalance) {
      this.balances.set(userId, {
        available: amount,
        locked: 0,
      });
    } else {
      // @ts-ignore
      userBalance[CURRENCY].available += amount;
    }
  }
  sendUpdatedDepthAt(price: string, market: string) {
    const orderbook = this.orderbooks.find((o) => o.market === market);
    if (!orderbook) {
      return;
    }
    const depth = orderbook.getMarketDepth();
    const updatedBids = depth?.bids.filter((b) => b[0] === price);
    const updatedAsks = depth?.asks.filter((a) => a[0] === price);
    RedisManager.getInstance().publishMessage(`depth@${market}`, {
      stream: `depth@${market}`,
      data: {
        a: updatedAsks.length ? updatedAsks : [[price, "0"]],
        b: updatedBids.length ? updatedBids : [[price, "0"]],
        e: "depth",
      },
    });
  }
  setBaseBalances() {
    this.balances.set("1", {
      available: 10,
      locked: 10,
    });

    this.balances.set("2", {
      available: 10,
      locked: 10,
    });
  }
}
