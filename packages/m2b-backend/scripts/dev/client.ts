import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AuthPassword } from "m2b-models";
import { transformer } from "m2b-utils";

import { envs } from "#config/envs.ts";
import type { AppRouter } from "#index.ts";

export const devClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: envs.BACKEND_URL,
      transformer,
    }),
  ],
});

export const withAuthPassword = async (
  authPassword: AuthPassword,
  fn: (client: typeof devClient) => Promise<void>,
) => {
  const authResult =
    await devClient.auth.loginWithAuthPassword.mutate(authPassword);

  if (authResult.success) {
    await fn(
      createTRPCClient<AppRouter>({
        links: [
          httpBatchLink({
            url: envs.BACKEND_URL,
            transformer,
            headers: {
              Authorization: `Bearer ${authResult.data.accessToken}`,
            },
          }),
        ],
      }),
    );
  } else {
    console.error("Failed to authenticate", authResult.error);
  }
};
