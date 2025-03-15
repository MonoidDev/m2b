import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { FrontendEnvs } from "m2b-infra";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __FRONTEND_ENVS__: JSON.stringify(
      JSON.stringify(FrontendEnvs.parse(process.env)),
    ),
  },
  build: {
    minify: false,
  },

  plugins: [TanStackRouterVite(), react()],
});
