import { addToOrderQueue } from "./queues/orderQueue";
import orderWorker from "./queues/orderProcessor";
import { logger } from "@opinix/logger";
const startWorker = async () => {
  logger.info("WORKER | Starting order worker");
  orderWorker;
};

startWorker();
export { addToOrderQueue };
