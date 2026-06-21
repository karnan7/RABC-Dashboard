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
        { error: "You are not authorized to assign a role" },
        { status: 403 },
      );
    }

    const { userId } = await context.params;
    const { role } = await request.json();

    // Prevent users from changing their own role
    if (userId === viewer.id) {
      return NextResponse.json(
        { error: "You can't change your own role" },
        { status: 401 },
      );
    }

    // validate role
    const validRoles = [Role.USER, Role.MANAGER];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
        include: { team: true },
      });

      return NextResponse.json({
        user: updatedUser,
        message: `User role updated to ${role} successfully`,
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
    console.error("Role assignment error", error);
    return NextResponse.json(
      { error: "Internal Server error. Something went wrong!" },
      { status: 500 },
    );
  }
}
