import IORedis, { Redis } from "ioredis";
import "dotenv/config";
const redisUri = process.env.REDIS_URI || "redis://localhost:6379";
let redisParams = {
  maxRetriesPerRequest: null,
};
let redisClient: Redis | null;
const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new IORedis(redisUri, {
      ...redisParams,
    });
    redisClient.on("connect", () => {
      console.info("SERVER | REDIS: Connected to Redis");
    });

    redisClient.on("ready", () => {
      console.info("SERVER | REDIS: Redis connection is ready");
    });

    redisClient.on("error", (err) => {
      console.error("SERVER: ERROR Connecting to Redis", err);
    });

    redisClient.on("close", () => {
      console.warn("SERVER | REDIS: Connection closed");
    });

    redisClient.on("reconnecting", () => {
      console.info("SERVER | REDIS: Reconnecting...");
    });
  }
  return redisClient;
};
export default getRedisClient;
