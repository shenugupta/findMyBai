import { WorkerRepository } from "../repositories/worker.repository";
import { AuthRepository } from "../repositories/auth.repository";
import { UserRole } from "../models/user.model";

const AVAILABILITY = ["FULL_TIME", "PART_TIME", "LIVE_IN"] as const;

export class WorkerService {
  private workerRepository = new WorkerRepository();
  private authRepository = new AuthRepository();

  async createProfile(
    userId: string,
    data: {
      bio?: string;
      skills?: string[];
      experienceYears?: number;
      hourlyRate?: number;
      monthlyRate?: number;
      city?: string;
      locality?: string;
      languages?: string[];
      availability?: string;
      services?: string[];
      isAvailable?: boolean;
    }
  ) {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== UserRole.WORKER) {
      throw new Error("Only workers can create a worker profile");
    }

    if (!data.city?.trim()) {
      throw new Error("City is required");
    }

    const availability = data.availability ?? "FULL_TIME";

    if (!AVAILABILITY.includes(availability as (typeof AVAILABILITY)[number])) {
      throw new Error("Availability must be FULL_TIME, PART_TIME, or LIVE_IN");
    }

    const existing = await this.workerRepository.findByUserId(userId);

    if (existing) {
      throw new Error("Worker profile already exists");
    }

    return this.workerRepository.create({
      userId,
      bio: data.bio,
      skills: data.skills ?? [],
      experienceYears: data.experienceYears ?? 0,
      hourlyRate: data.hourlyRate,
      monthlyRate: data.monthlyRate,
      city: data.city.trim(),
      locality: data.locality,
      languages: data.languages ?? [],
      availability,
      services: data.services ?? [],
      isAvailable: data.isAvailable,
    });
  }
}
