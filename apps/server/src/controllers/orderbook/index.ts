/**
 * @description - Intialize the orderbook with dummy values
 */
import { AsyncWrapper } from "../../utils/asynCatch";
import { ErrorHandler } from "../../utils/wrappers/error.res";
import { fillOrderBook } from "../../utils/marketMaker";
import { WebsocketServer } from "../../utils/websockets";
import prisma from "@repo/db/client";
import { SuccessResponse } from "../../utils/wrappers/success.res";

export const intializeOrderBookHandler = AsyncWrapper(
  async (req, res, next) => {
    const { eventId } = req.body;
    // TODO - Remove db usage and use in memory data structure
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      throw new ErrorHandler("No event found", "NOT_FOUND");
    }

    const orderBook = fillOrderBook();
    await prisma.orderBook.create({
      data: {
        eventId: event.id,
        topPriceYes: orderBook.topYesPrice,
        topPriceNo: orderBook.topNoPrice,
        yes: {
          create: orderBook.yes.map((order) => ({
            price: order.price,
            quantity: order.quantity,
            status: "PLACED",
          })),
        },
        no: {
          create: orderBook.no.map((order) => ({
            price: order.price,
            quantity: order.quantity,
            status: "PLACED",
          })),
        },
      },
    });
    WebsocketServer.broadcast(eventId, {
      orderbook: {
        yes: orderBook.yes,
        no: orderBook.no,
        topYesPrice: orderBook.topYesPrice,
        topNoPrice: orderBook.topNoPrice,
      },
    });

    let response = new SuccessResponse(
      "Order book initialized successfully",
      200
    );
    return res.status(response.code).json(response);
  }
);
