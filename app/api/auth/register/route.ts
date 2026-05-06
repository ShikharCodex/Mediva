import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/config/constants";
import { connectToDatabase } from "@/lib/db";
import { signJwt } from "@/lib/jwt";
import { User } from "@/models/User";
import { registerSchema } from "@/validators/auth";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = registerSchema.parse(await req.json());
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }
    const password = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password,
    });
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
      { message: error instanceof Error ? error.message : "Registration failed" },
      { status: 400 },
    );
  }
}
