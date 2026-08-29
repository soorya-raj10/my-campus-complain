import { createFileRoute, Link } from "@tanstack/react-router";
import { STATUSES } from "@/lib/complaints";
import { StatusBadge } from "@/components/badges";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "College Complaint Management System | Meridian College" },
      {
        name: "description",
        content:
          "Students file campus complaints, administrators triage and resolve them, and everyone tracks progress in one registry.",
      },
      { property: "og:title", content: "College Complaint Management System" },
      {
        property: "og:description",
        content: "File campus complaints, track their status, and see them resolved.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    label: "File",
    title: "Submit with evidence",
    body: "Category, location, priority and a photo or document attached to every complaint you raise.",
  },
  {
    label: "Track",
    title: "Follow the status",
    body: "Watch a complaint move from submitted to resolved, with every admin update recorded on a timeline.",
  },
  {
    label: "Resolve",
    title: "Routed to the right desk",
    body: "Administrators assign complaints to departments and staff, set priority and record resolutions.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <div>
            <div className="font-display text-[20px] leading-none font-semibold tracking-tight">
              Meridian College
            </div>
            <div className="label-mono mt-1">Complaint Registry</div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink/90"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="label-mono">Academic Year 2026 · Student Services</div>
          <h1 className="mt-4 max-w-[24ch] font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
            The college complaint register, kept honest.
          </h1>
          <p className="mt-5 max-w-[56ch] text-base text-pretty text-ink-soft">
            Report a broken projector, a hostel leak, a dropped Wi-Fi link or a late bus. Every
            complaint gets an owner, a priority and a status you can check any time.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/register"
              className="flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/90"
            >
              <span className="size-1.5 rounded-full bg-accent" />
              Create student account
            </Link>
            <Link
              to="/auth"
              className="rounded-md border border-line px-5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
            >
              I already have an account
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap gap-2">
            {STATUSES.map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </div>
        </section>

        <section className="border-y border-line bg-surface">
          <div className="mx-auto grid max-w-6xl gap-px px-5 py-12 sm:px-8 md:grid-cols-3 md:gap-8">
            {FEATURES.map((feature) => (
              <div key={feature.label}>
                <div className="label-mono">{feature.label}</div>
                <h2 className="mt-3 font-display text-xl font-semibold tracking-tight">
                  {feature.title}
                </h2>
                <p className="mt-2 text-sm text-pretty text-ink-soft">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Eight categories, six statuses, one trail
              </h2>
              <p className="mt-3 text-sm text-ink-soft">
                Complaints are grouped by classroom, laboratory, hostel, Wi-Fi, transportation,
                cleanliness, infrastructure and other. Each one carries a priority from low to
                critical and a full history of who changed what.
              </p>
            </div>
            <div className="rounded-lg bg-surface p-6 ring-1 ring-black/5">
              <div className="label-mono">Departments on call</div>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                {[
                  "Administration",
                  "Maintenance",
                  "IT Department",
                  "Hostel Management",
                  "Transportation Department",
                  "Laboratory Department",
                ].map((dept) => (
                  <li key={dept} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-accent" />
                    {dept}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-6 text-xs text-ink-soft sm:px-8">
          Meridian College · Complaint Registry
        </div>
      </footer>
    </div>
  );
}
