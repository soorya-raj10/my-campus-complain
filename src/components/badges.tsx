import { PRIORITY_CLASS, statusDot, statusStyle, type Priority, type Status } from "@/lib/complaints";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap",
        className,
      )}
      style={statusStyle(status)}
    >
      <span className="size-1.5 rounded-full" style={statusDot(status)} />
      {status}
    </span>
  );
}

export function PriorityLabel({ priority }: { priority: Priority }) {
  return <span className={cn("text-sm font-medium", PRIORITY_CLASS[priority])}>{priority}</span>;
}
