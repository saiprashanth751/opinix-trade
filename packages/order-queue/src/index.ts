import { addToOrderQueue } from "./queues/orderQueue";
import { createClient } from "redis";
import orderWorker from "./queues/orderProcessor";
import { logger } from "@opinix/logger";
import { RedisManager } from "./classes/RedisManager";
import { SubscriberManager } from "./classes/SubscriberManager";
const startWorker = async () => {
  logger.info("WORKER | Starting order worker");
  orderWorker;
};

startWorker();
export { addToOrderQueue, RedisManager, createClient, SubscriberManager };
