import jwt from "jsonwebtoken";
import { AuthRepository } from "../repositories/auth.repository";
import User, { IUser, UserDocument, UserRole } from "../models/user.model";
import { hashToken } from "../utils/hash";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt";
import { Document, DefaultSchemaOptions, Types } from "mongoose";
import crypto from "crypto";

export class AuthService {

  private authRepository = new AuthRepository();

  /**
   * Register User
   */
  async signup(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
  }) {
    const emailExists = await this.authRepository.emailExists(data.email);

    if (emailExists) {
      throw new Error("Email already registered");
    }

    const phoneExists = await this.authRepository.phoneExists(data.phone);

    if (phoneExists) {
      throw new Error("Phone number already registered");
    }

    const user = await this.authRepository.createUser({
      ...data,
      role: data.role ?? UserRole.CUSTOMER,
    });

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      role: user.role,
    });

  // Store hashed refresh token in the user's refreshTokens array
user.refreshTokens.push({
  tokenHash: hashToken(refreshToken),
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
});

// Save the updated user
await user.save();
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  

  /**
   * Login User
   */
  async login(email: string, password: string) {
    const user = await this.authRepository.findByEmail(email);
  
    if (!user) {
      throw new Error("Invalid email or password");
    }
  
    const isValidPassword = await user.comparePassword(password);
  
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }
  
    const accessToken = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);
  
    // Store hashed refresh token
    user.refreshTokens.push({
      tokenHash: this.hashToken(refreshToken),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
  
    user.lastLoginAt = new Date();
  
    await user.save();
  
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    if (!token) {
      throw new Error("Refresh token is required");
    }
  
    // Verify JWT
    const payload = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string
    ) as any;
  
    // Find user with refresh tokens
    const user = await User.findById(payload.userId).select("+refreshTokens");
  
    if (!user) {
      throw new Error("User not found");
    }
  
    // Check whether the token exists
    const hashedToken = this.hashToken(token);
  
    const storedToken = user.refreshTokens.find(
      (t) =>
        t.tokenHash === hashedToken &&
        !t.revokedAt &&
        t.expiresAt > new Date()
    );
  
    if (!storedToken) {
      throw new Error("Invalid refresh token");
    }
  
    // Generate new access token
    const accessToken = this.generateToken(user);
  
    return {
      accessToken,
    };
  }
  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
  private generateRefreshToken(user: UserDocument): string {
    return jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        type: "refresh",
      },
      process.env.JWT_REFRESH_SECRET as string,
      {
        expiresIn: "30d",
      }
    );
  }

  /**
   * Get User Profile
   */
  async getProfile(userId: string) {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Generate JWT
   */
  private generateToken(user: UserDocument): string {
    return generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });
  }
}

