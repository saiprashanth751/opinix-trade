import prisma from "@repo/db/client";
import { redisClient } from "@repo/order-queue";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import orderRouter from "./routes/placeorders"

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/v1/order", orderRouter);

app.get("/", (req, res) => {
  redisClient.connect().then(() => {
    console.log("Connected to Redis");
  });
  res.send("Helo helo");
});

app.listen(3002, () => {
  console.log(`Server is running at http://localhost:3002`);
});
