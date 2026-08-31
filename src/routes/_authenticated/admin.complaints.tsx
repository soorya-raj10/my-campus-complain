import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState, ErrorNote, LoadingRows, Panel } from "@/components/data-states";
import { ComplaintTable } from "@/components/ComplaintTable";
import { listAllComplaints, listStudents } from "@/lib/complaintsApi";
import { CATEGORIES, PRIORITIES, STATUSES } from "@/lib/complaints";

export const Route = createFileRoute("/_authenticated/admin/complaints")({
  head: () => ({
    meta: [
      { title: "Complaint Management | ABC University" },
      {
        name: "description",
        content: "Search, filter, assign and resolve every complaint filed on campus.",
      },
    ],
  }),
  component: AdminComplaints,
});

const selectClass =
  "rounded-md border border-line bg-paper px-2.5 py-1.5 text-xs outline-none focus:border-accent/70";

function AdminComplaints() {
  const query = useQuery({ queryKey: ["complaints", "all"], queryFn: listAllComplaints });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [priority, setPriority] = useState("All");

  const all = query.data ?? [];

  const namesQuery = useQuery({
    queryKey: ["students", all.map((c) => c.student_id).sort().join(",")],
    queryFn: () => listStudents([...new Set(all.map((c) => c.student_id))]),
    enabled: all.length > 0,
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return all.filter((complaint) => {
      if (status !== "All" && complaint.status !== status) return false;
      if (category !== "All" && complaint.category !== category) return false;
      if (priority !== "All" && complaint.priority !== priority) return false;
      if (!term) return true;
      return (
        complaint.title.toLowerCase().includes(term) ||
        complaint.description.toLowerCase().includes(term) ||
        complaint.location.toLowerCase().includes(term) ||
        (complaint.assigned_department ?? "").toLowerCase().includes(term) ||
        (complaint.assigned_staff ?? "").toLowerCase().includes(term)
      );
    });
  }, [all, search, status, category, priority]);

  return (
    <AppShell title="Complaint Management" subtitle={`${all.length} complaints on record`}>
      <Panel
        title="All complaints"
        description="Open a complaint to assign a department, change priority or record a resolution."
        aside={
          <span className="font-mono text-[11px] text-ink-soft">
            {filtered.length} of {all.length}
          </span>
        }
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-ink-soft" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, description, location or assignee"
              className="w-full rounded-md border border-line bg-paper py-1.5 pr-3 pl-8 text-xs outline-none focus:border-accent/70"
            />
          </div>
          <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="All">All statuses</option>
            {STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="All">All priorities</option>
            {PRIORITIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {query.isLoading ? (
          <LoadingRows rows={8} />
        ) : query.isError ? (
          <div className="p-5">
            <ErrorNote message="We couldn't load complaints. Please try again." />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No matching complaints"
            description="Adjust the search term or clear the filters to see more results."
          />
        ) : (
          <ComplaintTable complaints={filtered} studentNames={namesQuery.data ?? {}} />
        )}
      </Panel>
    </AppShell>
  );
}
