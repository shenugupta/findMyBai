import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import User from "../models/user.model";

interface IdParams {
  id: string;
}

export class UserController {
  private userService = new UserService();

  /**
   * GET /api/v1/users
   */
  getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const users = await this.userService.getUsers();

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/users/:id
   */
  getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = req.params.id as string;
  
      const user = await this.userService.getUserById(id);
  
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/users/:id
   */
  updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = String(req.params.id);
  
      const user = await this.userService.updateUser(id, req.body);
  
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }
  
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
  /**
   * DELETE /api/v1/users/:id
   */
  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
  
    await this.userService.deleteUser(id);
  
    res.json({
      success: true,
    });
  };

  /**
   * PATCH /api/v1/users/:id/status
   */
 updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  const user = await this.userService.updateStatus(
    id,
    req.body.isActive
  );

  res.json({
    success: true,
    data: user,
  });
};
}