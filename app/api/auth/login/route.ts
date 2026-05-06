import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/config/constants";
import { connectToDatabase } from "@/lib/db";
import { signJwt } from "@/lib/jwt";
import { User } from "@/models/User";
import { loginSchema } from "@/validators/auth";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = loginSchema.parse(await req.json());
    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    const token = signJwt({ userId: user._id.toString(), email: user.email });
    (await cookies()).set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Login failed" },
      { status: 400 },
    );
  }
}
