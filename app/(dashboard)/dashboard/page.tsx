import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { memberSelect, visibilityConditions, type Member } from "@/app/lib/rbac";
import { MemberControls } from "../_components/member-controls";

// Reads the session cookie and the DB per request — never prerendered.
export const dynamic = "force-dynamic";

/** Per-role pill styling. ADMIN reuses the brand amber; others get a tint. */
const ROLE_BADGE: Record<Role, string> = {
  ADMIN: "border-[#e8b04b]/30 bg-[#e8b04b]/10 text-[#e8b04b]",
  MANAGER: "border-[#7ca9f0]/30 bg-[#7ca9f0]/10 text-[#7ca9f0]",
  USER: "border-[#7fce9b]/30 bg-[#7fce9b]/10 text-[#7fce9b]",
  GUEST: "border-white/15 bg-white/5 text-[#8a8780]",
};

const joinedFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wide ${ROLE_BADGE[role]}`}
    >
      {role}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#141416]/60 px-5 py-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#6f6c66]">
        {label}
      </p>
      <p className="mt-2 truncate text-xl font-medium text-[#f5f3ef]">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const viewer = await getCurrentUser();
  // The layout already gates auth, but the page reads `viewer` directly so it
  // re-checks here too rather than trusting an implicit guarantee.
  if (!viewer) redirect("/login");

  const isAdmin = viewer.role === Role.ADMIN;

  // The member list is RBAC-scoped with the exact same rules as GET /api/user.
  // Teams are only needed to populate the admin reassignment dropdown.
  const [members, teams] = await Promise.all([
    prisma.user.findMany({
      where: { AND: visibilityConditions(viewer) },
      select: memberSelect,
      orderBy: { createdAt: "desc" },
    }),
    isAdmin
      ? prisma.team.findMany({
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const teamsInView = new Set(
    members.map((m) => m.team?.id).filter((id): id is string => Boolean(id)),
  );

  // `getCurrentUser()` doesn't load the team relation, but the viewer always
  // appears in their own RBAC-scoped list — so read the team name from there.
  const viewerTeamName =
    members.find((m) => m.id === viewer.id)?.team?.name ?? "No team";

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-[#8a8780]">
          {isAdmin
            ? "You can see everyone. Reassign roles and teams inline below."
            : "People and teams visible to you under your role."}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Your role" value={viewer.role} />
        <StatCard label="Your team" value={viewerTeamName} />
        <StatCard
          label="Members visible"
          value={members.length}
        />
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-medium tracking-tight">Members</h2>
          <span className="font-mono text-xs text-[#6f6c66]">
            {teamsInView.size} {teamsInView.size === 1 ? "team" : "teams"} ·{" "}
            {members.length} {members.length === 1 ? "person" : "people"}
          </span>
        </div>

        <ul className="divide-y divide-white/8 overflow-hidden rounded-xl border border-white/10 bg-[#141416]/40">
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              isSelf={member.id === viewer.id}
              canManage={isAdmin}
              teams={teams}
            />
          ))}

          {members.length === 0 && (
            <li className="px-5 py-16 text-center text-sm text-[#6f6c66]">
              No members are visible to you yet.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

function MemberRow({
  member,
  isSelf,
  canManage,
  teams,
}: {
  member: Member;
  isSelf: boolean;
  canManage: boolean;
  teams: { id: string; name: string }[];
}) {
  const initial = member.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5 text-sm font-medium text-[#cfccc4]">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium text-[#f5f3ef]">
            <span className="truncate">{member.name}</span>
            {isSelf && (
              <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#8a8780]">
                You
              </span>
            )}
          </p>
          <p className="truncate text-xs text-[#8a8780]">{member.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Admins manage everyone but themselves — the role route rejects
            self-edits, so we keep our own row read-only for consistency. */}
        {canManage && !isSelf ? (
          <MemberControls
            userId={member.id}
            role={member.role}
            teamId={member.team?.id ?? null}
            teams={teams}
          />
        ) : (
          <>
            <RoleBadge role={member.role} />
            <span className="min-w-20 text-right text-xs text-[#8a8780]">
              {member.team?.name ?? "No team"}
            </span>
          </>
        )}
        <span className="hidden w-24 text-right text-xs text-[#6f6c66] sm:inline">
          {joinedFormatter.format(member.createdAt)}
        </span>
      </div>
    </li>
  );
}
