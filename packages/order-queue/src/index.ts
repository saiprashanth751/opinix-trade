import { addToOrderQueue } from "./queues/orderQueue";
import { createClient } from "redis";
import { processOrderQueue } from "./queues/orderQueue";
import { logger } from "@opinix/logger";
import { RedisManager } from "./classes/RedisManager";
import { SubscriberManager } from "./classes/SubscriberManager";
const startWorker = async () => {
  logger.info("WORKER | Starting order worker");
  processOrderQueue;
};

startWorker();
export { addToOrderQueue, RedisManager, createClient, SubscriberManager };
