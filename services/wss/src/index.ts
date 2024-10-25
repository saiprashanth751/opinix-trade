import { WebSocketServer } from "ws";
import { config } from "dotenv";
import { UserManager } from "./classes/UserManager";
config();

const port = process.env.PORT as unknown as number;
const wss = new WebSocketServer({ port: port });

wss.on("listening", () => {
    console.log(`WebSocket server is running on port ws://localhost:${wss.options.port}`);
});

wss.on("connection", (ws) => {
    UserManager.getInstance().addUser(ws);
});

