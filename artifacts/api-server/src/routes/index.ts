import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import venuesRouter from "./venues.js";
import languagesRouter from "./languages.js";
import chatRouter from "./chat.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(venuesRouter);
router.use(languagesRouter);
router.use(chatRouter);

export default router;
