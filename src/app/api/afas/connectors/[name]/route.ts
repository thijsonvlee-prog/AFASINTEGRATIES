import { NextRequest, NextResponse } from "next/server"
import { AfasClient } from "@/lib/afasClient"
import { readData } from "@/lib/storage"
import type { ConnectionProfile } from "@/types"

function getProfile(connectionId: string) {
  const profiles = readData<ConnectionProfile[]>("connections", [])
  return profiles.find((p) => p.id === connectionId)
}

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const connectionId = req.headers.get("x-connection-id")
  if (!connectionId) {
    return NextResponse.json({ error: "x-connection-id header is required" }, { status: 400 })
  }

  const profile = getProfile(connectionId)
  if (!profile) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const skip = searchParams.get("skip")
  const take = searchParams.get("take")
  const orderbyfieldids = searchParams.get("orderbyfieldids")
  const filterjson = searchParams.get("filterjson")

  try {
    const client = new AfasClient(profile.environmentNumber, profile.token)

    let filters
    if (filterjson) {
      try {
        const parsed = JSON.parse(filterjson)
        filters = parsed.filters || []
      } catch {
        // pass raw filterjson
      }
    }

    const result = await client.getConnectorData(params.name, {
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      orderbyfieldids: orderbyfieldids || undefined,
      filters,
    })

    return NextResponse.json(result.data, { status: result.status })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const connectionId = req.headers.get("x-connection-id")
  if (!connectionId) {
    return NextResponse.json({ error: "x-connection-id header is required" }, { status: 400 })
  }

  const profile = getProfile(connectionId)
  if (!profile) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 })
  }

  try {
    const body = await req.json()
    const client = new AfasClient(profile.environmentNumber, profile.token)
    const result = await client.insertRecord(params.name, body)
    return NextResponse.json(result.data, { status: result.status })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const connectionId = req.headers.get("x-connection-id")
  if (!connectionId) {
    return NextResponse.json({ error: "x-connection-id header is required" }, { status: 400 })
  }

  const profile = getProfile(connectionId)
  if (!profile) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 })
  }

  try {
    const body = await req.json()
    const client = new AfasClient(profile.environmentNumber, profile.token)
    const result = await client.updateRecord(params.name, body)
    return NextResponse.json(result.data, { status: result.status })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const connectionId = req.headers.get("x-connection-id")
  if (!connectionId) {
    return NextResponse.json({ error: "x-connection-id header is required" }, { status: 400 })
  }

  const profile = getProfile(connectionId)
  if (!profile) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 })
  }

  try {
    const body = await req.json()
    const client = new AfasClient(profile.environmentNumber, profile.token)
    const result = await client.deleteRecord(params.name, body)
    return NextResponse.json(result.data, { status: result.status })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
