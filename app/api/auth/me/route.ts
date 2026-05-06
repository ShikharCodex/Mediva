import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const user = await User.findById(auth.userId).select("name email avatar createdAt");
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
  return NextResponse.json({ user });
}
