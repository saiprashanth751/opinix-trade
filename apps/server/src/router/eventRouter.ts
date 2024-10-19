import { Router } from "express";
import {
  createEventHandler,
  getTradeSummaryHandler,
} from "../controllers/event";
const eventRouter = Router();

// TODO; implement validation middleware inbetween
eventRouter.post("/create", createEventHandler);

eventRouter.get("/tradeSummary", getTradeSummaryHandler);
export { eventRouter };
