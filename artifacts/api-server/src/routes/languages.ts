import { Router, type IRouter } from "express";
import { languages } from "../data/languages.js";

const router: IRouter = Router();

router.get("/languages", (_req, res) => {
  res.json(languages);
});

export default router;
