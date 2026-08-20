import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { UserRole } from "../constants/enums";
import { UserController } from "../controllers/user.controller";

const router = Router();
const controller = new UserController();

router.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  controller.getUsers
);

router.get(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  controller.getUserById
);

router.put(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  controller.updateUser
);

router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  controller.deleteUser
);

router.patch(
  "/:id/status",
  authenticate,
  authorize(UserRole.ADMIN),
  controller.updateStatus
);

export default router;