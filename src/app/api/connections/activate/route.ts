import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { readData } from "@/lib/storage"
import type { ConnectionProfile } from "@/types"

export async function POST(req: NextRequest) {
  const { connectionId } = await req.json()

  if (!connectionId) {
    return NextResponse.json({ error: "connectionId is required" }, { status: 400 })
  }

  const profiles = readData<ConnectionProfile[]>("connections", [])
  const profile = profiles.find((p) => p.id === connectionId)
  if (!profile) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 })
  }

  const session = await getSession()
  if (!session.connections) session.connections = {}
  session.connections[connectionId] = {
    environmentNumber: profile.environmentNumber,
    token: profile.token,
  }
  session.activeConnectionId = connectionId
  await session.save()

  return NextResponse.json({ success: true, activeConnectionId: connectionId })
}
