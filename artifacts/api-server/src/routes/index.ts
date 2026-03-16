import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import venuesRouter from "./venues.js";
import languagesRouter from "./languages.js";
import chatRouter from "./chat.js";
import authRouter from "./auth.js";

const router: IRouter = Router();

// Gắn toàn bộ module route vào router gốc của API.
router.use(healthRouter);
router.use(venuesRouter);
router.use(languagesRouter);
router.use(chatRouter);
router.use(authRouter);

export default router;
