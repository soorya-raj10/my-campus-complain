import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AuthState = {
  userId: string;
  email: string;
  name: string;
  isAdmin: boolean;
} | null;

export const authQueryKey = ["auth", "session"] as const;

export async function fetchAuthState(): Promise<AuthState> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;

  const [profileRes, rolesRes] = await Promise.all([
    supabase.from("profiles").select("name, email").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);

  return {
    userId: user.id,
    email: profileRes.data?.email || user.email || "",
    name: profileRes.data?.name || (user.email ?? "").split("@")[0] || "Student",
    isAdmin: (rolesRes.data ?? []).some((r) => r.role === "admin"),
  };
}

export function useAuth() {
  const { data, isLoading } = useQuery({
    queryKey: authQueryKey,
    queryFn: fetchAuthState,
    staleTime: 30_000,
  });
  return { auth: data ?? null, isLoading };
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}
