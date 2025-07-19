import { v4 as uuidv4 } from "uuid";

export interface Order {
    price: number;
    quantity: number;
    filled: number;
    orderId: string;
    side: "yes" | "no";
    userId: string;
}

export interface Fill {
    price: number;
    qty: number;
    tradeId: string;
    otherUserId: string;
    marketOrderId: string; // orderId to be matched.
}

export class Orderbook {
    bids: Order[];
    asks: Order[];
    market: string;
    lastTradeId: number;
    currentPrice:number;


    constructor(bids: Order[], asks: Order[], lastTradeId: number, currentPrice:number, market: string) {
        this.market = market;
        this.bids = bids;
        this.asks = asks;
        this.lastTradeId = lastTradeId;
        this.currentPrice = currentPrice || 0;
    }

    addOrder(order: Order) {
        if (order.type === "") {
            console.log("order in orderbook", order)
            // matchBid
            const { executedQty, fills } = this.matchBid(order);
            // fillBid
            order.filled = executedQty;
            if (executedQty === order.quantity) {
                return {
                    executedQty,
                    fills,
                };
            }
            this.bids.push(order);
            return {
                executedQty,
                fills,
            };
        } else {
            // matchAsk
            const { executedQty, fills } = this.matchAsk(order);
            // fillAsk
            order.filled = executedQty;
            if (executedQty === order.quantity) {
                return {
                    executedQty,
                    fills,
                };
            }
            this.asks.push(order);
            return {
                executedQty,
                fills,
            };
        }
    }

    matchBid(order: Order): { fills: Fill[]; executedQty: number } {
        const fills: Fill[] = [];
        let executedQty = 0;

        // TODO: matching bid with sorted asks array
        for (let i = 0; i < this.asks.length; i++) {
            if (this.asks[i]?.price! <= order.price && executedQty < order.quantity) {
                const filledQty = Math.min(
                    order.quantity - executedQty,
                    this.asks[i]?.quantity!
                );
                executedQty += filledQty;
                // @ts-ignore
                this.asks[i].filled += filledQty;
                fills.push({
                    price: this.asks[i]?.price!,
                    qty: filledQty,
                    tradeId: uuidv4(),
                    otherUserId: this.asks[i]?.userId!,
                    marketOrderId: this.asks[i]?.orderId!,
                });
            }

        }
        //   if order left after particially filled
        for (let i = 0; i < this.asks.length; i++) {
            if (this.asks[i]?.filled === this.asks[i]?.quantity) {
                this.asks.splice(i, 1);
                i--;
            }
        }
        console.log("executedQty", executedQty, " fills", fills)
        return {
            fills,
            executedQty,
        };
    }

    // @ts-ignore Todo; remove ts-ignore
    matchAsk(order: Order): { fills: Fill[]; executedQty: number } {
        const fills: Fill[] = [];
        let executedQty = 0;

        for (let i = 0; i < this.bids.length; i++) {
            if (this.bids[i]?.price! >= order.price && executedQty < order.quantity) {
                const priceRemaining = Math.min(
                    order.quantity - executedQty,
                    this.bids[i]?.quantity!
                );
                executedQty += priceRemaining;
                // @ts-ignore
                this.bids[i].filled += priceRemaining; // ERROR SOLVED
                fills.push({
                    price: this.bids[i]?.price!,
                    qty: priceRemaining,
                    tradeId: uuidv4(),
                    otherUserId: this.bids[i]?.userId!,
                    marketOrderId: this.bids[i]?.orderId!,
                });
            }
        }
        for (let i = 0; i < this.bids.length; i++) {
            if (this.bids[i]?.filled === this.bids[i]?.quantity) {
                this.bids.splice(i, 1);
                i--;
            }
        }
        return {
            fills,
            executedQty,
        };
    }

    getMarketDepth() {
        const bids: [string, string][] = [];
        const asks: [string, string][] = [];

        const bidsObj: { [key: string]: number } = {}
        const asksObj: { [key: string]: number } = {}

        // bids depth
        for (let i = 0; i < this.bids.length; i++) {
            const order = this.bids[i];
            const bidsObjPriceKey = order?.price.toString()!;

            if (!bidsObj[bidsObjPriceKey]) {
                bidsObj[bidsObjPriceKey] = 0;
            }
            bidsObj[bidsObjPriceKey] += order?.quantity!;
        }

        // asks depth
        for (let i = 0; i < this.asks.length; i++) {
            const order = this.asks[i];
            const asksObjPriceKey = order?.price.toString()!;

            if (!asksObj[asksObjPriceKey]) {
                asksObj[asksObjPriceKey] = 0;
            }
            asksObj[asksObjPriceKey] += order?.quantity!;
        }

        for (const price in bidsObj) {
            bids.push([price, bidsObj[price]?.toString()!]);
        }

        for (const price in asksObj) {
            asks.push([price, asksObj[price]?.toString()!]);
        }

        return {
            bids,
            asks
        };
    }

    getOpenOrders(userId: string): Order[] {
        const bids = this.bids.filter(b => b.userId === userId);
        const asks = this.asks.filter(a => a.userId === userId);

        return [...bids, ...asks];
    }

    cancelBid(order: Order) {
        const index = this.bids.findIndex(b => b.orderId === order.orderId);
        if (index !== -1) {
            const price = this.bids[index]?.price;
            this.bids.splice(index, 1);
            return price;
        }
    }

    cancelAsk(order: Order) {
        const index = this.asks.findIndex(a => a.orderId === order.orderId);
        if (index !== -1) {
            const price = this.asks[index]?.price;
            this.asks.splice(index, 1);
            return price;
        }
    }

    getSnapshot() {
        return {
            bids: this.bids,
            asks: this.asks,
            lastTradeId: this.lastTradeId,
            currentPrice: this.currentPrice
        }
    }
}
