import { supabase } from "@/integrations/supabase/client";
import type { Complaint, ComplaintUpdate, Status } from "@/lib/complaints";

export async function listMyComplaints(userId: string): Promise<Complaint[]> {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("student_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Complaint[];
}

export async function listAllComplaints(): Promise<Complaint[]> {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Complaint[];
}

export async function getComplaint(id: string): Promise<Complaint | null> {
  const { data, error } = await supabase.from("complaints").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Complaint | null) ?? null;
}

export async function listUpdates(complaintId: string): Promise<ComplaintUpdate[]> {
  const { data, error } = await supabase
    .from("complaint_updates")
    .select("*")
    .eq("complaint_id", complaintId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ComplaintUpdate[];
}

export async function listStudents(ids: string[]): Promise<Record<string, string>> {
  if (ids.length === 0) return {};
  const { data, error } = await supabase.from("profiles").select("id, name, email").in("id", ids);
  if (error) throw error;
  const map: Record<string, string> = {};
  for (const row of data ?? []) map[row.id] = row.name || row.email;
  return map;
}

export async function uploadAttachment(userId: string, file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${userId}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from("complaint-attachments").upload(path, file);
  if (error) throw error;
  return path;
}

export async function signedAttachmentUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("complaint-attachments")
    .createSignedUrl(path, 60 * 10);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export async function addUpdate(input: {
  complaintId: string;
  authorId: string;
  authorName: string;
  action: string;
  note?: string | null;
  oldStatus?: Status | null;
  newStatus?: Status | null;
}) {
  const { error } = await supabase.from("complaint_updates").insert({
    complaint_id: input.complaintId,
    author_id: input.authorId,
    author_name: input.authorName,
    action: input.action,
    note: input.note ?? null,
    old_status: input.oldStatus ?? null,
    new_status: input.newStatus ?? null,
  });
  if (error) throw error;
}

export async function updateComplaint(id: string, patch: Partial<Complaint>) {
  const { error } = await supabase.from("complaints").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteComplaint(id: string) {
  const { error } = await supabase.from("complaints").delete().eq("id", id);
  if (error) throw error;
}

export function countByStatus(complaints: Complaint[]) {
  const counts: Record<Status, number> = {
    Submitted: 0,
    "Under Review": 0,
    Assigned: 0,
    "In Progress": 0,
    Resolved: 0,
    Closed: 0,
  };
  for (const complaint of complaints) counts[complaint.status] += 1;
  return counts;
}
