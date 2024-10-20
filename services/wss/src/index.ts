import { createWebSocketServer } from "./server/websockerserver";
import { logger } from "@opinix/logger";
const port = 3002;
createWebSocketServer(port);

logger.info(`WEB_SOCKET_SERVER | WebSocket server listening at ${port}`);
