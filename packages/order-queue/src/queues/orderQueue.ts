import { logger } from "@opinix/logger";
import { RedisClientType, createClient } from "redis";
import { RedisManager } from "../classes/RedisManager";

let redisClient = RedisManager.getInstance().getClient();

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
        logger.info(`Processing order: ${JSON.stringify(order)}`);
      }
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`Error processing order: ${err.message}`);
      }
    }
  }
};
