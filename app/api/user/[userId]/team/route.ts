import { checkUserPermission, getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Prisma, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const viewer = await getCurrentUser();
    if (!viewer) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 },
      );
    }
    if (!checkUserPermission(viewer, Role.ADMIN)) {
      return NextResponse.json(
        { error: "You are not authorized to assign a team" },
        { status: 403 },
      );
    }

    const { userId } = await context.params;
    const { teamId } = await request.json();

    // teamId in the body drives the action: a string assigns that team,
    // `null` removes the user from their team. `undefined` is a bad request.
    if (teamId === undefined) {
      return NextResponse.json(
        { error: "teamId is required (send null to remove from a team)" },
        { status: 400 },
      );
    }

    // When assigning, the target team must exist.
    if (teamId !== null) {
      const team = await prisma.team.findUnique({ where: { id: teamId } });
      if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { teamId },
        include: { team: true },
      });

      return NextResponse.json({
        user: updatedUser,
        message:
          teamId === null
            ? "User removed from team successfully"
            : "User assigned to team successfully",
      });
    } catch (err) {
      // update throws P2025 when no user matches the given id.
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      throw err;
    }
  } catch (error) {
    console.error("Team assignment error", error);
    return NextResponse.json(
      { error: "Internal Server error. Something went wrong!" },
      { status: 500 },
    );
  }
}
