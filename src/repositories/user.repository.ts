import prisma from "../config/prisma";
import { userPublicSelect } from "./user.select";

const USER_UPDATE_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "profileImage",
  "role",
  "isVerified",
  "isActive",
] as const;

export class UserRepository {
  getUsers() {
    return prisma.user.findMany({
      select: userPublicSelect,
      orderBy: { createdAt: "desc" },
    });
  }

  getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });
  }

  findByIds(ids: string[]) {
    return prisma.user.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        profileImage: true,
        isActive: true,
      },
    });
  }

  async updateUser(id: string, data: Record<string, unknown>) {
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const safeData: Record<string, unknown> = {};

    for (const field of USER_UPDATE_FIELDS) {
      if (data[field] !== undefined) {
        safeData[field] = data[field];
      }
    }

    return prisma.user.update({
      where: { id },
      data: safeData,
      select: userPublicSelect,
    });
  }

  deleteUser(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  updateStatus(id: string, isActive: boolean) {
    return prisma.user.update({
      where: { id },
      data: { isActive },
      select: userPublicSelect,
    });
  }
}
