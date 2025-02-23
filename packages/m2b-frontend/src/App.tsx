import { QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense } from "react";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { queryClient, trpc } from "#config/trpc.ts";

import { routeTree } from "./routeTree.gen";

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
      <RouterProvider router={router} />
    </Suspense>
  );
};
