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
  rating?: number;
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
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  ...profile,
  skills: parseJsonArray(profile.skills),
  languages: parseJsonArray(profile.languages),
  services: parseJsonArray(profile.services),
});

export type WorkerProfileView = ReturnType<typeof toProfile>;

const workerUserSelect = {
  firstName: true,
  lastName: true,
  phone: true,
  profileImage: true,
  isActive: true,
} as const;

type WorkerUser = {
  firstName: string;
  lastName: string;
  phone: string;
  profileImage: string | null;
  isActive: boolean;
};

type WorkerWithUser = WorkerProfileView & { user: WorkerUser };

export interface WorkerListFilters {
  location?: string;
  service?: string;
  rating?: number;
  experience?: number;
}

export class WorkerRepository {
  async findByUserId(userId: string) {
    const profile = await prisma.workerProfile.findUnique({
      where: { userId },
    });

    return profile ? toProfile(profile) : null;
  }

  async findById(id: string) {
    const profile = await prisma.workerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: workerUserSelect,
        },
      },
    });

    if (!profile) {
      return null;
    }

    return {
      ...toProfile(profile),
      user: profile.user,
    } as WorkerWithUser;
  }

  async findAll(filters: WorkerListFilters = {}): Promise<WorkerWithUser[]> {
    const where: Record<string, unknown> = {};
    const and: Record<string, unknown>[] = [];

    if (filters.experience !== undefined) {
      and.push({ experienceYears: { gte: filters.experience } });
    }

    if (filters.rating !== undefined) {
      and.push({ rating: { gte: filters.rating } });
    }

    if (filters.location) {
      and.push({
        OR: [
          { city: { contains: filters.location } },
          { locality: { contains: filters.location } },
        ],
      });
    }

    if (filters.service) {
      and.push({ services: { contains: filters.service } });
    }

    if (and.length > 0) {
      where.AND = and;
    }

    const profiles = await prisma.workerProfile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: workerUserSelect,
        },
      },
    });

    return profiles
      .map((profile: { user: WorkerUser } & Parameters<typeof toProfile>[0]) => ({
        ...toProfile(profile),
        user: profile.user,
      }))
      .filter((profile: WorkerWithUser) => {
        if (filters.location) {
          const location = filters.location.toLowerCase();
          const city = profile.city.toLowerCase();
          const locality = (profile.locality ?? "").toLowerCase();
          if (!city.includes(location) && !locality.includes(location)) {
            return false;
          }
        }

        if (filters.service) {
          const service = filters.service.toLowerCase();
          const inServices = profile.services.some((item) =>
            item.toLowerCase().includes(service)
          );
          const inSkills = profile.skills.some((item) =>
            item.toLowerCase().includes(service)
          );
          if (!inServices && !inSkills) {
            return false;
          }
        }

        return true;
      });
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
        rating: data.rating ?? 0,
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
        ...(data.rating !== undefined && { rating: data.rating }),
      },
    });

    return toProfile(profile);
  }
}
