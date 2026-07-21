import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

if (!JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET is not defined");
}

export const generateAccessToken = (
  payload: JwtPayload
): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const generateRefreshToken = (
  payload: JwtPayload
): string => {
  return jwt.sign(
    {
      ...payload,
      type: "refresh",
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export const verifyAccessToken = (
  token: string
): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (
  token: string
): JwtPayload & { type: string } => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload & {
    type: string;
  };
};