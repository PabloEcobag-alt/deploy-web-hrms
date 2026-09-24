import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function middleware(req: any) {
  try {
    return await auth(req);
  } catch (err: any) {
    return NextResponse.json({
      error: "MIDDLEWARE_CRASH",
      message: err?.message || String(err),
      name: err?.name,
      stack: err?.stack
    }, { status: 500 });
  }
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|api/logout).*)"],
};
