import { UserRole } from "../constants/enums";
import prisma from "../config/prisma";
import { userPublicSelect } from "./user.select";

export class AuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
  }) {
    return prisma.user.create({
      data,
      select: userPublicSelect,
    });
  }

  async findByPhone(phone: string) {
    return prisma.user.findUnique({
      where: { phone },
    });
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  }

  async phoneExists(phone: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { phone },
      select: { id: true },
    });
    return !!user;
  }

  async findById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: userPublicSelect,
    });
  }

  async createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({ data });
  }

  async findValidRefreshToken(userId: string, tokenHash: string) {
    return prisma.refreshToken.findFirst({
      where: {
        userId,
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: userPublicSelect,
        },
      },
    });
  }

  async verifyUser(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
      select: userPublicSelect,
    });
  }

  async updatePassword(userId: string, hashedPassword: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: userPublicSelect,
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }
}
