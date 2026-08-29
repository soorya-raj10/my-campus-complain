export const CATEGORIES = [
  "Classroom",
  "Laboratory",
  "Hostel",
  "Wi-Fi",
  "Transportation",
  "Cleanliness",
  "Infrastructure",
  "Other",
] as const;

export const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

export const STATUSES = [
  "Submitted",
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
] as const;

export const DEPARTMENTS = [
  "Administration",
  "Maintenance",
  "IT Department",
  "Hostel Management",
  "Transportation Department",
  "Laboratory Department",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

export type Complaint = {
  id: string;
  student_id: string;
  title: string;
  category: Category;
  description: string;
  location: string;
  priority: Priority;
  status: Status;
  assigned_department: string | null;
  assigned_staff: string | null;
  attachment: string | null;
  admin_comments: string | null;
  resolution_details: string | null;
  created_at: string;
  updated_at: string;
};

export type ComplaintUpdate = {
  id: string;
  complaint_id: string;
  author_id: string | null;
  author_name: string;
  action: string;
  note: string | null;
  old_status: Status | null;
  new_status: Status | null;
  created_at: string;
};

const STATUS_TOKEN: Record<Status, string> = {
  Submitted: "status-submitted",
  "Under Review": "status-review",
  Assigned: "status-assigned",
  "In Progress": "status-progress",
  Resolved: "status-resolved",
  Closed: "status-closed",
};

export function statusStyle(status: Status) {
  const token = `var(--color-${STATUS_TOKEN[status]})`;
  return {
    color: token,
    background: `color-mix(in srgb, ${token} 14%, transparent)`,
  };
}

export function statusDot(status: Status) {
  return { background: `var(--color-${STATUS_TOKEN[status]})` };
}

export const PRIORITY_CLASS: Record<Priority, string> = {
  Low: "text-ink-soft",
  Medium: "text-ink",
  High: "text-status-progress",
  Critical: "text-accent",
};

export function shortId(id: string) {
  return `CMP-${id.slice(0, 6).toUpperCase()}`;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
