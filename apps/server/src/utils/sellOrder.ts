import { WebsocketServer } from "../router/websockets";
import prisma from "@repo/db/client";

interface Order {
  id: string;
  quantity: number;
  price: number;
  createdAt: Date;
  status: "PENDING" | "PLACED";
}

interface OrderBook {
  yes: Order[];
  no: Order[];
}
export async function sellOrder(
  tradeId: string,
  eventId: string,
  side: "yes" | "no",
  quantity: number,
  price: number,
  orderbook: OrderBook,
  topPriceYes: number,
  topPriceNo: number
) {
  const oppositeSide = side === "yes" ? "no" : "yes";
  const oppositeOrder = orderbook[oppositeSide];
  oppositeOrder.sort((a, b) => a.price - b.price);

  for (let order of oppositeOrder) {
    if (order.quantity >= quantity) {
      order.quantity -= quantity;

      if (side === "yes") {
        await prisma.noOrder.update({
          where: {
            id: order.id,
          },
          data: {
            quantity: {
              decrement: quantity,
            },
          },
        });
      } else {
        await prisma.yesOrder.update({
          where: {
            id: order.id,
          },
          data: {
            quantity: {
              decrement: quantity,
            },
          },
        });
      }
      const gainLoss = 10 * quantity - (price + order.price) * quantity;
      await prisma.trade.update({
        where: {
          id: tradeId,
        },
        data: {
          status: "PAST",
          gainloss: gainLoss,
        },
      });

      WebsocketServer.broadcast(eventId, {
        orderBook: {
          yes: orderbook.yes.map((order) => ({
            price: order.price,
            quantity: order.quantity,
          })),
          no: orderbook.no.map((order) => ({
            price: order.price,
            quantity: order.quantity,
          })),
          topPriceYes: topPriceYes,
          topPriceNo: topPriceNo,
        },
      });

      const trade = await prisma.trade.findUnique({
        where: {
          id: tradeId,
        },
        include: {
          portfolio: {
            include: {
              user: true,
            },
          },
        },
      });
      await prisma.user.update({
        where: {
          id: trade?.portfolio.userId,
        },
        data: {
          balance: order.price * quantity,
        },
      });

      return { success: true, message: "Order executed successfully." };
    }
  }
  return {
    success: false,
    message: "Order execution failed: insufficient opposite orders.",
  };
}
