import { Router } from "express";
import { intializeOrderBookHandler } from "../controllers/orderbook";
import { placeOrderHandler, sellOrderHandler } from "../controllers/order";
const router = Router();

/**
 * @description - Intialize the orderbook with dummy values
 * @param {string} eventId - Event id
 *
 * prev - /intiliaze
 */
router.post("/orderbook/intialize", intializeOrderBookHandler);
/**
 * @description - Place an order
 * prev - /place-order
 */
router.post("/order/place", placeOrderHandler);
/**
 * @description - Sell an order
 * prev - /sell-order
 */
router.post("/order/sell", sellOrderHandler);

export { router };
