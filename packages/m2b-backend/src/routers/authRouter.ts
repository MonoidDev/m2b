import { AuthService } from "#services/AuthService.ts";
import { authedProcedure, publicProcedure, router } from "#config/trpc.ts";
import {
  AuthPassword,
  AuthResult,
  AuthTokensRotate,
  AuthTokensRotateResult,
  UserView,
} from "m2b-models";

export const authRouter = router({
  loginWithAuthPassword: publicProcedure
    .input(AuthPassword)
    .output(AuthResult)
    .mutation(async ({ input }): Promise<AuthResult> => {
      return await AuthService.authWithAuthPassword(input);
    }),
  rotateAuthTokens: publicProcedure
    .input(AuthTokensRotate)
    .output(AuthTokensRotateResult)
    .mutation(async ({ input }): Promise<AuthTokensRotateResult> => {
      return await AuthService.rotateAuthTokens(input);
    }),
  getCurrentUser: authedProcedure()
    .output(UserView)
    .query(async (): Promise<UserView> => {
      return await AuthService.getCurrentUser();
    }),
});
