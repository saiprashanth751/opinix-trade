import { subscriptions } from "../src/index";
import { logger } from "@opinix/logger";
import { SubscriberManager } from "@repo/order-queue";
import "dotenv/config";

let redisSubscriber = SubscriberManager.getInstance();
function unsubscribeClientFromAll(ws: WebSocket) {
  Object.keys(subscriptions).forEach((key) => {
    unsubscribeClient(ws, key);
  });
}

function unsubscribeClient(ws: WebSocket, event: string) {
  const eventSub = subscriptions[event];
  if (eventSub && eventSub.has(ws)) {
    eventSub.delete(ws);
  }
  if (eventSub && eventSub.size === 0) {
    delete subscriptions.event;
  }
}

function subscribeClient(ws: WebSocket, event: string) {
  let eventSub = subscriptions[event];

  if (!eventSub) {
    eventSub = new Set();
    subscriptions[event] = eventSub;
    redisSubscriber.subscribeToChannel(event, broadcastMessage);
    logger.info(`Subscribed to Redis channel: ${event}`);
  }

  eventSub.add(ws);
}

function broadcastMessage(event: string, message: string) {
  const eventSub = subscriptions[event];
  if (eventSub) {
    eventSub.forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        console.log("open");
        ws.send(message);
      }
    });
  }
}

export { unsubscribeClientFromAll, unsubscribeClient, subscribeClient };
