import { db } from "#db/index.ts";
import { sessionsTable, usersTable, type SelectUser } from "#db/schema.ts";
import { count, eq } from "drizzle-orm";
import type {
  AuthPassword,
  AuthResult,
  AuthTokens,
  UserRole,
  UserCreate,
  UserCreateErrorKind,
  AccessTokenErrorKind,
  AuthTokensRotateResult,
  AuthTokensRotate,
} from "m2b-models";
import bcrypt from "bcrypt";
import { err, ok, type Result } from "m2b-utils";
import jwt from "jsonwebtoken";
import { envs } from "#config/envs.ts";
import { addDays } from "date-fns";
import { inject, Injector } from "#utils/inject.ts";
import { TRPCError } from "@trpc/server";
import { match } from "ts-pattern";
import type {} from "../../../m2b-models/src/Auth";
import { timingSafeEqual } from "node:crypto";

export interface JwtClaims {
  sub: string;
  role: UserRole;
}

export class AuthService {
  constructor() {}

  static async authWithAuthPassword({
    email,
    password,
  }: AuthPassword): Promise<AuthResult> {
    const user = (
      await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1)
    ).at(0);

    if (user) {
      if (user.activated) {
        if (!(await bcrypt.compare(password, user.encryptedPassword))) {
          return err("INVALID_CREDENTIALS");
        }

        const authTokens = await this.sign(user);

        await db.insert(sessionsTable).values({
          userId: user.id,
          refreshToken: authTokens.refreshToken,
          expiresAt: authTokens.expiresAt,
        })

        return ok(authTokens);
      } else {
        return err("NOT_ACTIVATED");
      }
    } else {
      return err("INVALID_CREDENTIALS");
    }
  }

  static async sign(user: SelectUser): Promise<AuthTokens> {
    const refreshTokenBuffer = crypto.getRandomValues(new Uint8Array(32));
    const refreshToken = Buffer.from(refreshTokenBuffer).toString("base64");

    return {
      accessToken: jwt.sign(
        { sub: `${user.id}`, role: user.role } satisfies JwtClaims,
        envs.SERVER_SECRET,
        { expiresIn: "5m" }
      ),
      refreshToken,
      expiresAt: addDays(new Date(), 7),
    };
  }

  static async verify(
    accessToken: string
  ): Promise<Result<JwtClaims, AccessTokenErrorKind>> {
    try {
      const claims = jwt.verify(accessToken, envs.SERVER_SECRET) as JwtClaims;

      return ok(claims);
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        return err("EXPIRED");
      } else if (e instanceof jwt.JsonWebTokenError) {
        return err("JSON_WEB_TOKEN_ERROR");
      }
      throw e;
    }
  }

  async createUser(
    user: UserCreate
  ): Promise<Result<SelectUser, UserCreateErrorKind>> {
    return await db.transaction(async (db) => {
      if (
        (
          await db
            .select({ count: count() })
            .from(usersTable)
            .where(eq(usersTable.email, user.email))
        )[0].count > 0
      ) {
        return err("EMAIL_ALREADY_EXISTS");
      }

      const created = await db
        .insert(usersTable)
        .values({
          email: user.email,
          activated: true,
          encryptedPassword: await bcrypt.hash(user.password, 10),
          role: "USER",
        })
        .returning();

      return ok(created.at(0)!);
    });
  }

  static getAuth = async (): Promise<{ userId: number; role: UserRole }> => {
    const { accessToken } = Injector.getContext();

    if (!accessToken) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message:
          'Failed to call `getJwtClaims`. Provide an access token in headers: "Authorization: Bearer <token>"',
      });
    }

    return match(await this.verify(accessToken))
      .with({ success: true }, async ({ data }) => {
        return { userId: Number(data.sub), role: data.role };
      })
      .with({ success: false }, ({ error }) => {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          cause: error,
          message: "Failed to verify access token",
        });
      })
      .exhaustive();
  };

  static getCurrentUser = async (): Promise<SelectUser> => {
    const { userId } = await inject(this.getAuth);

    return (
      await db.select().from(usersTable).where(eq(usersTable.id, userId))
    ).at(0)!;
  };

  static rotateAuthTokens = async ({
    userId,
    refreshToken,
  }: AuthTokensRotate): Promise<AuthTokensRotateResult> => {
    const user = (
      await db.select().from(usersTable).where(eq(usersTable.id, userId))
    ).at(0);

    if (!user) {
      return err("INVALID_USER_ID");
    }

    const sessions = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.userId, userId));

    const targetSession = sessions.find((s) =>
      timingSafeEqual(Buffer.from(s.refreshToken), Buffer.from(refreshToken))
    );

    if (!targetSession) {
      return err("INVALID_REFRESH_TOKEN");
    }

    if (targetSession.expiresAt < new Date()) {
      return err("EXPIRED");
    }

    const authTokens = await this.sign(user);

    await db
      .update(sessionsTable)
      .set({
        refreshToken: authTokens.refreshToken,
        expiresAt: authTokens.expiresAt,
      })
      .where(eq(sessionsTable.id, targetSession.id));

    return ok(authTokens);
  };
}
