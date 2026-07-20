import { Schema, model, HydratedDocument, Types } from "mongoose";

export interface IRefreshToken {
  userId: Types.ObjectId;
  tokenHash: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
}

export type RefreshTokenDocument = HydratedDocument<IRefreshToken>;

const RefreshTokenSchema = new Schema<RefreshTokenDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    deviceId: String,

    ipAddress: String,

    userAgent: String,

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    revokedAt: Date,
  },
  {
    timestamps: true,
  }
);

export default model<RefreshTokenDocument>(
  "RefreshToken",
  RefreshTokenSchema
);