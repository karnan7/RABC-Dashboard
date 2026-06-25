"use client";

/**
 * ADMIN-only inline controls for one member row: reassign their role and team.
 *
 * The selects are optimistic — the chosen value shows immediately, then on a
 * failed request we revert and surface the server's message. On success we call
 * `router.refresh()` so the server-rendered list re-pulls the authoritative
 * data (the same refresh pattern used by the login and logout flows).
 *
 * These controls are gated server-side too: the PATCH routes reject non-admins
 * with 403, so this is convenience, not the security boundary.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/app/lib/api-client";
import { updateUserRole, updateUserTeam } from "@/app/lib/api/users";
import { Role } from "@/app/types";

interface TeamOption {
  id: string;
  name: string;
}

interface MemberControlsProps {
  userId: string;
  role: Role;
  teamId: string | null;
  teams: TeamOption[];
}

/** The roles the role route will actually accept. */
const ASSIGNABLE_ROLES: Role[] = [Role.USER, Role.MANAGER];

/** Sentinel `<option>` value standing in for "no team" (PATCH expects null). */
const NO_TEAM = "__none__";

const selectClass =
  "rounded-lg border border-white/10 bg-[#0f0e0c] px-2.5 py-1.5 text-xs text-[#f5f3ef] outline-none transition-colors focus:border-[#e8b04b]/60 focus:ring-2 focus:ring-[#e8b04b]/20 disabled:cursor-not-allowed disabled:opacity-60";

export function MemberControls({
  userId,
  role,
  teamId,
  teams,
}: MemberControlsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Controlled values so we can reflect the choice optimistically and roll it
  // back if the request fails. A successful refresh re-renders with the new
  // server value, which matches what we already set here.
  const [roleValue, setRoleValue] = useState<Role>(role);
  const [teamValue, setTeamValue] = useState<string>(teamId ?? NO_TEAM);

  function run(action: () => Promise<unknown>, revert: () => void) {
    setError("");
    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch (err) {
        revert();
        setError(
          err instanceof ApiError ? err.message : "Update failed. Try again.",
        );
      }
    });
  }

  function onRoleChange(next: Role) {
    const previous = roleValue;
    setRoleValue(next);
    run(
      () => updateUserRole(userId, next),
      () => setRoleValue(previous),
    );
  }

  function onTeamChange(next: string) {
    const previous = teamValue;
    setTeamValue(next);
    run(
      () => updateUserTeam(userId, next === NO_TEAM ? null : next),
      () => setTeamValue(previous),
    );
  }

  // The route only assigns USER/MANAGER, but a member may currently be GUEST or
  // ADMIN. Keep that value selectable-but-shown so the control isn't blank.
  const roleOptions = ASSIGNABLE_ROLES.includes(roleValue)
    ? ASSIGNABLE_ROLES
    : [roleValue, ...ASSIGNABLE_ROLES];

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <select
          aria-label="Role"
          value={roleValue}
          disabled={pending}
          onChange={(e) => onRoleChange(e.target.value as Role)}
          className={selectClass}
        >
          {roleOptions.map((r) => (
            <option
              key={r}
              value={r}
              disabled={!ASSIGNABLE_ROLES.includes(r)}
            >
              {r}
            </option>
          ))}
        </select>

        <select
          aria-label="Team"
          value={teamValue}
          disabled={pending}
          onChange={(e) => onTeamChange(e.target.value)}
          className={selectClass}
        >
          <option value={NO_TEAM}>No team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
