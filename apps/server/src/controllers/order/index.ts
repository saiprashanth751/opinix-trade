import { addToOrderQueue } from "@repo/order-queue";
import { AsyncWrapper } from "../../utils/asynCatch";
import { generateOrderId } from "../../utils/utils";
import { SuccessResponse } from "../../utils/wrappers/success.res";
import { sides } from "@opinix/types";
import { Request } from "express";
import { RedisManager } from "@repo/order-queue";
import { ErrorHandler } from "../../utils/wrappers/error.res";
import { CREATE_ORDER } from "@opinix/types";
import { MessageFromApi } from "@opinix/types";

type TPlaceOrderReq = {
  event_id: number;
  l1_expected_price: number;
  l1_order_quantity: number;
  offer_type: sides;
};

export const placeHandler = AsyncWrapper(
<<<<<<< Updated upstream
  async (req: Request<{}, {}, TPlaceOrder>, res) => {
    const { event_id, l1_expected_price, l1_order_quantity, offer_type } = req.body;

    const orderId = generateOrderId();
    console.log(orderId);
    
    const order = {
      [orderId]: {
        event_id: event_id,
        l1_expected_price: l1_expected_price,
        l1_order_quantity: l1_order_quantity,
        offer_type: offer_type,
      },
    };
    await addToOrderQueue(order);
    redisClient.publishMessage(orderId, order);
=======
  async (req: Request<{}, {}, TPlaceOrderReq>, res) => {
    const { event_id, l1_expected_price, l1_order_quantity, offer_type } =
      req.body;

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new ErrorHandler("Unauthorized", "AUTHENTICATION_FAILED");
    }

    // TODO: decode the token and get the number for now hardcoded
    let userid = 1;
    const data: MessageFromApi = {
      type: CREATE_ORDER,
      data: {
        market: event_id.toString(),
        price: l1_expected_price,
        quantity: l1_order_quantity,
        side: offer_type,
        userId: userid.toString(),
      },
    };

    await addToOrderQueue(data);
>>>>>>> Stashed changes
    let response = new SuccessResponse("Order placed successfully", 201);
    return res.status(201).json(response);
  }
);
