import { generateToken, verifyPassword } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    // validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email & password are required." },
        { status: 400 },
      );
    }
    // Find existing user
    const userFromDB = await prisma.user.findUnique({
      where: { email },
      include: { team: true },
    });

    if (!userFromDB) {
      return NextResponse.json({ error: "Invalid user" }, { status: 401 });
    }

    const isValidPassword = await verifyPassword(password, userFromDB.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid Credentials" },
        { status: 401 },
      );
    }

    const generatedToken = generateToken(userFromDB.id);

    const response = NextResponse.json({
      user: {
        id: userFromDB.id,
        email: userFromDB.email,
        name: userFromDB.name,
        role: userFromDB.role,
        teamId: userFromDB.teamId,
        team: userFromDB.team,
        token: generatedToken,
      },
    });

    // set cookie
    response.cookies.set("token", generatedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json(
      { error: "Internal server error, Something went wrong!" },
      { status: 500 },
    );
  }
}
