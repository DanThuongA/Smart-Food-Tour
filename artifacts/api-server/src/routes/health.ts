import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

// Endpoint kiểm tra trạng thái sống của service.
router.get("/healthz", (_req, res) => {
  // Dùng schema để đảm bảo response luôn đúng định dạng.
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
