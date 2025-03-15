import { createFileRoute } from "@tanstack/react-router";
import { LoggedOutKind } from "m2b-models";
import { match } from "ts-pattern";
import { z } from "zod";

import { queryClient } from "#config/trpc.ts";
import { AuthService } from "#services/AuthService.ts";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
  validateSearch: z.object({
    reason: LoggedOutKind.optional(),
  }),
});

function LoginComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <div className="p-2">
      <h3>Login</h3>

      <div style={{ color: "red" }}>{search.reason}</div>

      <form action="#">
        <input type="text" placeholder="email" autoComplete="current-email" />
        <input
          type="password"
          placeholder="password"
          autoComplete="current-password"
        />
        <button
          type="submit"
          onClick={async (ev) => {
            ev.preventDefault();

            await AuthService.login({
              email:
                document.querySelector<HTMLInputElement>("[type=text]")!.value,
              password:
                document.querySelector<HTMLInputElement>("[type=password]")!
                  .value,
            }).then((res) =>
              match(res)
                .with({ success: true }, ({ data }) => {
                  alert(JSON.stringify(data));
                })
                .with({ success: false }, ({ error }) => {
                  alert(JSON.stringify(error));
                })
                .exhaustive(),
            );

            queryClient.resetQueries();

            navigate({ to: "/me" });
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}
