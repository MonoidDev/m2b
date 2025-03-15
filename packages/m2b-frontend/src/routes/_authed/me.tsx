import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { trpc } from "#config/trpc.ts";

export const Route = createFileRoute("/_authed/me")({
  component: RouteComponent,
});

function RouteComponent() {
  const currentUser = useQuery(trpc.auth.getCurrentUser.queryOptions());

  return (
    <div>
      <h3>ME</h3>
      <div>{new Date().toISOString()}</div>
      {JSON.stringify(currentUser.data)}
      <div style={{ color: "red" }}>{JSON.stringify(currentUser.error)}</div>
    </div>
  );
}
