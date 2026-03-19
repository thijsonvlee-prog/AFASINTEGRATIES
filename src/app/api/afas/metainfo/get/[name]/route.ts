import { NextRequest, NextResponse } from "next/server"
import { AfasClient } from "@/lib/afasClient"
import { readData } from "@/lib/storage"
import type { ConnectionProfile } from "@/types"

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const connectionId = req.headers.get("x-connection-id")

  if (!connectionId) {
    return NextResponse.json({ error: "x-connection-id header is required" }, { status: 400 })
  }

  const profiles = readData<ConnectionProfile[]>("connections", [])
  const profile = profiles.find((p) => p.id === connectionId)
  if (!profile) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 })
  }

  try {
    const client = new AfasClient(profile.environmentNumber, profile.token)
    const result = await client.getGetConnectorMeta(params.name)
    return NextResponse.json(result.data, { status: result.status })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
