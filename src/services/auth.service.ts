import jwt from "jsonwebtoken";
import { UserRole } from "../constants/enums";
import { AuthRepository } from "../repositories/auth.repository";
import { comparePassword, hashPassword, hashToken } from "../utils/hash";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt";

const REFRESH_TOKEN_DAYS = 7;

export class AuthService {
  private authRepository = new AuthRepository();

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
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      password: await hashPassword(data.password),
      role: data.role ?? UserRole.CUSTOMER,
    });

    const tokens = await this.issueTokens(user.id, user.role);

    return {
      user,
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    await this.authRepository.updateLastLogin(user.id);
    const tokens = await this.issueTokens(user.id, user.role);

    const { password: _password, ...publicUser } = user;
    void _password;

    return {
      user: publicUser,
      ...tokens,
    };
  }

  async refreshToken(token: string) {
    if (!token) {
      throw new Error("Refresh token is required");
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string
    ) as { userId: string; role: string };

    const storedToken = await this.authRepository.findValidRefreshToken(
      payload.userId,
      hashToken(token)
    );

    if (!storedToken) {
      throw new Error("Invalid refresh token");
    }

    return {
      accessToken: generateAccessToken({
        userId: storedToken.user.id,
        role: storedToken.user.role,
      }),
    };
  }

  async getProfile(userId: string) {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  private async issueTokens(userId: string, role: UserRole) {
    const accessToken = generateAccessToken({ userId, role });
    const refreshToken = generateRefreshToken({ userId, role });

    await this.authRepository.createRefreshToken({
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(
        Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
      ),
    });

    return { accessToken, refreshToken };
  }
}
