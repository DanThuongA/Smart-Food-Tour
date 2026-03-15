import { Router, type IRouter } from "express";
import { processChatMessage } from "../services/chatService.js";

const router: IRouter = Router();

router.post("/chat/message", (req, res) => {
  const { message, lang, userLat, userLng, context } = req.body;

  if (!message || !lang) {
    res.status(400).json({ error: "bad_request", message: "message and lang are required" });
    return;
  }

  const result = processChatMessage({ message, lang, userLat, userLng, context });
  res.json(result);
});

export default router;
