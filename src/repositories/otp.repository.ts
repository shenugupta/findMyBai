// src/repositories/otp.repository.ts

import OTP, { OTPPurpose } from "../models/otp.model";

export class OTPRepository {

  async createOTP(
    phone: string,
    otpHash: string,
    purpose: OTPPurpose
  ) {
    await OTP.deleteMany({ phone, purpose });

    return OTP.create({
      phone,
      otpHash,
      purpose,
      attempts: 0,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });
  }

  async findOTP(
    phone: string,
    purpose: OTPPurpose
  ) {
    return OTP.findOne({
      phone,
      purpose,
    }).select("+otpHash");
  }

  async incrementAttempts(id: string) {
    return OTP.findByIdAndUpdate(
      id,
      { $inc: { attempts: 1 } },
      { new: true }
    );
  }

  async deleteOTP(
    phone: string,
    purpose: OTPPurpose
  ) {
    return OTP.deleteMany({
      phone,
      purpose,
    });
  }
}