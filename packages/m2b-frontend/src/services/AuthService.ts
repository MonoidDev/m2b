import {
  AuthPassword,
  AuthResult,
  AuthTokens,
  AuthTokensRotateResult,
  LoggedOutKind,
} from "m2b-models";
import { match } from "ts-pattern";
import { TypeLocalStorage } from "./TypeLocalStorage";
import { authTrpcClient } from "#config/trpc.ts";
import { err, ok, type Result } from "m2b-utils";
import { jwtDecode } from "jwt-decode";

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
    const { accessToken, refreshToken } = t;
    const exp = jwtDecode(accessToken).exp ?? 0;

    const refreshThreshold = 60;

    // Avoid calling the lock when we will not refresh.
    if (exp - Date.now() / 1000 >= refreshThreshold) {
      return ok(t);
    }

    return await navigator.locks.request("ROTATE_AUTH_TOKENS", async () =>
      match(this.loadAuthTokens())
        .with({ success: true }, async ({ data: t }) => {
          if (exp - Date.now() / 1000 < refreshThreshold) {
            const { sub } = jwtDecode(t.accessToken);

            const result = await authTrpcClient.auth.rotateAuthTokens.mutate({
              userId: Number(sub),
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
