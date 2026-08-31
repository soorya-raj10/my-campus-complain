import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell, PrimaryAction } from "@/components/AppShell";
import { EmptyState, ErrorNote, LoadingRows, Panel } from "@/components/data-states";
import { ComplaintTable } from "@/components/ComplaintTable";
import { listMyComplaints } from "@/lib/complaintsApi";
import { STATUSES } from "@/lib/complaints";
import { useAuth } from "@/lib/useAuth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/complaints/")({
  head: () => ({
    meta: [
      { title: "My Complaints | ABC University Student Complaint Management System" },
      { name: "description", content: "Every complaint you have filed, with status and priority." },
    ],
  }),
  component: MyComplaints,
});

function MyComplaints() {
  const { auth } = useAuth();
  const [status, setStatus] = useState<string>("All");
  const query = useQuery({
    queryKey: ["complaints", "mine", auth?.userId],
    queryFn: () => listMyComplaints(auth!.userId),
    enabled: !!auth,
  });

  const complaints = useMemo(
    () => (query.data ?? []).filter((c) => status === "All" || c.status === status),
    [query.data, status],
  );

  return (
    <AppShell
      title="My Complaints"
      subtitle={`${query.data?.length ?? 0} filed`}
      action={<PrimaryAction to="/submit">Submit Complaint</PrimaryAction>}
    >
      <Panel
        title="All my complaints"
        description="Select a complaint to see its full detail and history."
        aside={
          <div className="flex flex-wrap gap-1.5">
            {["All", ...STATUSES].map((option) => (
              <button
                key={option}
                onClick={() => setStatus(option)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 transition-colors",
                  status === option
                    ? "bg-ink text-paper ring-ink"
                    : "text-ink-soft ring-line hover:text-ink",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        }
      >
        {query.isLoading ? (
          <LoadingRows rows={6} />
        ) : query.isError ? (
          <div className="p-5">
            <ErrorNote message="We couldn't load your complaints. Please try again." />
          </div>
        ) : complaints.length === 0 ? (
          <EmptyState
            title="Nothing to show"
            description={
              status === "All"
                ? "You haven't filed any complaints yet."
                : `No complaints with the status "${status}".`
            }
          >
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90"
            >
              <span className="size-1.5 rounded-full bg-accent" />
              Submit a complaint
            </Link>
          </EmptyState>
        ) : (
          <ComplaintTable complaints={complaints} />
        )}
      </Panel>
    </AppShell>
  );
}
