/**
 * Users API — typed functions for the `app/api/user/**` routes.
 *
 * All of these are RBAC-gated server-side; the role/team mutations require an
 * ADMIN caller and will throw `ApiError` (status 403) otherwise.
 */

import { apiClient } from "@/app/lib/api-client";
import type { Role, User } from "@/app/types";

/**
 * A row from `GET /api/user`. The route hand-picks these columns (not the full
 * `User`), and nests a trimmed team, so this is its own shape.
 */
export interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  team: { id: string; name: string } | null;
}

export interface ListUsersParams {
  teamId?: string;
  role?: Role;
}

/**
 * GET /api/user — users visible to the current caller under RBAC, optionally
 * narrowed by team and/or role. Filters can only shrink the visible set.
 */
export function listUsers(params: ListUsersParams = {}) {
  const qs = new URLSearchParams();
  if (params.teamId) qs.set("team_id", params.teamId);
  if (params.role) qs.set("role", params.role);

  const query = qs.toString();
  return apiClient.get<{ users: UserListItem[] }>(
    `/api/user${query ? `?${query}` : ""}`,
  );
}

/**
 * PATCH /api/user/:userId/role — assign a role (ADMIN only). The route accepts
 * only USER or MANAGER, and rejects changing your own role.
 */
export function updateUserRole(userId: string, role: Role) {
  return apiClient.patch<{ user: User; message: string }>(
    `/api/user/${userId}/role`,
    { role },
  );
}

/**
 * PATCH /api/user/:userId/team — assign or clear a user's team (ADMIN only).
 * Pass a team id to assign, or `null` to remove the user from their team.
 */
export function updateUserTeam(userId: string, teamId: string | null) {
  return apiClient.patch<{ user: User; message: string }>(
    `/api/user/${userId}/team`,
    { teamId },
  );
}
