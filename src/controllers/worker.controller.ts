import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { WorkerService } from "../services/worker.service";

export class WorkerController {
  private workerService = new WorkerService();

  /**
   * POST /api/v1/workers/profile
   */
  createProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const profile = await this.workerService.createProfile(
        req.user!.userId,
        req.body
      );

      res.status(201).json({
        success: true,
        message: "Worker profile created successfully",
        data: profile,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";

      if (
        message === "Worker profile already exists" ||
        message === "City is required" ||
        message === "Availability must be FULL_TIME, PART_TIME, or LIVE_IN" ||
        message === "Only workers can create a worker profile" ||
        message === "User not found"
      ) {
        const status =
          message === "Worker profile already exists"
            ? 409
            : message === "User not found"
              ? 404
              : message === "Only workers can create a worker profile"
                ? 403
                : 400;

        res.status(status).json({
          success: false,
          message,
        });
        return;
      }

      next(error);
    }
  };
}
