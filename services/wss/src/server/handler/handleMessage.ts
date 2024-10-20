import { RawData, WebSocket } from "ws";
import { EActionEvent, TWebSocketMessage } from "../../types";
import { subscribeClient, unsubscribeClient } from "./subscriptionHandler";
import { logger } from "@opinix/logger";

export function handleMessage(ws: WebSocket, data: RawData) {
  let message: TWebSocketMessage;

  try {
    message = JSON.parse(data.toString()) as TWebSocketMessage;
  } catch (e) {
    logger.error("WEB_SOCKET_SERVER | Error parsing message", e);
    ws.send(JSON.stringify({ error: "Invalid message" }));
    return;
  }

  const [action, eventCode] = message.data;
  if (action === EActionEvent.SUBSCRIBE && eventCode) {
    subscribeClient(ws, eventCode.toString());
  }

  if (action === EActionEvent.UNSUBSCRIBE && eventCode) {
    unsubscribeClient(ws, eventCode.toString());
  }
}
