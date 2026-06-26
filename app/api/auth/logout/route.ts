import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    {
      message: "user logged out successfully",
    },
    { status: 200 },
  );
  // maxAge: 0 expires the cookie immediately so the browser drops it, rather
  // than relying on an empty value lingering as a session cookie.
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });
  return response;
}
