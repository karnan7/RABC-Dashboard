import { generateToken } from "@/app/lib/auth";
import { verifyPassword } from "@/app/lib/password";
import { prisma } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

// A well-formed bcrypt hash that no real password matches. When the email is
// unknown we still run a compare against this so the response timing doesn't
// reveal whether the account exists (it never matches → same "invalid" path).
const DUMMY_HASH =
  "$2b$12$/SxnLwwoLCj4ZdRWDNTSFuuxkFPakbUpL3iAkNTTxmh7227IHspZ.";

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
      // Opt back in to the hash — needed here to verify the password.
      omit: { password: false },
    });

    // Always run a bcrypt compare — even when the user is missing — so a
    // non-existent email and a wrong password take the same time and return
    // the same message. This avoids leaking which emails are registered.
    const isValidPassword = await verifyPassword(
      password,
      userFromDB?.password ?? DUMMY_HASH,
    );

    if (!userFromDB || !isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
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
