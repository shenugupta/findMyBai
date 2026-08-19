import prisma from "../config/prisma";

export interface CreateWorkerProfileData {
  userId: string;
  bio?: string;
  skills: string[];
  experienceYears: number;
  hourlyRate?: number;
  monthlyRate?: number;
  city: string;
  locality?: string;
  languages: string[];
  availability: string;
  services: string[];
  isAvailable?: boolean;
}

const parseJsonArray = (value: string): string[] => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const toProfile = (profile: {
  id: string;
  userId: string;
  bio: string | null;
  skills: string;
  experienceYears: number;
  hourlyRate: number | null;
  monthlyRate: number | null;
  city: string;
  locality: string | null;
  languages: string;
  availability: string;
  services: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  ...profile,
  skills: parseJsonArray(profile.skills),
  languages: parseJsonArray(profile.languages),
  services: parseJsonArray(profile.services),
});

export type WorkerProfileView = ReturnType<typeof toProfile>;

export class WorkerRepository {
  async findByUserId(userId: string) {
    const profile = await prisma.workerProfile.findUnique({
      where: { userId },
    });

    return profile ? toProfile(profile) : null;
  }

  async findAll(): Promise<WorkerProfileView[]> {
    const profiles = await prisma.workerProfile.findMany({
      orderBy: { createdAt: "desc" },
    });

    return profiles.map(toProfile);
  }

  async create(data: CreateWorkerProfileData) {
    const profile = await prisma.workerProfile.create({
      data: {
        userId: data.userId,
        bio: data.bio,
        skills: JSON.stringify(data.skills),
        experienceYears: data.experienceYears,
        hourlyRate: data.hourlyRate,
        monthlyRate: data.monthlyRate,
        city: data.city,
        locality: data.locality,
        languages: JSON.stringify(data.languages),
        availability: data.availability,
        services: JSON.stringify(data.services),
        isAvailable: data.isAvailable ?? true,
      },
    });

    return toProfile(profile);
  }

  async update(userId: string, data: Partial<Omit<CreateWorkerProfileData, "userId">>) {
    const profile = await prisma.workerProfile.update({
      where: { userId },
      data: {
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.skills !== undefined && { skills: JSON.stringify(data.skills) }),
        ...(data.experienceYears !== undefined && {
          experienceYears: data.experienceYears,
        }),
        ...(data.hourlyRate !== undefined && { hourlyRate: data.hourlyRate }),
        ...(data.monthlyRate !== undefined && { monthlyRate: data.monthlyRate }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.locality !== undefined && { locality: data.locality }),
        ...(data.languages !== undefined && {
          languages: JSON.stringify(data.languages),
        }),
        ...(data.availability !== undefined && { availability: data.availability }),
        ...(data.services !== undefined && {
          services: JSON.stringify(data.services),
        }),
        ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
      },
    });

    return toProfile(profile);
  }
}
