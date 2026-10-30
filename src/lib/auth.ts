import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { db } from "./db";
import { env, isProd } from "./env";

const SESSION_COOKIE = "aura_session";
const ANON_COOKIE = "aura_anon";
const SESSION_DAYS = 30;

function secretKey() {
  if (!env.authSecret) {
    if (isProd()) throw new Error("AUTH_SECRET must be set in production");
    return new TextEncoder().encode("dev-only-insecure-secret-change-me-please");
  }
  return new TextEncoder().encode(env.authSecret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 11);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getUserId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  plan: string;
  isAdmin: boolean;
};

export async function getUser(): Promise<SessionUser | null> {
  const id = await getUserId();
  if (!id) return null;
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    credits: user.credits,
    plan: user.plan,
    isAdmin: env.adminEmails.includes(user.email.toLowerCase()),
  };
}

/** Anonymous visitor id, used to let people run a free scan before signing up and claim it afterwards. */
export async function getOrCreateAnonId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(ANON_COOKIE)?.value;
  if (existing) return existing;
  const id = randomUUID();
  jar.set(ANON_COOKIE, id, {
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return id;
}

export async function getAnonId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ANON_COOKIE)?.value ?? null;
}

/** Attach anonymous scans to a user after signup/login. */
export async function claimAnonProjects(userId: string) {
  const anonId = await getAnonId();
  if (!anonId) return;
  await db.project.updateMany({ where: { anonId, userId: null }, data: { userId } });
}

/** For pages: the signed-in user, or a redirect to login. (Layouts and pages render in parallel, so every page must check.) */
export async function requireUser(next = "/app"): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}
