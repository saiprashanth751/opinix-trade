import { intiateOrderZodSchema } from "@opinix/zod-schema";
import { AsyncWrapper } from "../../utils/asynCatch";

export const initiateOrderValidator = AsyncWrapper(async (req, res, next) => {
  intiateOrderZodSchema.parse(req.body);
  next();
});
