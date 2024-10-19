import IORedis, { Redis } from "ioredis";
import "dotenv/config";
import { logger } from "@opinix/logger";
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
      logger.info("SERVER | REDIS: Connected to Redis");
    });

    redisClient.on("ready", () => {
      logger.info(
        "SERVER | REDIS: Redis connection is ready to start execution"
      );
    });

    redisClient.on("error", (err) => {
      logger.error("SERVER: ERROR Connecting to Redis", err);
    });

    redisClient.on("close", () => {
      logger.warn("SERVER | REDIS: Connection closed");
    });

    redisClient.on("reconnecting", () => {
      logger.info("SERVER | REDIS: Reconnecting...");
    });
  }
  return redisClient;
};
export default getRedisClient;
