/**
 * Tests for `checkUserPermission` — "is this user allowed to do something that
 * needs at least role X?"
 *
 * NEW TECHNIQUE: table-driven tests (`it.each`)
 * ---------------------------------------------
 * When a function is really a truth table — every (input, input) pair has a
 * known yes/no answer — writing 16 near-identical `it(...)` blocks is noise.
 * `it.each([...])` runs the SAME test body once per row of a table. One row =
 * one case. Add a row, you've added a test. This is the cleanest way to prove
 * a permission matrix is exactly right, with no gaps.
 */

import { describe, it, expect } from "vitest";
import { Role } from "@prisma/client";
import type { User } from "../types";
import { checkUserPermission } from "./permissions";

/** Build a fake user that has the given role. Only `role` matters here. */
function userWithRole(role: Role): User {
  return {
    id: "u1",
    name: "Test User",
    email: "u1@example.com",
    role,
    teamId: null,
    team: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };
}

describe("checkUserPermission", () => {
  // The full matrix: [the user's role, the role required, expected answer].
  // Read each row as a sentence: "a USER, when MANAGER is required, is false".
  const cases: Array<[Role, Role, boolean]> = [
    // GUEST (lowest) can only satisfy a GUEST requirement.
    [Role.GUEST, Role.GUEST, true],
    [Role.GUEST, Role.USER, false],
    [Role.GUEST, Role.MANAGER, false],
    [Role.GUEST, Role.ADMIN, false],

    // USER outranks GUEST, nothing higher.
    [Role.USER, Role.GUEST, true],
    [Role.USER, Role.USER, true],
    [Role.USER, Role.MANAGER, false],
    [Role.USER, Role.ADMIN, false],

    // MANAGER outranks USER and below, but not ADMIN.
    [Role.MANAGER, Role.GUEST, true],
    [Role.MANAGER, Role.USER, true],
    [Role.MANAGER, Role.MANAGER, true],
    [Role.MANAGER, Role.ADMIN, false],

    // ADMIN (highest) satisfies every requirement.
    [Role.ADMIN, Role.GUEST, true],
    [Role.ADMIN, Role.USER, true],
    [Role.ADMIN, Role.MANAGER, true],
    [Role.ADMIN, Role.ADMIN, true],
  ];

  it.each(cases)(
    "a %s, when %s is required → %s",
    (userRole, requiredRole, expected) => {
      expect(checkUserPermission(userWithRole(userRole), requiredRole)).toBe(
        expected,
      );
    },
  );
});
