import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    {
      messsage: "user logged out successfully",
    },
    { status: 200 },
  );
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return response;
}
