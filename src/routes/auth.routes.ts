import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";
import { Response, NextFunction } from "express";
import { UserRole } from "../constants/enums";

export const authorize =
  (...roles: UserRole[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };

const router = Router();
const controller = new AuthController();

// Public
router.post("/signup", controller.signup);
router.post("/login", controller.login);
router.post("/refresh-token", controller.refreshToken);


// Protected
router.get("/profile", authenticate, controller.getProfile);

export default router;