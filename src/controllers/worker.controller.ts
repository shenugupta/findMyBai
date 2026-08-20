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

  /**
   * GET /api/v1/workers/profile
   */
  getProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const profile = await this.workerService.getProfile(req.user!.userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";

      if (message === "Worker profile not found") {
        res.status(404).json({
          success: false,
          message,
        });
        return;
      }

      next(error);
    }
  };

  /**
   * PUT /api/v1/workers/profile
   */
  updateProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const profile = await this.workerService.updateProfile(
        req.user!.userId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Worker profile updated successfully",
        data: profile,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";

      if (
        message === "Worker profile not found" ||
        message === "City is required" ||
        message === "Availability must be FULL_TIME, PART_TIME, or LIVE_IN"
      ) {
        res.status(message === "Worker profile not found" ? 404 : 400).json({
          success: false,
          message,
        });
        return;
      }

      next(error);
    }
  };

  /**
   * GET /api/v1/workers
   */
  getWorkers = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const location = typeof req.query.location === "string" ? req.query.location : undefined;
      const service = typeof req.query.service === "string" ? req.query.service : undefined;
      const rating =
        typeof req.query.rating === "string" && req.query.rating !== ""
          ? Number(req.query.rating)
          : undefined;
      const experience =
        typeof req.query.experience === "string" && req.query.experience !== ""
          ? Number(req.query.experience)
          : undefined;

      if (rating !== undefined && Number.isNaN(rating)) {
        res.status(400).json({
          success: false,
          message: "rating must be a number",
        });
        return;
      }

      if (experience !== undefined && Number.isNaN(experience)) {
        res.status(400).json({
          success: false,
          message: "experience must be a number",
        });
        return;
      }

      const workers = await this.workerService.getWorkers({
        location,
        service,
        rating,
        experience,
      });

      res.status(200).json({
        success: true,
        data: workers,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/workers/:id
   */
  getWorkerById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const worker = await this.workerService.getWorkerById(
        req.params.id as string
      );

      res.status(200).json({
        success: true,
        data: worker,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";

      if (message === "Worker profile not found") {
        res.status(404).json({
          success: false,
          message,
        });
        return;
      }

      next(error);
    }
  };
}
