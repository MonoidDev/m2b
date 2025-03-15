import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, httpLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "m2b-backend";
import { transformer } from "m2b-utils";
import { match } from "ts-pattern";

import { envs } from "#config/envs.ts";
import { AuthService } from "#services/AuthService.ts";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

/**
 * The special client for public auth mutations.
 * They cannot be batched with other requests.
 */
export const authTrpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: envs.BACKEND_URL,
      transformer,
    }),
  ],
});

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: envs.BACKEND_URL,
      transformer,
      async headers() {
        return await match(AuthService.loadAuthTokens())
          .with({ success: true }, async ({ data }) => {
            const result = await AuthService.maybeRotateAuthTokens(data);
            if (result.success) {
              return { Authorization: `Bearer ${result.data.accessToken}` };
            } else if (result.error) {
              console.error(`Failed to rotate token: ${result.error}`);
              return {};
            }
          })
          .with({ success: false }, () => ({}))
          .exhaustive();
      },
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
