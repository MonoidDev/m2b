import { createHTTPServer } from "@trpc/server/adapters/standalone";
import cors from "cors";

import { envs } from "#config/envs.ts";
import { createContext, router } from "#config/trpc.ts";
import { authRouter } from "#routers/authRouter.ts";

const appRouter = router({
  auth: authRouter,
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  middleware: cors(),
  router: appRouter,
  createContext,
});

server.listen(new URL(envs.BACKEND_URL).port);
