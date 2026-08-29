import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { fetchAuthState } from "@/lib/useAuth";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const auth = await fetchAuthState();
    if (!auth) throw redirect({ to: "/auth" });
    if (!auth.isAdmin) throw redirect({ to: "/dashboard" });
  },
  component: () => <Outlet />,
});
