import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/config/constants";
import { verifyJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function getAuthUser() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return null;
  try {
    return verifyJwt(token);
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    return {
      error: NextResponse.json(
        { message: "Unauthorized" },
        {
          status: 401,
        },
      ),
    };
  }
  return { user };
}
