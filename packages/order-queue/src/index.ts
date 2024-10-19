import { addToOrderQueue } from "./queues/orderQueue";
import orderWorker from "./queues/orderProcessor";
const startWorker = async () => {
  console.log("Starting Order Queue Worker...");
  orderWorker;
};

startWorker();
export { addToOrderQueue };
