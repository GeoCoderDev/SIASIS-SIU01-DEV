import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";

export async function PUT(request: NextRequest, res: NextResponse) {
  const token = request.cookies.get("myToken");

  if (!token) return new Response(null, { status: 401 });

  const cookieToken = serialize("myToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "strict",
    maxAge: 0, // Expirar la cookie inmediatamente
  });

  const cookieRole = serialize("myRole", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "strict",
    maxAge: 0, // Expirar la cookie inmediatamente
  });

  return new Response(null, {
    status: 200,
    headers: { "Set-Cookie": `${cookieToken}, ${cookieRole}` },
  });
}
