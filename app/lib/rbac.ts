/**
 * Shared RBAC primitives for reading the user directory.
 *
 * Both the `GET /api/user` route and the server-rendered dashboard need the
 * *same* answer to "which users may this viewer see?". Keeping that logic here
 * means there is one source of truth — the API and the page can never drift
 * into showing different sets of people for the same role.
 */

import { Prisma, Role } from "@prisma/client";
import type { User } from "../types";

/**
 * The set of Prisma filters that constrain which users `viewer` may see. They
 * are AND-combined by the caller, so each entry can only shrink the result set
 * — never widen what RBAC allows.
 */
export function visibilityConditions(viewer: User): Prisma.UserWhereInput[] {
  // Team-scoped match. A viewer with no team must not match every other
  // teamless user, so fall back to "only myself".
  const sameTeam: Prisma.UserWhereInput = viewer.teamId
    ? { teamId: viewer.teamId }
    : { id: viewer.id };

  switch (viewer.role) {
    case Role.ADMIN:
      // Admin sees everyone — no restriction.
      return [];

    case Role.MANAGER:
      // Non-admins on the manager's team, plus any plain USER anywhere.
      return [
        { role: { not: Role.ADMIN } },
        { OR: [sameTeam, { role: Role.USER }] },
      ];

    default:
      // USER / GUEST: non-admins on their own team only.
      return [{ role: { not: Role.ADMIN } }, sameTeam];
  }
}

/**
 * The columns surfaced for a directory listing. Deliberately excludes
 * `password` and other internals; nests a trimmed team.
 */
export const memberSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  team: { select: { id: true, name: true } },
} satisfies Prisma.UserSelect;

/** A single row as returned by a `memberSelect` query. */
export type Member = Prisma.UserGetPayload<{ select: typeof memberSelect }>;
