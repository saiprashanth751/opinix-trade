import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { router } from "./router";

import http from "http";
import { setupwebsocket } from "./utils/websockets";
import { updateOrderBook } from "./services/orderBookService";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/v1", router);

const server = http.createServer(app);
export const WebsocketServer = setupwebsocket(server);
server.listen(3001, () => {
  console.log(`Server is running on http://localhost:3001`);
});
setInterval(async () => {
  await updateOrderBook();
}, 30000);
