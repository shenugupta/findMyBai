import { Schema, model, HydratedDocument } from "mongoose";
import bcrypt from "bcrypt";

export enum UserRole {
  CUSTOMER = "CUSTOMER",
  WORKER = "WORKER",
  ADMIN = "ADMIN",
}

export interface IRefreshToken {
  tokenHash: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
}

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  profileImage?: string;
  lastLoginAt?: Date;
  refreshTokens: IRefreshToken[];
}

export type UserDocument = HydratedDocument<
  IUser & {
    comparePassword(password: string): Promise<boolean>;
  }
>;

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    tokenHash: {
      type: String,
      required: true,
    },

    deviceId: {
      type: String,
      default: "",
    },

    ipAddress: {
      type: String,
      default: "",
    },

    userAgent: {
      type: String,
      default: "",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const UserSchema = new Schema<UserDocument>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
    },

    profileImage: {
      type: String,
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    refreshTokens: {
      type: [RefreshTokenSchema],
      default: [],
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Hash password before save
 */
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compare password
 */
UserSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

const User = model<UserDocument>("User", UserSchema);

export default User;