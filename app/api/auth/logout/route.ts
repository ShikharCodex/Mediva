import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/config/constants";

export async function POST() {
  (await cookies()).delete(AUTH_COOKIE);
  return NextResponse.json({ message: "Logged out" });
}
