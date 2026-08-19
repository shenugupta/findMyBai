import { OTPPurpose } from "@prisma/client";
import prisma from "../config/prisma";

export class OTPRepository {
  async createOTP(phone: string, otpHash: string, purpose: OTPPurpose) {
    await prisma.otp.deleteMany({
      where: { phone, purpose },
    });

    return prisma.otp.create({
      data: {
        phone,
        otpHash,
        purpose,
        attempts: 0,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
  }

  async findOTP(phone: string, purpose: OTPPurpose) {
    return prisma.otp.findFirst({
      where: { phone, purpose },
    });
  }

  async incrementAttempts(id: string) {
    return prisma.otp.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  }

  async deleteOTP(phone: string, purpose: OTPPurpose) {
    return prisma.otp.deleteMany({
      where: { phone, purpose },
    });
  }
}
