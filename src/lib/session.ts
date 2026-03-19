import { getIronSession, type SessionOptions } from "iron-session"
import { cookies } from "next/headers"

export interface SessionData {
  connections: Record<string, {
    environmentNumber: string
    token: string
  }>
  activeConnectionId?: string
}

export const sessionOptions: SessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD || "complex_password_at_least_32_characters_long_fallback",
  cookieName: "afas-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
}

export async function getSession() {
  const cookieStore = cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}
