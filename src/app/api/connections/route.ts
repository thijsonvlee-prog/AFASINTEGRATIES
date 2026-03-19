import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { getSession } from "@/lib/session"
import { readData, writeData } from "@/lib/storage"
import type { ConnectionProfile, ConnectionProfilePublic } from "@/types"

function toPublic(c: ConnectionProfile): ConnectionProfilePublic {
  const { token, ...pub } = c
  return pub
}

export async function GET() {
  const profiles = readData<ConnectionProfile[]>("connections", [])
  return NextResponse.json(profiles.map(toPublic))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, environmentNumber, token, isProduction } = body

  if (!name || !environmentNumber || !token) {
    return NextResponse.json(
      { error: "name, environmentNumber, and token are required" },
      { status: 400 }
    )
  }

  const profiles = readData<ConnectionProfile[]>("connections", [])
  const profile: ConnectionProfile = {
    id: uuidv4(),
    name,
    environmentNumber,
    token,
    isProduction: isProduction ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  profiles.push(profile)
  writeData("connections", profiles)

  // Store token in session
  const session = await getSession()
  if (!session.connections) session.connections = {}
  session.connections[profile.id] = { environmentNumber, token }
  await session.save()

  return NextResponse.json(toPublic(profile), { status: 201 })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, name, environmentNumber, token, isProduction } = body

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  const profiles = readData<ConnectionProfile[]>("connections", [])
  const index = profiles.findIndex((p) => p.id === id)
  if (index === -1) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 })
  }

  if (name) profiles[index].name = name
  if (environmentNumber) profiles[index].environmentNumber = environmentNumber
  if (token) profiles[index].token = token
  if (isProduction !== undefined) profiles[index].isProduction = isProduction
  profiles[index].updatedAt = new Date().toISOString()

  writeData("connections", profiles)

  // Update session
  const session = await getSession()
  if (!session.connections) session.connections = {}
  session.connections[id] = {
    environmentNumber: profiles[index].environmentNumber,
    token: profiles[index].token,
  }
  await session.save()

  return NextResponse.json(toPublic(profiles[index]))
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  const profiles = readData<ConnectionProfile[]>("connections", [])
  const filtered = profiles.filter((p) => p.id !== id)

  if (filtered.length === profiles.length) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 })
  }

  writeData("connections", filtered)

  const session = await getSession()
  if (session.connections) {
    delete session.connections[id]
    await session.save()
  }

  return NextResponse.json({ success: true })
}
