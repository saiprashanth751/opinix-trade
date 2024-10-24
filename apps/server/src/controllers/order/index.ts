import { addToOrderQueue } from "@repo/order-queue";
import { AsyncWrapper } from "../../utils/asynCatch";
import { SuccessResponse } from "../../utils/wrappers/success.res";
import { sides } from "@opinix/types";
import { Request } from "express";
import { v4 as uuid4 } from "uuid";

type TPlaceOrderReq = {
  event_id: number;
  l1_expected_price: number;
  l1_order_quantity: number;
  offer_type: sides;
  userid: string
};

export const placeHandler = AsyncWrapper(
  async (req: Request<{}, {}, TPlaceOrderReq>, res) => {
    const { event_id, l1_expected_price, l1_order_quantity, offer_type, userid } = req.body;

    // TODO: check Authorize the user

    const data = {
      type: uuid4(),
      data: {
        market: event_id,
        price: l1_expected_price,
        type: "CREATE_ORDER", // type of the order , TODO: need to fix this 
        quantity: l1_order_quantity,
        side: offer_type,
        userId: userid.toString(),
      },
    };

    await addToOrderQueue(data);
    let response = new SuccessResponse("Order placed successfully", 201);
    return res.status(201).json(response);
  }
);
