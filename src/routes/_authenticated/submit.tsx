import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ErrorNote, Panel } from "@/components/data-states";
import { Field } from "@/components/AuthCard";
import { CATEGORIES, PRIORITIES, categoryLabel, type Category, type Priority } from "@/lib/complaints";
import { addUpdate, uploadAttachment } from "@/lib/complaintsApi";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/_authenticated/submit")({
  head: () => ({
    meta: [
      { title: "Submit a Complaint | ABC University" },
      {
        name: "description",
        content: "File a new campus complaint with category, location, priority and an attachment.",
      },
    ],
  }),
  component: SubmitComplaint,
});

const schema = z.object({
  title: z.string().trim().min(6, "Give the complaint a clear title").max(140),
  category: z.enum(CATEGORIES),
  description: z.string().trim().min(20, "Describe the problem in at least 20 characters").max(2000),
  location: z.string().trim().min(3, "Where is the problem?").max(140),
  priority: z.enum(PRIORITIES),
});

const inputClass =
  "w-full rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent/70";

function SubmitComplaint() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    category: "Classroom" as Category,
    description: "",
    location: "",
    priority: "Medium" as Priority,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);
      if (!auth) throw new Error("You need to be signed in.");

      let attachment: string | null = null;
      if (file) {
        if (file.size > 10 * 1024 * 1024) throw new Error("Attachment must be 10MB or smaller.");
        attachment = await uploadAttachment(auth.userId, file);
      }

      const { data, error: insertError } = await supabase
        .from("complaints")
        .insert({ ...parsed.data, attachment, student_id: auth.userId })
        .select("id")
        .single();
      if (insertError) throw insertError;

      await addUpdate({
        complaintId: data.id,
        authorId: auth.userId,
        authorName: auth.name,
        action: "Complaint submitted",
        note: `Filed under ${parsed.data.category} at ${parsed.data.location}.`,
        newStatus: "Submitted",
      });

      return data.id as string;
    },
    onSuccess: async (id) => {
      await queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Complaint submitted");
      navigate({ to: "/complaints/$id", params: { id } });
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <AppShell title="Submit Complaint" subtitle="New entry in the register">
      <Panel title="Complaint details" description="Fields marked as required must be filled in.">
        <form
          className="space-y-5 p-5"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            mutation.mutate();
          }}
        >
          {error && <ErrorNote message={error} />}

          <Field label="Complaint title" htmlFor="title">
            <input
              id="title"
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Projector in Room 204 does not switch on"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" htmlFor="category">
              <select
                id="category"
                className={inputClass}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabel(category)}
                  </option>
                ))}

              </select>
            </Field>
            <Field label="Priority" htmlFor="priority">
              <select
                id="priority"
                className={inputClass}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Location" htmlFor="location">
            <input
              id="location"
              className={inputClass}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Science Block, Room 204"
            />
          </Field>

          <Field label="Description" htmlFor="description">
            <textarea
              id="description"
              rows={6}
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what is wrong, when it started, and how it affects you."
            />
          </Field>

          <Field
            label="Attachment"
            htmlFor="attachment"
            hint="Optional image or document, up to 10MB."
          >
            <input
              id="attachment"
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-paper"
            />
          </Field>

          <div className="flex items-center gap-3 border-t border-line pt-5">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/90 disabled:opacity-60"
            >
              {mutation.isPending ? "Submitting…" : "Submit complaint"}
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/complaints" })}
              className="rounded-md border border-line px-5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      </Panel>
    </AppShell>
  );
}
