import { AuthService } from "#services/AuthService.ts";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { match } from "ts-pattern";

export const Route = createFileRoute("/_authed")({
  component: AuthedComponent,
  pendingComponent: () => <div>Loading _authed...</div>,
});

function AuthedComponent() {
  const navigate = Route.useNavigate();

  const isAuthed = AuthService.useIsAuthed();

  useEffect(() => {
    if (!isAuthed.success) {
      navigate({
        to: "/login",
        search: { reason: isAuthed.error },
      });
    }
  }, [isAuthed.success]);

  return match(isAuthed)
    .with({ success: false }, () => null)
    .otherwise(() => (
      <>
        <div>Authed Root</div>
        <div>{new Date().toISOString()}</div>

        <Outlet />
      </>
    ));
}
