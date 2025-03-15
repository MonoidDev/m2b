import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import { TypeLocalStorage } from "#services/TypeLocalStorage.ts";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  TypeLocalStorage.use();

  return (
    <>
      <div>
        <Outlet />
      </div>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
