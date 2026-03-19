import { NextRequest, NextResponse } from "next/server"
import { readData, writeData } from "@/lib/storage"
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

  // Sla de actieve verbinding op in een apart bestand
  writeData("active-connection", { connectionId })

  return NextResponse.json({ success: true, activeConnectionId: connectionId })
}

export async function GET() {
  const data = readData<{ connectionId: string } | null>("active-connection", null)
  return NextResponse.json({ activeConnectionId: data?.connectionId || null })
}
