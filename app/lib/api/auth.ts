/**
 * Auth API — typed functions for the `app/api/auth/**` routes.
 *
 * Sits between UI and the low-level `apiClient`: callers use `login(...)`
 * etc. and never touch URLs, request shapes, or `ApiError` plumbing.
 *
 * Heads-up: these routes are NOT uniform in their response shape, so the
 * return types are deliberately per-route:
 *   - login / register → `{ user: AuthUser }`  (AuthUser carries a `token`)
 *   - me               → the bare `User` object (NOT wrapped in `{ user }`)
 *   - logout           → `{ messsage: string }` (server's typo, preserved)
 */

import { apiClient } from "@/app/lib/api-client";
import type { User } from "@/app/types";

/**
 * Shape returned by login/register: a trimmed `User` plus a `token`. It omits
 * `createdAt`/`updatedAt`, so it is not interchangeable with the full `User`
 * returned by `getCurrentUser()`.
 */
export type AuthUser = Pick<
  User,
  "id" | "email" | "name" | "role" | "teamId" | "team"
> & {
  token: string;
};

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  /** Optional invite code; omit to join no team. */
  teamCode?: string;
}

/** POST /api/auth/login — sets the httpOnly `token` cookie on success. */
export function login(email: string, password: string) {
  return apiClient.post<{ user: AuthUser }>("/api/auth/login", {
    email,
    password,
  });
}

/** POST /api/auth/register — the first-ever user becomes ADMIN, the rest USER. */
export function register(input: RegisterInput) {
  return apiClient.post<{ user: AuthUser }>("/api/auth/register", input);
}

/**
 * GET /api/auth/me — the current user. Throws `ApiError` (status 401) when not
 * authenticated. Returns the bare `User` object, not `{ user }`.
 */
export function getCurrentUser() {
  return apiClient.get<User>("/api/auth/me");
}

/** POST /api/auth/logout — clears the `token` cookie server-side. */
export function logout() {
  return apiClient.post<{ messsage: string }>("/api/auth/logout");
}
