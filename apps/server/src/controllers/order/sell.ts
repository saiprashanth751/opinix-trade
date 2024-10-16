import { AsyncWrapper } from "../../utils/asynCatch";
import { Request } from "express";
import prisma from "@repo/db/client";
import { ErrorHandler } from "../../utils/wrappers/error.res";
import { sellOrder } from "../../utils/sellOrder";
import { sides } from "@opinix/types";
import { SuccessResponse } from "../../utils/wrappers/success.res";
type TSellOrder = {
  tradeId: string;
  eventId: string;
  side: sides;
  quantity: number;
  price: number;
};
export const sellOrderHandler = AsyncWrapper(
  async (req: Request<{}, {}, TSellOrder>, res) => {
    const { tradeId, eventId, side, quantity, price } = req.body;
    if (!tradeId || !eventId || !side || !quantity || !price) {
      return new ErrorHandler("Invalid order data", "BAD_REQUEST");
    }
    const trade = await prisma.trade.findUnique({
      where: {
        id: tradeId,
      },
      include: {
        event: true,
      },
    });
    if (!trade) {
      return new ErrorHandler("No trade found", "NOT_FOUND");
    }
    if (trade.status != "ACTIVE") {
      return new ErrorHandler("Trade is already been settled", "BAD_REQUEST");
    }
    if (trade.event.status !== "ONGOING") {
      return new ErrorHandler("Event is not ongoing", "BAD_REQUEST");
    }
    if (trade.price !== price || trade.quantity !== quantity) {
      return res.status(400).json({
        error: "Trade price or quantity does not match the stored trade data",
      });
    }

    const orderbook = await prisma.event.findUnique({
      where: {
        id: trade.eventId,
      },
      include: {
        orderBook: {
          include: {
            yes: true,
            no: true,
          },
        },
      },
    });
    if (!orderbook?.orderBook) {
      return new ErrorHandler(
        "Order book not found for this event",
        "BAD_REQUEST"
      );
    }
    if (!orderbook.orderBook.topPriceNo || !orderbook.orderBook.topPriceYes) {
      return new ErrorHandler("Top price not found", "BAD_REQUEST");
    }
    const { topPriceYes, topPriceNo } = orderbook.orderBook;
    const sellResult = await sellOrder(
      tradeId,
      eventId,
      side,
      quantity,
      price,
      orderbook.orderBook,
      topPriceYes,
      topPriceNo
    );

    if (!sellResult.success) {
      return new ErrorHandler(
        "Order can't be processed at the moment",
        "BAD_REQUEST"
      );
    }
    let response = new SuccessResponse("Order placed successfully", 200);
    return res.status(response.code).json(response.serialize());
  }
);
