import prisma from "@repo/db/client";
import { OrderbookForOrders } from "../utils/marketMaker";
import { TOrderbookForOrders } from "@opinix/types";

export async function updateOrderbookAfterBid(orderbook: TOrderbookForOrders) {
  try {
    await prisma.orderBook.update({
      where: {
        id: orderbook.id,
      },
      data: {
        topPriceNo: orderbook.topNoPrice,
        topPriceYes: orderbook.topYesPrice,
        yes: {
          updateMany: orderbook.yes.map((order) => ({
            where: {
              id: order.id,
            },
            data: {
              quantity: order.quantity,
            },
          })),
        },
        no: {
          updateMany: orderbook.no.map((order) => ({
            where: {
              id: order.id,
            },
            data: {
              quantity: order.quantity,
            },
          })),
        },
      },
    });
  } catch (e) {
    console.log("error updating the orderbook", e);
  }
}
