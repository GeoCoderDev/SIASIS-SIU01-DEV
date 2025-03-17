import { NextRequest } from "next/server";
import { serialize } from "cookie";

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get("token");

  if (!token) return new Response(null, { status: 401 });

  const cookieNombres = serialize("Nombres", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });
  const cookieApellidos = serialize("Apellidos", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });
  const cookieGenero = serialize("Genero", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });

  const cookieRole = serialize("Rol", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "strict",
    maxAge: 0, // Expirar la cookie inmediatamente
  });
  const cookieToken = serialize("token", "", {
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
      "Set-Cookie": `${cookieNombres}, ${cookieApellidos}, ${cookieGenero}, ${cookieToken}, ${cookieRole}, ${googleDriveFotoId}`,
    },
  });
}
