import { addToOrderQueue } from "@repo/order-queue";
import { AsyncWrapper } from "../../utils/asynCatch";
import { generateOrderId } from "../../utils/utils";
import { SuccessResponse } from "../../utils/wrappers/success.res";
import { EOrderType } from "@opinix/types";
import { Request } from "express";
import { RedisManager } from "@repo/order-queue";

let redisClient = RedisManager.getInstance();
type TPlaceOrder = {
  event_id: number;
  l1_expected_price: number;
  l1_order_quantity: number;
  offer_type: EOrderType;
};
export const placeHandler = AsyncWrapper(
  async (req: Request<{}, {}, TPlaceOrder>, res) => {
    const { event_id, l1_expected_price, l1_order_quantity, offer_type } =
      req.body;
    let orderId = generateOrderId();

    const order = {
      [orderId]: {
        event_id: event_id,
        l1_expected_price: l1_expected_price,
        l1_order_quantity: l1_order_quantity,
        offer_type: offer_type,
      },
    };
    await addToOrderQueue(order);
    redisClient.publishMessage("123", order);
    let response = new SuccessResponse("Order placed successfully", 201);
    return res.status(201).json(response);
  }
);
