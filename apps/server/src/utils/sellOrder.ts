import { WebsocketServer } from "../router/websockets";
import prisma from "./db";

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
      }else{
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
      return;
    }
  }
 
}
