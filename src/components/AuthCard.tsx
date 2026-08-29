import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/">
            <div className="font-display text-[20px] leading-none font-semibold tracking-tight">
              Meridian College
            </div>
            <div className="label-mono mt-1">Complaint Registry</div>
          </Link>
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-lg bg-surface p-6 ring-1 ring-black/5 sm:p-8">
          <div className="label-mono">{eyebrow}</div>
          <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-soft">{description}</p>
          <div className="mt-6">{children}</div>
          <p className="mt-6 text-xs text-ink-soft">{footer}</p>
        </div>
      </div>
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
