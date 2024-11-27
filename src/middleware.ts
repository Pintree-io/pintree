import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultSettings } from "@/config/site-settings";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  return response;
}

export const config = {
  matcher: "/:path*",
};
