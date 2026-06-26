/**
 * Tests for `visibilityConditions` — the function that decides which users a
 * given viewer is allowed to see. This is the heart of our access control, so
 * it's the most important thing to lock down with tests.
 *
 * HOW TO READ A TEST
 * ------------------
 * Every test follows the same three-step rhythm, often called Arrange-Act-Assert:
 *   1. Arrange — set up the input (here: build a fake "viewer" user).
 *   2. Act     — run the function we're testing.
 *   3. Assert  — say what the answer SHOULD be. If reality disagrees, the test fails.
 *
 * `describe(...)` just groups related tests under a heading.
 * `it(...)` (a nicer-reading alias for `test`) is one single test. Read it like
 *   a sentence: it("returns no restrictions for an admin", ...).
 * `expect(x).toEqual(y)` is the assertion: "I expect x to deep-equal y".
 */

import { describe, it, expect } from "vitest";
import { Role } from "@prisma/client";
import type { User } from "../types";
import { visibilityConditions } from "./rbac";

/**
 * A small helper that builds a fake user. The function under test only looks at
 * `id`, `role`, and `teamId`, but the `User` type needs every field — so we
 * fill the rest with throwaway defaults and let each test override what matters.
 */
function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "viewer-id",
    name: "Test Viewer",
    email: "viewer@example.com",
    role: Role.USER,
    teamId: null,
    team: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

describe("visibilityConditions", () => {
  it("returns no restrictions for an admin (they see everyone)", () => {
    const admin = makeUser({ role: Role.ADMIN });

    // An empty array of conditions means "no filter" → every user matches.
    expect(visibilityConditions(admin)).toEqual([]);
  });

  it("lets a manager see non-admins on their team, plus any USER anywhere", () => {
    const manager = makeUser({ role: Role.MANAGER, teamId: "team-1" });

    expect(visibilityConditions(manager)).toEqual([
      { role: { not: Role.ADMIN } },
      { OR: [{ teamId: "team-1" }, { role: Role.USER }] },
    ]);
  });

  it("falls back to 'only myself' for a manager with no team", () => {
    // A teamless manager must NOT accidentally match every other teamless user,
    // so the team match collapses to matching their own id.
    const manager = makeUser({
      id: "mgr-7",
      role: Role.MANAGER,
      teamId: null,
    });

    expect(visibilityConditions(manager)).toEqual([
      { role: { not: Role.ADMIN } },
      { OR: [{ id: "mgr-7" }, { role: Role.USER }] },
    ]);
  });

  it("limits a USER to non-admins on their own team", () => {
    const user = makeUser({ role: Role.USER, teamId: "team-9" });

    expect(visibilityConditions(user)).toEqual([
      { role: { not: Role.ADMIN } },
      { teamId: "team-9" },
    ]);
  });

  it("limits a teamless USER to only themselves", () => {
    const user = makeUser({ id: "solo-1", role: Role.USER, teamId: null });

    expect(visibilityConditions(user)).toEqual([
      { role: { not: Role.ADMIN } },
      { id: "solo-1" },
    ]);
  });

  it("treats a GUEST exactly like a USER (same team-scoped rules)", () => {
    const guest = makeUser({ role: Role.GUEST, teamId: "team-9" });

    expect(visibilityConditions(guest)).toEqual([
      { role: { not: Role.ADMIN } },
      { teamId: "team-9" },
    ]);
  });
});
