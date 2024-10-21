import { WebSocket } from "ws";
import { subscriptions } from "../../types";
import { SubscriberManager } from "@repo/order-queue";
import { logger } from "@opinix/logger";

let redisSubscriber = SubscriberManager.getInstance();

export function unsubscribeClientFromAll(ws: WebSocket) {
  Object.keys(subscriptions).forEach((key) => {
    unsubscribeClient(ws, key);
  });
}

export function unsubscribeClient(ws: WebSocket, event: string) {
  const eventSub = subscriptions[event];
  if (eventSub && eventSub.has(ws)) {
    eventSub.delete(ws);
  }
  if (eventSub && eventSub.size === 0) {
    delete subscriptions.event;
  }
}

export function subscribeClient(ws: WebSocket, event: string) {
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
  if (eventSub && eventSub.size > 0) {
    eventSub.forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(message);
      }
    });
  }
}
