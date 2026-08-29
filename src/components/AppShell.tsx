import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { initials, useAuth } from "@/lib/useAuth";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string };

const STUDENT_NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/complaints", label: "My Complaints" },
  { to: "/submit", label: "Submit Complaint" },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/complaints", label: "Complaint Management" },
];

export function AppShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = auth?.isAdmin ? ADMIN_NAV : STUDENT_NAV;

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-line px-6 pt-7 pb-6">
        <div className="font-display text-[22px] leading-none font-semibold tracking-tight">
          Meridian College
        </div>
        <div className="label-mono mt-1">Complaint Registry</div>
      </div>
      <div className="label-mono px-4 pt-4 pb-2">{auth?.isAdmin ? "Administration" : "Student"}</div>
      <nav className="space-y-0.5 px-3">
        {nav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            activeOptions={{ exact: true }}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
            activeProps={{ className: "bg-ink/5 text-ink" }}
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <span
                  className={cn("size-1.5 rounded-full", isActive ? "bg-accent" : "bg-line")}
                />
                {item.label}
              </>
            )}
          </Link>
        ))}
      </nav>
      <div className="mt-auto space-y-3 border-t border-line p-4">
        <div className="flex items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/10 font-display text-sm font-semibold text-accent">
            {auth ? initials(auth.name) : "—"}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{auth?.name ?? "Loading…"}</div>
            <div className="truncate text-[11px] text-ink-soft">{auth?.email}</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full rounded-md border border-line px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
        >
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-line bg-surface lg:block">
          {sidebar}
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-72 border-r border-line bg-surface">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-ink-soft"
                aria-label="Close navigation"
              >
                <X className="size-4" />
              </button>
              {sidebar}
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-paper/95 px-5 py-4 backdrop-blur sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-md border border-line p-2 text-ink-soft lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="size-4" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate font-display text-xl font-semibold tracking-tight">
                  {title}
                </h1>
                {subtitle && <div className="label-mono mt-0.5 truncate">{subtitle}</div>}
              </div>
            </div>
            {action}
          </header>
          <main className="space-y-8 px-5 py-6 sm:px-8 sm:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function PrimaryAction({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="hidden items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink/90 sm:flex"
    >
      <span className="size-1.5 rounded-full bg-accent" />
      {children}
    </Link>
  );
}
