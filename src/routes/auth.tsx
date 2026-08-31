import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchAuthState } from "@/lib/useAuth";
import { ErrorNote } from "@/components/data-states";
import { AuthCard, Field } from "@/components/AuthCard";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login | ABC University Complaints" },
      {
        name: "description",
        content: "Sign in to file a campus complaint or manage the college complaint registry.",
      },
      { property: "og:title", content: "Login | ABC University" },
      { property: "og:description", content: "Sign in to the college complaint registry." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]!.message);
      return;
    }

    setPending(true);
    const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data);
    if (signInError) {
      setPending(false);
      setError(
        signInError.message === "Invalid login credentials"
          ? "Those credentials don't match an account."
          : signInError.message,
      );
      return;
    }

    const auth = await fetchAuthState();
    toast.success("Signed in");
    navigate({ to: auth?.isAdmin ? "/admin" : "/dashboard", replace: true });
  }

  return (
    <AuthCard
      eyebrow="Sign in"
      title="Welcome back"
      description="Use the email address registered with the college."
      footer={
        <>
          No account yet?{" "}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Register as a student
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <ErrorNote message={error} />}
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent/70"
            placeholder="you@college.edu"
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent/70"
            placeholder="••••••••"
          />
        </Field>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/90 disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthCard>
  );
}
