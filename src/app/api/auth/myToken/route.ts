
import { NextRequest } from "next/server";

export async function GET(request: NextRequest,) {
  const token = request.cookies.get("token");

  if(!token) return new Response(null, { status: 401 });

  return new Response(JSON.stringify({ token: token?.value }), { status: 200 });
}
