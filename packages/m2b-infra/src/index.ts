import { z } from "zod";

export const EnvName = z.enum(["LOCAL", "DEV", "PROD"]);

export type Envs = z.infer<typeof EnvName>;

export const SharedEnvs = z.object({
  ENV_NAME: EnvName,
  BACKEND_URL: z.string(),
});
export type SharedEnvs = z.infer<typeof SharedEnvs>;

export const FrontendEnvs = SharedEnvs.extend({});

export type FrontendEnvs = z.infer<typeof FrontendEnvs>;

export const BackendEnvs = SharedEnvs.extend({
  SERVER_SECRET: z.string(),
  DATABASE_URL: z.string(),
});
export type BackendEnvs = z.infer<typeof BackendEnvs>;
