import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { memberSelect, visibilityConditions } from "@/app/lib/rbac";

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
      select: memberSelect,
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
