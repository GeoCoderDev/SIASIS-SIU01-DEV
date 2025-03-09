import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, res: NextResponse) {
  const token = request.cookies.get("myToken");

  if(!token) return new Response(null, { status: 401 });

  return new Response(JSON.stringify({ token: token?.value }), { status: 200 });
}
