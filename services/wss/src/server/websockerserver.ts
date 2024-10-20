import { WebSocketServer } from "ws";
import { handleConnection } from "./handler/connectionHandler";
export function createWebSocketServer(port: number) {
  const wss = new WebSocketServer({ port });

  wss.on("connection", handleConnection);

  return wss;
}
