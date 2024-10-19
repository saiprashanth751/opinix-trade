import express from "express";
import { eventRouter } from "./router/eventRouter";
const app = express();

app.use(express.json());

app.use("/events", eventRouter);

app.listen(3001, () => {
  console.log(`server is runnning on http://localhost:3001`);
});
