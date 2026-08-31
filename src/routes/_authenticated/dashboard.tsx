import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, PrimaryAction } from "@/components/AppShell";
import { EmptyState, ErrorNote, LoadingRows, Panel, StatCard } from "@/components/data-states";
import { ComplaintTable } from "@/components/ComplaintTable";
import { countByStatus, listMyComplaints } from "@/lib/complaintsApi";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Student Dashboard | ABC University" },
      { name: "description", content: "Your complaint totals and most recent submissions." },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { auth } = useAuth();
  const query = useQuery({
    queryKey: ["complaints", "mine", auth?.userId],
    queryFn: () => listMyComplaints(auth!.userId),
    enabled: !!auth,
  });

  const complaints = query.data ?? [];
  const counts = countByStatus(complaints);
  const inProgress = counts["Under Review"] + counts.Assigned + counts["In Progress"];

  return (
    <AppShell
      title="Student Dashboard"
      subtitle={auth ? `Signed in as ${auth.name}` : "Loading"}
      action={<PrimaryAction to="/submit">Submit Complaint</PrimaryAction>}
    >
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total complaints" value={complaints.length} hint="all time" />
        <StatCard label="Submitted" value={counts.Submitted} hint="awaiting review" delay={60} />
        <StatCard label="In progress" value={inProgress} hint="being handled" delay={120} />
        <StatCard label="Resolved" value={counts.Resolved + counts.Closed} hint="closed out" delay={180} />
      </section>

      <Panel
        title="Recent complaints"
        description="Your five most recent submissions."
        aside={
          <Link to="/complaints" className="text-xs font-medium text-accent hover:underline">
            View all
          </Link>
        }
      >
        {query.isLoading ? (
          <LoadingRows />
        ) : query.isError ? (
          <div className="p-5">
            <ErrorNote message="We couldn't load your complaints. Please try again." />
          </div>
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No complaints yet"
            description="When you submit an issue it will appear here with its live status."
          >
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90"
            >
              <span className="size-1.5 rounded-full bg-accent" />
              Submit your first complaint
            </Link>
          </EmptyState>
        ) : (
          <ComplaintTable complaints={complaints.slice(0, 5)} />
        )}
      </Panel>
    </AppShell>
  );
}
