import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";


export class AuthController {
  private authService = new AuthService();

  /**
   * POST /api/v1/auth/signup
   */
  signup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
        console.log("Signup API called");
      const result = await this.authService.signup(req.body);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
      });
    } catch (error) {
        console.log("Signup API called");
      next(error);
    }
  };

  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { refreshToken } = req.body;
  
      const result = await this.authService.refreshToken(refreshToken);
  
      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/auth/login
   */
  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login(email, password);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/auth/profile
   */

  getProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = await this.authService.getProfile(req.user!.userId);
  
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
}