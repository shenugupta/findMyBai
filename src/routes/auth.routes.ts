import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const controller = new AuthController();

// Public
router.post("/signup", controller.signup);
router.post("/login", controller.login);
router.post("/refresh-token", controller.refreshToken);

// Protected
router.get("/profile", authenticate, controller.getProfile);

export default router;