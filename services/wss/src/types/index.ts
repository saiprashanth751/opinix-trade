import { WebSocket } from "ws";

export type TWebSocketMessage = {
  data: [EActionEvent, number];
};

export enum EActionEvent {
  SUBSCRIBE = "subscribe_orderbook",
  UNSUBSCRIBE = "unsubscribe_orderbook",
}

export type TSubscription = {
  [key: string]: Set<WebSocket>;
};

export const subscriptions: TSubscription = {};
