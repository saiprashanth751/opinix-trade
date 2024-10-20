import { WebSocket } from "ws";
import { handleMessage } from "./handleMessage";
import { unsubscribeClientFromAll } from "./subscriptionHandler";
import { logger } from "@opinix/logger";

export function handleConnection(ws: WebSocket) {
  ws.send("connected");

  ws.on("message", (data) => handleMessage(ws, data));
  ws.on("close", () => {
    unsubscribeClientFromAll(ws);
    logger.info(`WebSocket connection closed for ${ws}`);
  });
  ws.on("error", (error) => {
    logger.error(`WebSocket error: ${error.message}`);
  });
}
