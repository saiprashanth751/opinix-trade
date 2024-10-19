import { Worker } from "bullmq";
import getRedisClient from "../config/redisClient";
let redisClient = getRedisClient();

const orderWorker = new Worker(
  "orderQueue",
  async (job) => {
    try {
      console.log(`Processing order: ${JSON.stringify(job.data)}`);
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
