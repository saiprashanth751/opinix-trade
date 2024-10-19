import { WebSocketServer } from "ws";
import { logger } from "@opinix/logger";
const wss = new WebSocketServer({ port: 3002 });

logger.info("WEB_SOCKET_SERVER | Starting WebSocket server");
wss.on("connection", function connection(ws) {
  ws.on("error", console.error);
  logger.info("WebSocket connection established");

  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });

  ws.send("ws connected");

  wss.on("listening", () => {
    console.log("WebSocket server is running on port 3002");
  });
});

export default wss;
