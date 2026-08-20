export const UserRole = {
  CUSTOMER: "CUSTOMER",
  WORKER: "WORKER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const OTPPurpose = {
  SIGNUP: "SIGNUP",
  LOGIN: "LOGIN",
  RESET_PASSWORD: "RESET_PASSWORD",
} as const;

export type OTPPurpose = (typeof OTPPurpose)[keyof typeof OTPPurpose];
