import { Link } from "@tanstack/react-router";
import { StatusBadge } from "@/components/badges";
import { formatDate, formatDateTime, shortId, type Complaint } from "@/lib/complaints";
import { PRIORITY_CLASS } from "@/lib/complaints";
import { cn } from "@/lib/utils";

export function ComplaintTable({
  complaints,
  studentNames,
}: {
  complaints: Complaint[];
  studentNames?: Record<string, string>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="label-mono border-b border-line text-left">
            <th className="px-5 py-2.5 font-medium">Complaint</th>
            {studentNames && <th className="px-3 py-2.5 font-medium">Student</th>}
            <th className="px-3 py-2.5 font-medium">Category</th>
            <th className="px-3 py-2.5 font-medium">Status</th>
            <th className="px-3 py-2.5 font-medium">Priority</th>
            <th className="px-3 py-2.5 font-medium">Filed</th>
            <th className="px-5 py-2.5 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint, index) => (
            <tr
              key={complaint.id}
              className={cn(
                "transition-colors hover:bg-ink/[0.025]",
                index < complaints.length - 1 && "border-b border-line/70",
              )}
            >
              <td className="px-5 py-3">
                <Link
                  to="/complaints/$id"
                  params={{ id: complaint.id }}
                  className="font-medium text-ink hover:text-accent"
                >
                  {complaint.title}
                </Link>
                <div className="font-mono text-[11px] text-ink-soft">
                  {shortId(complaint.id)} · {formatDateTime(complaint.created_at)}
                </div>
              </td>
              {studentNames && (
                <td className="px-3 py-3 text-ink-soft">
                  {studentNames[complaint.student_id] ?? "—"}
                </td>
              )}
              <td className="px-3 py-3 text-ink-soft">{complaint.category}</td>
              <td className="px-3 py-3">
                <StatusBadge status={complaint.status} />
              </td>
              <td className={cn("px-3 py-3 font-medium", PRIORITY_CLASS[complaint.priority])}>
                {complaint.priority}
              </td>
              <td className="px-3 py-3 font-mono text-xs text-ink-soft">
                {formatDate(complaint.created_at)}
              </td>
              <td className="px-5 py-3 text-right">
                <Link
                  to="/complaints/$id"
                  params={{ id: complaint.id }}
                  className="inline-flex items-center rounded-md border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent/60 hover:text-accent"
                >
                  Manage
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
