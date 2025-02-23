import { z } from "zod";
import { result } from "m2b-utils";

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

export const AuthTokenRotateErrorKind = z.enum([
  "INVALID_USER_ID",
  "INVALID_REFRESH_TOKEN",
  "EXPIRED",
]);

export type AuthTokenRotateErrorKind = z.infer<typeof AuthTokenRotateErrorKind>;

export const AuthTokensRotateResult = result(
  AuthTokens,
  AuthTokenRotateErrorKind
);

export type AuthTokensRotateResult = z.infer<typeof AuthTokensRotateResult>;
