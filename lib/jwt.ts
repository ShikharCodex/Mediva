import jwt from "jsonwebtoken";
import { getEnv } from "@/lib/env";

type JwtPayload = {
  userId: string;
  email: string;
};

export function signJwt(payload: JwtPayload) {
  const env = getEnv();
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyJwt(token: string): JwtPayload {
  const env = getEnv();
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
