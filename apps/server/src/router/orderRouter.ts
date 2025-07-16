import { Router } from "express";
import { initiateOrderValidator } from "../middlewares/validators/initiate.validator";
import { placeHandler } from "../controllers/order";

const orderRouter = Router();

orderRouter.post("/initiate", initiateOrderValidator, placeHandler);
export { orderRouter };
