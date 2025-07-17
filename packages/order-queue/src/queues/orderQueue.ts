import { logger } from "@opinix/logger";
import { RedisManager } from "../classes/RedisManager";
import { CREATE_ORDER, MessageFromApi } from "@opinix/types";
let redisClient = RedisManager.getInstance().etClient();
// import { Engine } from "@repo/engine";

const QUEUE_NAME = "ORDER_QUEUE";

export const addToOrderQueue = async (order: object) => {
  try {
    await redisClient.lPush(QUEUE_NAME, JSON.stringify(order));
    logger.info(`Order added to queue: ${JSON.stringify(order)}`);
  } catch (err) {
    if (err instanceof Error)
      logger.error(`Error adding order to queue: ${err.message}`);
  }
};

export const processOrderQueue = async () => {
  while (true) {
    try {
      const order = await redisClient.lPop(QUEUE_NAME);
      if (order) {
        const orderObj: MessageFromApi = JSON.parse(order);
        // const engine = new Engine();
        const userid =
          orderObj.type == CREATE_ORDER ? orderObj.data.userId : null;
        if (!userid) {
          logger.error(`Error processing order: userId not found`);
          continue;
        }
        // engine.processOrders({ message: orderObj, clientId: userid });
      }
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`Error processing order: ${err.message}`);
      }
    }
  }
};
