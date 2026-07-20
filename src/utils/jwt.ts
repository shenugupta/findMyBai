import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";


interface JwtPayload {
  userId: string;
  role: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "1d",
  });
};

export const generateRefreshToken = (payload: object) => {
    return jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET as string,
      {
        expiresIn: "7d",
      }
    );
  };

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};