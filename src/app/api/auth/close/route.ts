import { NextRequest } from "next/server";
import { serialize } from "cookie";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token");

  if (!token) return new Response(null, { status: 401 });

  const cookieToken = serialize("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "strict",
    maxAge: 0, // Expirar la cookie inmediatamente
  });

  const cookieRole = serialize("Rol", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "strict",
    maxAge: 0, // Expirar la cookie inmediatamente
  });

  const googleDriveFotoId = serialize("Google_Drive_Foto_ID", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "strict",
    maxAge: 0, // Expirar la cookie inmediatamente
  });

  return new Response(null, {
    status: 200,
    headers: {
      "Set-Cookie": `${cookieToken}, ${cookieRole}, ${googleDriveFotoId}`,
    },
  });
}
