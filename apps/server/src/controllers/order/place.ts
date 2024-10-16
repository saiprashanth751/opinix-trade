import prisma from "@repo/db/client";
import { AsyncWrapper } from "../../utils/asynCatch";
import { Request } from "express";
import { ErrorHandler } from "../../utils/wrappers/error.res";
import { type TOrderbookForOrders, EOrderStatus, TOrder } from "@opinix/types";
import { OrderStatus } from "@prisma/client";
import { incomingOrder } from "../../utils/marketMaker";
import { SuccessResponse } from "../../utils/wrappers/success.res";
import { sides } from "@opinix/types";
type TPlaceOrder = {
  userId: string;
  eventId: string;
  side: sides;
  quantity: number;
  price: number;
};

export const placeOrderHandler = AsyncWrapper(
  async (req: Request<{}, {}, TPlaceOrder>, res) => {
    const { userId, eventId, side, quantity, price } = req.body;
    if (
      !userId ||
      !eventId ||
      !quantity ||
      !price ||
      !Object.values(sides).includes(side)
    ) {
      throw new ErrorHandler("Invalid order data", "BAD_REQUEST");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new ErrorHandler("No user found", "NOT_FOUND");
    }

    const orderbook = await prisma.orderBook.findUnique({
      where: {
        eventId: eventId,
      },
      include: {
        yes: true,
        no: true,
      },
    });

    if (!orderbook) {
      throw new ErrorHandler("No orderbook found", "NOT_FOUND");
    }

    if (
      orderbook.topPriceYes === undefined ||
      orderbook.topPriceNo === undefined
    ) {
      throw new ErrorHandler(
        "Order book is missing topPrice data",
        "BAD_REQUEST"
      );
    }

    const orderBook: TOrderbookForOrders = {
      id: orderbook.id,
      eventId: orderbook.eventId,
      topYesPrice: orderbook.topPriceYes,
      topNoPrice: orderbook.topPriceNo,
      yes: orderbook.yes.map((order: TOrder) => ({
        price: order.price,
        quantity: order.quantity,
        id: order.id,
        createdAt: order.createdAt,
        orderBookId: order.orderBookId,
        status: order.status as OrderStatus,
      })),
      no: orderbook.no.map((order: TOrder) => ({
        price: order.price,
        quantity: order.quantity,
        id: order.id,
        createdAt: order.createdAt,
        orderBookId: order.orderBookId,
        status: order.status as OrderStatus,
      })),
    };

    await incomingOrder(userId, side, price, quantity, orderBook);
    let response = new SuccessResponse("Order placed successfully", 200);
    return res.status(response.code).json(response.serialize());
  }
);
