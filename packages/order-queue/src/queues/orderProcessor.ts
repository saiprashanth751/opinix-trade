import { Worker } from "bullmq";
import { RedisManager } from "../classes/RedisManager";
import { Redis } from "ioredis";
import { logger } from "@opinix/logger";
let redisClient = RedisManager.getInstance() as unknown as Redis;
const orderWorker = new Worker(
  "orderQueue",
  async (job) => {
    try {
      logger.info(`Processing order: ${JSON.stringify(job.data)}`);
    } catch (error) {
      if (error instanceof Error)
        console.error(`Error processing order: ${error.message}`);
      else console.error(`Error processing order: ${error}`);
    }
  },
  {
    connection: redisClient,
  }
);

export default orderWorker;
