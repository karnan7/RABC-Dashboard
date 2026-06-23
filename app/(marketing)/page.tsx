import Link from "next/link";

const ROLES = [
  { name: "Owner", caps: [true, true, true, true] },
  { name: "Admin", caps: [false, true, true, true] },
  { name: "Member", caps: [false, false, true, true] },
  { name: "Viewer", caps: [false, false, false, true] },
];

const CAPS = ["Billing", "Assign roles", "Invite", "View"];

const FEATURES = [
  {
    no: "01",
    title: "Roles, not guesswork",
    body: "Owner, Admin, Member, Viewer — clear tiers that map to real responsibilities. Assign in one call.",
  },
  {
    no: "02",
    title: "Teams as the boundary",
    body: "Group people into teams with a shareable code. Access is scoped to the team they belong to.",
  },
  {
    no: "03",
    title: "Enforced at the edge",
    body: "Every route checks the session and the role before it runs. No client trusted, nothing leaks.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 sm:px-10">
      {/* Hero */}
      <section className="grid items-center gap-14 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div>
          <p
            className="animate-fade-up font-mono text-xs uppercase tracking-[0.22em] text-[#e8b04b]"
            style={{ animationDelay: "0ms" }}
          >
            Role-based access control
          </p>

          <h1
            className="animate-fade-up mt-6 text-[clamp(2.6rem,6vw,4.6rem)] font-normal leading-[0.98] tracking-[-0.02em]"
            style={{ animationDelay: "80ms" }}
          >
            Decide who can do
            <br />
            <span className="font-(family-name:--font-display) italic text-[#e8b04b]">
              what
            </span>
            , exactly.
          </h1>

          <p
            className="animate-fade-up mt-7 max-w-md text-lg leading-relaxed text-[#a6a299]"
            style={{ animationDelay: "160ms" }}
          >
            Warden gives your product team-scoped permissions out of the box.
            Define roles once, assign them in a line, and trust that every
            request is checked.
          </p>

          <div
            className="animate-fade-up mt-9 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-full bg-[#e8b04b] px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Create a workspace
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-[#f5f3ef] transition-colors hover:border-white/35 hover:bg-white/5"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Permission matrix */}
        <div
          className="animate-fade-up"
          style={{ animationDelay: "320ms" }}
          aria-hidden
        >
          <div className="rounded-2xl border border-white/10 bg-[#141416]/80 p-5 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8a8780]">
                permissions.matrix
              </span>
              <span className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-white/15" />
                <span className="h-2 w-2 rounded-full bg-white/15" />
                <span className="h-2 w-2 rounded-full bg-[#e8b04b]/70" />
              </span>
            </div>

            <table className="w-full border-collapse font-mono text-sm">
              <thead>
                <tr>
                  <th className="pb-3 text-left text-[11px] font-normal uppercase tracking-wider text-[#6f6c66]">
                    role
                  </th>
                  {CAPS.map((c) => (
                    <th
                      key={c}
                      className="pb-3 text-center text-[11px] font-normal uppercase tracking-wider text-[#6f6c66]"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROLES.map((role) => (
                  <tr
                    key={role.name}
                    className="border-t border-white/6 transition-colors hover:bg-white/3"
                  >
                    <td className="py-3 pr-3 text-left text-[#f5f3ef]">
                      {role.name}
                    </td>
                    {role.caps.map((ok, i) => (
                      <td key={i} className="py-3 text-center">
                        {ok ? (
                          <span className="text-[#e8b04b]">✓</span>
                        ) : (
                          <span className="text-[#3a3833]">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="animate-fade-in border-t border-white/10 py-16 sm:py-20">
        <div className="grid gap-10 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.no} className="group">
              <span className="font-mono text-xs text-[#e8b04b]">{f.no}</span>
              <h3 className="mt-3 text-xl font-medium tracking-tight">
                {f.title}
              </h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-[#8a8780]">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-[#e8b04b]/20 bg-linear-to-br from-[#161512] to-[#0f0e0c] px-8 py-14 text-center sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(60% 120% at 50% 0%, rgba(232,176,75,0.5), transparent 60%)",
            }}
          />
          <h2 className="relative font-(family-name:--font-display) text-[clamp(2rem,4.5vw,3.2rem)] italic leading-tight">
            Ship access control you won&rsquo;t rewrite.
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-[#a6a299]">
            Set up your first team and start assigning roles in minutes.
          </p>
          <Link
            href="/register"
            className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-[#e8b04b] px-7 py-3.5 text-sm font-semibold text-black transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Get started — it&rsquo;s free
          </Link>
        </div>
      </section>
    </div>
  );
}
