import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchAuthState } from "@/lib/useAuth";
import { ErrorNote } from "@/components/data-states";
import { AuthCard, Field } from "@/components/AuthCard";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register | College Complaint Management System" },
      {
        name: "description",
        content: "Create a student account to file and track college complaints.",
      },
      { property: "og:title", content: "Register | ABC University" },
      {
        property: "og:description",
        content: "Create a student account to file and track college complaints.",
      },
    ],
  }),
  component: RegisterPage,
});

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(100),
    email: z.string().trim().email("Enter a valid email address").max(255),
    password: z.string().min(6, "Password must be at least 6 characters").max(72),
    confirm: z.string(),
  })
  .refine((values) => values.password === values.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

const inputClass =
  "w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent/70";

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update(key: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]!.message);
      return;
    }

    setPending(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { name: parsed.data.name },
      },
    });

    if (signUpError) {
      setPending(false);
      setError(
        signUpError.message.includes("already registered")
          ? "That email is already registered. Try signing in instead."
          : signUpError.message,
      );
      return;
    }

    const auth = await fetchAuthState();
    if (!auth) {
      setPending(false);
      toast.success("Account created. You can sign in now.");
      navigate({ to: "/auth", replace: true });
      return;
    }

    toast.success("Account created");
    navigate({ to: auth.isAdmin ? "/admin" : "/dashboard", replace: true });
  }

  return (
    <AuthCard
      eyebrow="Register"
      title="Create your account"
      description="Register with your ABC University email to file and track complaints. All new accounts receive student access; administrator access is granted only to pre-authorized staff accounts."
      footer={
        <>
          Already registered?{" "}
          <Link to="/auth" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <ErrorNote message={error} />}
        <Field label="Full name" htmlFor="name">
          <input id="name" value={form.name} onChange={update("name")} className={inputClass} />
        </Field>
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update("email")}
            className={inputClass}
            placeholder="you@college.edu"
          />
        </Field>
        <Field label="Password" htmlFor="password" hint="At least 6 characters.">
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={update("password")}
            className={inputClass}
          />
        </Field>
        <Field label="Confirm password" htmlFor="confirm">
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={update("confirm")}
            className={inputClass}
          />
        </Field>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/90 disabled:opacity-60"
        >
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}
