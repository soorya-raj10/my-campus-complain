import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { EmptyState, ErrorNote, LoadingRows, Panel } from "@/components/data-states";
import { StatusBadge } from "@/components/badges";
import { Field } from "@/components/AuthCard";
import {
  DEPARTMENTS,
  PRIORITIES,
  PRIORITY_CLASS,
  STATUSES,
  formatDateTime,
  shortId,
  type Priority,
  type Status,
} from "@/lib/complaints";
import {
  addUpdate,
  deleteComplaint,
  getComplaint,
  listUpdates,
  signedAttachmentUrl,
  updateComplaint,
} from "@/lib/complaintsApi";
import { useAuth } from "@/lib/useAuth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/complaints/$id")({
  head: () => ({
    meta: [
      { title: "Complaint Detail | College Complaint Registry" },
      { name: "description", content: "Full complaint detail, status and update history." },
    ],
  }),
  component: ComplaintDetail,
});

const inputClass =
  "w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent/70";

function ComplaintDetail() {
  const { id } = Route.useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const complaintQuery = useQuery({
    queryKey: ["complaint", id],
    queryFn: () => getComplaint(id),
  });
  const updatesQuery = useQuery({
    queryKey: ["complaint", id, "updates"],
    queryFn: () => listUpdates(id),
  });

  const complaint = complaintQuery.data ?? null;
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (complaint?.attachment) {
      signedAttachmentUrl(complaint.attachment).then((url) => {
        if (active) setAttachmentUrl(url);
      });
    } else {
      setAttachmentUrl(null);
    }
    return () => {
      active = false;
    };
  }, [complaint?.attachment]);

  const removal = useMutation({
    mutationFn: () => deleteComplaint(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Complaint withdrawn");
      navigate({ to: "/complaints" });
    },
    onError: () => toast.error("Could not delete this complaint."),
  });

  if (complaintQuery.isLoading) {
    return (
      <AppShell title="Complaint" subtitle="Loading">
        <Panel title="Complaint detail">
          <LoadingRows rows={6} />
        </Panel>
      </AppShell>
    );
  }

  if (complaintQuery.isError) {
    return (
      <AppShell title="Complaint" subtitle="Error">
        <ErrorNote message="We couldn't load this complaint." />
      </AppShell>
    );
  }

  if (!complaint) {
    return (
      <AppShell title="Complaint" subtitle="Not found">
        <Panel title="Complaint detail">
          <EmptyState
            title="Complaint not available"
            description="It may have been removed, or you don't have access to it."
          >
            <Link to="/complaints" className="text-xs font-medium text-accent hover:underline">
              Back to my complaints
            </Link>
          </EmptyState>
        </Panel>
      </AppShell>
    );
  }

  const canWithdraw = !auth?.isAdmin && complaint.status === "Submitted";

  return (
    <AppShell
      title={complaint.title}
      subtitle={`${shortId(complaint.id)} · filed ${formatDateTime(complaint.created_at)}`}
      action={<StatusBadge status={complaint.status} className="px-3 py-1.5 text-xs" />}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Panel title="Complaint detail">
            <dl className="grid gap-5 p-5 sm:grid-cols-2">
              <Detail label="Category" value={complaint.category} />
              <Detail label="Location" value={complaint.location || "—"} />
              <Detail
                label="Priority"
                value={complaint.priority}
                className={PRIORITY_CLASS[complaint.priority]}
              />
              <Detail label="Last updated" value={formatDateTime(complaint.updated_at)} />
              <Detail label="Department assigned" value={complaint.assigned_department || "Unassigned"} />
              <Detail label="Staff assigned" value={complaint.assigned_staff || "Unassigned"} />
              <div className="sm:col-span-2">
                <dt className="label-mono">Description</dt>
                <dd className="mt-1.5 text-sm whitespace-pre-wrap text-ink-soft">
                  {complaint.description}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="label-mono">Attachment</dt>
                <dd className="mt-1.5 text-sm">
                  {complaint.attachment ? (
                    attachmentUrl ? (
                      <a
                        href={attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-accent hover:underline"
                      >
                        Open attachment
                      </a>
                    ) : (
                      <span className="text-ink-soft">Preparing link…</span>
                    )
                  ) : (
                    <span className="text-ink-soft">None attached</span>
                  )}
                </dd>
              </div>
              {complaint.admin_comments && (
                <div className="sm:col-span-2">
                  <dt className="label-mono">Admin comments</dt>
                  <dd className="mt-1.5 text-sm whitespace-pre-wrap text-ink-soft">
                    {complaint.admin_comments}
                  </dd>
                </div>
              )}
              {complaint.resolution_details && (
                <div className="sm:col-span-2 rounded-md bg-status-resolved/8 p-4">
                  <dt className="label-mono">Resolution</dt>
                  <dd className="mt-1.5 text-sm whitespace-pre-wrap text-ink">
                    {complaint.resolution_details}
                  </dd>
                </div>
              )}
            </dl>
            {canWithdraw && (
              <div className="border-t border-line p-5">
                <button
                  onClick={() => removal.mutate()}
                  disabled={removal.isPending}
                  className="rounded-md border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-60"
                >
                  {removal.isPending ? "Withdrawing…" : "Withdraw complaint"}
                </button>
                <p className="mt-2 text-xs text-ink-soft">
                  You can withdraw a complaint while it is still awaiting review.
                </p>
              </div>
            )}
          </Panel>

          <Panel title="Timeline" description="Every update recorded against this complaint.">
            {updatesQuery.isLoading ? (
              <LoadingRows rows={3} />
            ) : (updatesQuery.data ?? []).length === 0 ? (
              <EmptyState title="No updates yet" description="Updates appear here as staff act on the complaint." />
            ) : (
              <ol className="space-y-0 p-5">
                {(updatesQuery.data ?? []).map((update, index, all) => (
                  <li key={update.id} className="relative pl-6 pb-6 last:pb-0">
                    <span className="absolute top-1.5 left-0 size-2 rounded-full bg-accent" />
                    {index < all.length - 1 && (
                      <span className="absolute top-4 left-[3.5px] h-full w-px bg-line" />
                    )}
                    <div className="text-sm font-medium">{update.action}</div>
                    <div className="font-mono text-[11px] text-ink-soft">
                      {update.author_name || "Staff"} · {formatDateTime(update.created_at)}
                    </div>
                    {update.note && <p className="mt-1.5 text-sm text-ink-soft">{update.note}</p>}
                    {update.new_status && (
                      <div className="mt-2 flex items-center gap-2">
                        {update.old_status && (
                          <>
                            <StatusBadge status={update.old_status} />
                            <span className="text-xs text-ink-soft">→</span>
                          </>
                        )}
                        <StatusBadge status={update.new_status} />
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        {auth?.isAdmin && <AdminPanel complaintId={id} />}
      </div>
    </AppShell>
  );
}

function Detail({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div>
      <dt className="label-mono">{label}</dt>
      <dd className={cn("mt-1.5 text-sm font-medium", className)}>{value}</dd>
    </div>
  );
}

function AdminPanel({ complaintId }: { complaintId: string }) {
  const { auth } = useAuth();
  const queryClient = useQueryClient();
  const complaintQuery = useQuery({
    queryKey: ["complaint", complaintId],
    queryFn: () => getComplaint(complaintId),
  });
  const complaint = complaintQuery.data;

  const [status, setStatus] = useState<Status | "">("");
  const [priority, setPriority] = useState<Priority | "">("");
  const [department, setDepartment] = useState("");
  const [staff, setStaff] = useState("");
  const [comment, setComment] = useState("");
  const [resolution, setResolution] = useState("");

  useEffect(() => {
    if (!complaint) return;
    setStatus(complaint.status);
    setPriority(complaint.priority);
    setDepartment(complaint.assigned_department ?? "");
    setStaff(complaint.assigned_staff ?? "");
    setResolution(complaint.resolution_details ?? "");
  }, [complaint?.id, complaint?.updated_at]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!complaint || !auth) throw new Error("Not ready");

      const nextStatus = (status || complaint.status) as Status;
      const nextPriority = (priority || complaint.priority) as Priority;
      const trimmedComment = comment.trim();
      const nextComments = trimmedComment
        ? [complaint.admin_comments, `${auth.name}: ${trimmedComment}`].filter(Boolean).join("\n\n")
        : complaint.admin_comments;

      await updateComplaint(complaintId, {
        status: nextStatus,
        priority: nextPriority,
        assigned_department: department || null,
        assigned_staff: staff.trim() || null,
        admin_comments: nextComments,
        resolution_details: resolution.trim() || null,
      });

      const changes: string[] = [];
      if (nextPriority !== complaint.priority)
        changes.push(`Priority ${complaint.priority} → ${nextPriority}`);
      if ((department || null) !== complaint.assigned_department)
        changes.push(`Department: ${department || "unassigned"}`);
      if ((staff.trim() || null) !== complaint.assigned_staff)
        changes.push(`Staff: ${staff.trim() || "unassigned"}`);
      if (resolution.trim() && resolution.trim() !== (complaint.resolution_details ?? ""))
        changes.push("Resolution details recorded");

      const noteParts = [trimmedComment, changes.join(" · ")].filter(Boolean);

      await addUpdate({
        complaintId,
        authorId: auth.userId,
        authorName: auth.name,
        action: nextStatus !== complaint.status ? `Status set to ${nextStatus}` : "Complaint updated",
        note: noteParts.length ? noteParts.join(" — ") : null,
        oldStatus: nextStatus !== complaint.status ? complaint.status : null,
        newStatus: nextStatus !== complaint.status ? nextStatus : null,
      });
    },
    onSuccess: async () => {
      setComment("");
      await queryClient.invalidateQueries({ queryKey: ["complaint", complaintId] });
      await queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Complaint updated");
    },
    onError: () => toast.error("Could not save the update."),
  });

  if (!complaint) return null;

  return (
    <div className="space-y-6">
      <Panel title="Administer" description="Assign, prioritise and move this complaint along.">
        <form
          className="space-y-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <Field label="Status" htmlFor="admin-status">
            <select
              id="admin-status"
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              {STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority" htmlFor="admin-priority">
            <select
              id="admin-priority"
              className={inputClass}
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              {PRIORITIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Department" htmlFor="admin-department">
            <select
              id="admin-department"
              className={inputClass}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">Unassigned</option>
              {DEPARTMENTS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Staff member" htmlFor="admin-staff">
            <input
              id="admin-staff"
              className={inputClass}
              value={staff}
              onChange={(e) => setStaff(e.target.value)}
              placeholder="e.g. R. Menon"
            />
          </Field>
          <Field label="Add a comment" htmlFor="admin-comment">
            <textarea
              id="admin-comment"
              rows={3}
              className={inputClass}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Visible to the student on the complaint."
            />
          </Field>
          <Field label="Resolution details" htmlFor="admin-resolution">
            <textarea
              id="admin-resolution"
              rows={3}
              className={inputClass}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="What was done to resolve the issue."
            />
          </Field>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/90 disabled:opacity-60"
          >
            {mutation.isPending ? "Saving…" : "Save update"}
          </button>
        </form>
      </Panel>
    </div>
  );
}
