import {
  AuthPassword,
  AuthResult,
  AuthTokens,
  AuthTokensLogoutResult,
  AuthTokensRotateResult,
  LoggedOutKind,
} from "m2b-models";
import { match } from "ts-pattern";
import { TypeLocalStorage } from "./TypeLocalStorage";
import { authTrpcClient } from "#config/trpc.ts";
import { err, ok, type Result } from "m2b-utils";
import { jwtDecode } from "jwt-decode";
import { differenceInSeconds } from "date-fns";

const AUTH_TOKENS_KEY = "AUTH_TOKENS_KEY";

export class AuthService {
  static loadAuthTokens() {
    return TypeLocalStorage.get(AuthTokens, AUTH_TOKENS_KEY);
  }

  static storeAuthTokens(authTokens: AuthTokens) {
    return TypeLocalStorage.set(AUTH_TOKENS_KEY, authTokens);
  }

  static removeAuthTokens() {
    return TypeLocalStorage.remove(AUTH_TOKENS_KEY);
  }

  static use() {
    return TypeLocalStorage.useKey(AuthTokens, AUTH_TOKENS_KEY);
  }

  static useIsAuthed(): Result<true, LoggedOutKind> {
    return match(this.use())
      .returnType<Result<true, LoggedOutKind>>()
      .with({ success: true }, () => {
        return ok(true);
      })
      .with({ success: false }, () => {
        if (localStorage.getItem(AUTH_TOKENS_KEY) === null) {
          return err("NO_AUTH_TOKENS");
        } else {
          return err("INVALID_AUTH_TOKENS");
        }
      })
      .exhaustive();
  }

  static async login(authPassword: AuthPassword): Promise<AuthResult> {
    const r =
      await authTrpcClient.auth.loginWithAuthPassword.mutate(authPassword);
    if (r.success) {
      this.storeAuthTokens(r.data);
    }
    return r;
  }

  static parseAuthTokens(t: AuthTokens): {
    accessTokenExp: Date;
    userId: number;
  } {
    const { sub, exp } = jwtDecode(t.accessToken);

    return {
      accessTokenExp: new Date(exp ?? 0 * 1000),
      userId: Number(sub),
    };
  }

  static async logout(
    authPassword: AuthTokens
  ): Promise<AuthTokensLogoutResult> {
    const { userId } = this.parseAuthTokens(authPassword);

    const r = await authTrpcClient.auth.logout.query({
      userId,
      refreshToken: authPassword.refreshToken,
      logoutAll: true,
    });
    if (r.success) {
      this.removeAuthTokens();
    }
    return r;
  }

  /**
   * Rotate the refresh token and access token if the access token is nearly expired.
   *
   * For apps running in different tabs,
   * they share the same session,
   * so the refresh-token rotation must be atomic,
   * against a write-write race condition.
   */
  static async maybeRotateAuthTokens(
    t: AuthTokens
  ): Promise<AuthTokensRotateResult> {
    const { refreshToken } = t;
    const exp = this.parseAuthTokens(t);

    const refreshThreshold = 60;

    // Avoid calling the lock when we will not refresh.
    if (
      differenceInSeconds(exp.accessTokenExp, new Date()) >= refreshThreshold
    ) {
      return ok(t);
    }

    return await navigator.locks.request("ROTATE_AUTH_TOKENS", async () =>
      match(this.loadAuthTokens())
        .with({ success: true }, async ({ data: t }) => {
          const { userId, accessTokenExp } = this.parseAuthTokens(t);

          if (
            differenceInSeconds(accessTokenExp, new Date()) < refreshThreshold
          ) {
            const result = await authTrpcClient.auth.rotateAuthTokens.mutate({
              userId,
              refreshToken,
            });

            if (!result.success) {
              this.removeAuthTokens();
            } else {
              this.storeAuthTokens(result.data);
            }

            return result;
          } else {
            return ok(t);
          }
        })
        .otherwise(() => {
          console.error("Could not load auth tokens");
        })
    );
  }
}
