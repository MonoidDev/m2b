import { AuthService } from "#services/AuthService.ts";
import { TypeLocalStorage } from "#services/TypeLocalStorage.ts";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  TypeLocalStorage.use();

  const token = AuthService.use();

  return (
    <>
      <div className="p-2 flex gap-2 text-lg">
        <Link
          to="/"
          activeProps={{
            className: "font-bold",
          }}
          activeOptions={{ exact: true }}
        >
          Home
        </Link>
        <Link
          to="/about"
          activeProps={{
            className: "font-bold",
          }}
        >
          About
        </Link>

        <Link
          to="/me"
          activeProps={{
            className: "font-bold",
          }}
        >
          Me
        </Link>

        <Link
          to="/login"
          activeProps={{
            className: "font-bold",
          }}
        >
          Login
        </Link>
      </div>
      <hr />
      <div>{JSON.stringify(token)}</div>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
