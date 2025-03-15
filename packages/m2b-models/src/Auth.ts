import { result } from "m2b-utils";
import { z } from "zod";

export const AuthPassword = z.object({
  email: z.string(),
  password: z.string(),
});

export type AuthPassword = z.infer<typeof AuthPassword>;

export const AuthTokens = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.date(),
});

export type AuthTokens = z.infer<typeof AuthTokens>;

export const AuthErrorKind = z.enum(["INVALID_CREDENTIALS", "NOT_ACTIVATED"]);

export type AuthErrorKind = z.infer<typeof AuthErrorKind>;

export const AuthResult = result(AuthTokens, AuthErrorKind);

export type AuthResult = z.infer<typeof AuthResult>;

export const LoggedOutKind = z.enum([
  "NO_AUTH_TOKENS",
  "INVALID_AUTH_TOKENS",
  "EXPIRED",
]);

export type LoggedOutKind = z.infer<typeof LoggedOutKind>;

export const AccessTokenErrorKind = z.enum(["EXPIRED", "JSON_WEB_TOKEN_ERROR"]);

export type AccessTokenErrorKind = z.infer<typeof AccessTokenErrorKind>;

export const AuthTokensRotate = z.object({
  userId: z.number(),
  refreshToken: z.string(),
});

export type AuthTokensRotate = z.infer<typeof AuthTokensRotate>;

export const SecureSessionErrorKind = z.enum([
  "INVALID_USER_ID",
  "INVALID_REFRESH_TOKEN",
  "EXPIRED",
]);

export type SecureSessionErrorKind = z.infer<typeof SecureSessionErrorKind>;

export const AuthTokensRotateResult = result(
  AuthTokens,
  SecureSessionErrorKind,
);

export type AuthTokensRotateResult = z.infer<typeof AuthTokensRotateResult>;

export const AuthTokensLogout = z.object({
  userId: z.number(),
  refreshToken: z.string(),
  logoutAll: z.boolean(),
});

export type AuthTokensLogout = z.infer<typeof AuthTokensLogout>;

export const AuthTokensLogoutResult = result(
  z.literal(true),
  SecureSessionErrorKind,
);

export type AuthTokensLogoutResult = z.infer<typeof AuthTokensLogoutResult>;
