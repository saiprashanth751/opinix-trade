import { Queue } from "bullmq";
import getRedisClient from "../config/redisClient";
let redisClient = getRedisClient();
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
