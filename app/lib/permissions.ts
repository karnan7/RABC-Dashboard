/**
 * Pure role-permission logic, deliberately free of side-effects.
 *
 * This file imports no database, no cookies, no environment — only types. That
 * keeps it trivially testable: a test can import `checkUserPermission` without
 * spinning up Prisma or a request context. Anything that *does* need those
 * (reading the session, talking to the DB) lives in `auth.ts`.
 */

import { Role, User } from "../types";

/**
 * Role ranking from lowest to highest privilege. A higher number can do
 * everything a lower number can.
 */
const roleHierarchy: Record<Role, number> = {
  [Role.GUEST]: 0,
  [Role.USER]: 1,
  [Role.MANAGER]: 2,
  [Role.ADMIN]: 3,
};

/**
 * True when `user` is allowed to perform an action that requires at least
 * `requiredRole`. Equal rank passes (an ADMIN satisfies "requires ADMIN").
 */
export const checkUserPermission = (
  user: User,
  requiredRole: Role,
): boolean => {
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
};
