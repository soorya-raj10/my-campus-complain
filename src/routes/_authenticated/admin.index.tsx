import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { EmptyState, ErrorNote, LoadingRows, Panel, StatCard } from "@/components/data-states";
import { ComplaintTable } from "@/components/ComplaintTable";
import { countByStatus, listAllComplaints, listStudents } from "@/lib/complaintsApi";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | ABC University" },
      { name: "description", content: "Campus-wide complaint statistics and recent submissions." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const query = useQuery({ queryKey: ["complaints", "all"], queryFn: listAllComplaints });
  const complaints = query.data ?? [];
  const counts = countByStatus(complaints);

  const namesQuery = useQuery({
    queryKey: ["students", complaints.map((c) => c.student_id).sort().join(",")],
    queryFn: () => listStudents([...new Set(complaints.map((c) => c.student_id))]),
    enabled: complaints.length > 0,
  });

  return (
    <AppShell title="Admin Dashboard" subtitle="Registrar's office overview">
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        <StatCard label="Total complaints" value={complaints.length} hint="all students" />
        <StatCard label="Submitted" value={counts.Submitted} hint="need triage" delay={60} />
        <StatCard label="Under review" value={counts["Under Review"]} delay={120} />
        <StatCard label="In progress" value={counts["In Progress"] + counts.Assigned} delay={180} />
        <StatCard label="Resolved" value={counts.Resolved} delay={240} />
        <StatCard label="Closed" value={counts.Closed} delay={300} />
      </section>

      <Panel
        title="Recent complaints"
        description="The eight most recent submissions across campus."
        aside={
          <Link to="/admin/complaints" className="text-xs font-medium text-accent hover:underline">
            Manage all
          </Link>
        }
      >
        {query.isLoading ? (
          <LoadingRows />
        ) : query.isError ? (
          <div className="p-5">
            <ErrorNote message="We couldn't load complaints. Please try again." />
          </div>
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No complaints filed"
            description="Once students start filing complaints they will show up here."
          />
        ) : (
          <ComplaintTable
            complaints={complaints.slice(0, 8)}
            studentNames={namesQuery.data ?? {}}
          />
        )}
      </Panel>
    </AppShell>
  );
}
