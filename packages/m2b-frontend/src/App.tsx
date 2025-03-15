import { Suspense } from "react";

import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import { queryClient, trpc } from "#config/trpc.ts";
import { routeTree } from "#routeTree.gen.ts";
import { theme } from "#theme.ts";

const router = createRouter({
  routeTree,
  scrollRestoration: true,
  defaultPreload: "intent",
  context: {
    trpc,
    queryClient,
  },
  defaultErrorComponent: ({ error }) => (
    <div style={{ color: "red" }}>{error.message}</div>
  ),
  defaultPendingComponent: () => <div>Loading...</div>,
  Wrap: function WrapComponent({ children }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const App: React.FC = () => {
  return (
    <Suspense fallback={"loading"}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Suspense>
  );
};
