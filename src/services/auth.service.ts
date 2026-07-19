import jwt from "jsonwebtoken";
import { AuthRepository } from "../repositories/auth.repository";
import { UserDocument, UserRole } from "../models/user.model";

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

    const accessToken = this.generateAccessToken(user);

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

    const accessToken = this.generateAccessToken(user);

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
  private generateAccessToken(user: UserDocument): string {
    return jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );
  }
}