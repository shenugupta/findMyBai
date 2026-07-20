import jwt from "jsonwebtoken";
import { AuthRepository } from "../repositories/auth.repository";
import { UserDocument, UserRole } from "../models/user.model";
import { generateAccessToken } from "../utils/jwt";

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

    const accessToken = this.generateToken(user);

    return {
      user,
      accessToken,
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

    await this.authRepository.updateLastLogin(user._id.toString());

    const accessToken = this.generateToken(user);

    return {
      user,
      accessToken,
    };
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

