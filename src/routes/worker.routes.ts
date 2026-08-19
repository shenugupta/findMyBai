import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { UserRole } from "@prisma/client";
import { WorkerController } from "../controllers/worker.controller";

const router = Router();
const controller = new WorkerController();

router.get("/", authenticate, controller.getWorkers);

router.post(
  "/profile",
  authenticate,
  authorize(UserRole.WORKER),
  controller.createProfile
);

router.get(
  "/profile",
  authenticate,
  authorize(UserRole.WORKER),
  controller.getProfile
);

router.put(
  "/profile",
  authenticate,
  authorize(UserRole.WORKER),
  controller.updateProfile
);

export default router;
