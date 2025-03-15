import { initTRPC, TRPCError } from "@trpc/server";
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import type { UserRole } from "m2b-models";
import { transformer } from "m2b-utils";

import { AuthService } from "#services/AuthService.ts";
import { inject, Injector, type InjectorContext } from "#utils/inject.ts";

export interface Context {
  "~injectorContext": InjectorContext;
}

export const createContext = (context: CreateHTTPContextOptions): Context => {
  return {
    "~injectorContext": {
      accessToken: context.req.headers.authorization?.replace("Bearer ", ""),
    },
  };
};

const t = initTRPC.context<Context>().create({
  transformer,
});

export const router = t.router;
export const publicProcedure = t.procedure.use(async (opts) =>
  Injector.runWithContext(opts.ctx["~injectorContext"], () =>
    opts.next({
      ctx: opts.ctx,
    }),
  ),
);

export const authedProcedure = ({
  roles,
}: {
  /**
   * Which roles can access? By default, all roles.
   */
  roles?: UserRole[];
} = {}) =>
  publicProcedure.use(async (opts) => {
    const { role } = await inject(AuthService.getAuth);

    if (roles && !roles.includes(role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Current role ${JSON.stringify(role)} is not allowed to access this procedure`,
      });
    }

    return opts.next({
      ctx: opts.ctx,
    });
  });
