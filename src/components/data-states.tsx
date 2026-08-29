import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  delay = 0,
}: {
  label: string;
  value: number | string;
  hint?: string;
  delay?: number;
}) {
  return (
    <div
      className="animate-rise rounded-lg bg-surface p-5 ring-1 ring-black/5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="label-mono">{label}</div>
      <div className="mt-3 font-display text-4xl leading-none font-semibold tracking-tight">
        {value}
      </div>
      {hint && <div className="mt-2 text-xs text-ink-soft">{hint}</div>}
    </div>
  );
}

export function Panel({
  title,
  description,
  aside,
  children,
}: {
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="animate-rise overflow-hidden rounded-lg bg-surface ring-1 ring-black/5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-ink-soft">{description}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function LoadingRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-9 animate-pulse rounded-md bg-line/70" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="size-3 rounded-full border border-dashed border-ink-soft" />
      <div className="mt-3 text-sm font-medium">{title}</div>
      <p className="mt-1 max-w-[42ch] text-xs text-ink-soft">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  );
}
