import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Prisma, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import type { User } from "@/app/types";

/**
 * RBAC visibility rules: the set of Prisma filters that constrain which users
 * `viewer` is allowed to see. They are AND-combined by the caller, so each
 * entry can only shrink the result set — never widen what RBAC allows.
 */
function visibilityConditions(viewer: User): Prisma.UserWhereInput[] {
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

export async function GET(request: NextRequest) {
  try {
    const viewer = await getCurrentUser();
    if (!viewer) {
      return NextResponse.json(
        { error: "You are not authorized to access this information" },
        { status: 401 },
      );
    }

    const { searchParams } = request.nextUrl;
    const teamId = searchParams.get("team_id");
    const role = searchParams.get("role");

    const conditions = visibilityConditions(viewer);

    // Optional URL filters — AND-ed on top of RBAC, so they can only narrow.
    if (teamId) {
      conditions.push({ teamId });
    }
    if (role && (Object.values(Role) as string[]).includes(role)) {
      conditions.push({ role: role as Role });
    }

    const users = await prisma.user.findMany({
      where: { AND: conditions },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Get users error!", error);
    return NextResponse.json(
      { error: "Internal server error. Something went wrong!" },
      { status: 500 },
    );
  }
}
