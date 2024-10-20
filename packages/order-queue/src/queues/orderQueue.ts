import { Queue } from "bullmq";
import Redis from "ioredis";
import { RedisManager } from "../classes/RedisManager";
let redisClient = RedisManager.getInstance() as unknown as Redis;
export const orderQueue = new Queue("orderQueue", {
  connection: redisClient,
});

export const addToOrderQueue = async (order: object) => {
  await orderQueue.add("order", order, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  });
};
