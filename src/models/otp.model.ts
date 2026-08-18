// src/models/otp.model.ts

import { Schema, model } from "mongoose";

export enum OTPPurpose {
  SIGNUP = "SIGNUP",
  LOGIN = "LOGIN",
  RESET_PASSWORD = "RESET_PASSWORD",
}

export interface IOTP {
  phone: string;
  otpHash: string;
  purpose: OTPPurpose;
  attempts: number;
  expiresAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
      select: false,
    },
    purpose: {
      type: String,
      enum: Object.values(OTPPurpose),
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Auto-delete expired OTP documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model<IOTP>("OTP", otpSchema);