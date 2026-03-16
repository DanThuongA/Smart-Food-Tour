import { Router, type IRouter } from "express";
import { languages } from "../data/languages.js";

const router: IRouter = Router();

// Trả danh sách ngôn ngữ được frontend hỗ trợ.
router.get("/languages", (_req, res) => {
  res.json(languages);
});

export default router;
