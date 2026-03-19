import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { readData, writeData } from "@/lib/storage"
import type { ConnectionProfile, ConnectionProfilePublic, EnvironmentType } from "@/types"

function toPublic(c: ConnectionProfile): ConnectionProfilePublic {
  const { token, ...pub } = c
  return pub
}

export async function GET() {
  try {
    const profiles = readData<ConnectionProfile[]>("connections", [])
    return NextResponse.json(profiles.map(toPublic))
  } catch (error) {
    console.error("[API /connections GET]", error)
    return NextResponse.json(
      { error: "Kon verbindingen niet laden", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, environmentNumber, token, environmentType } = body

    if (!name || !environmentNumber || !token) {
      return NextResponse.json(
        { error: "Naam, omgevingsnummer en token zijn verplicht" },
        { status: 400 }
      )
    }

    const validTypes: EnvironmentType[] = ["production", "test", "accept"]
    const envType: EnvironmentType = validTypes.includes(environmentType) ? environmentType : "production"

    const profiles = readData<ConnectionProfile[]>("connections", [])
    const profile: ConnectionProfile = {
      id: uuidv4(),
      name,
      environmentNumber,
      token,
      environmentType: envType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    profiles.push(profile)
    writeData("connections", profiles)

    console.log(`[API /connections POST] Verbinding "${name}" aangemaakt (id: ${profile.id})`)
    return NextResponse.json(toPublic(profile), { status: 201 })
  } catch (error) {
    console.error("[API /connections POST]", error)
    return NextResponse.json(
      { error: "Verbinding opslaan mislukt", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, name, environmentNumber, token, environmentType } = body

    if (!id) {
      return NextResponse.json({ error: "ID is verplicht" }, { status: 400 })
    }

    const profiles = readData<ConnectionProfile[]>("connections", [])
    const index = profiles.findIndex((p) => p.id === id)
    if (index === -1) {
      return NextResponse.json({ error: "Verbinding niet gevonden" }, { status: 404 })
    }

    if (name) profiles[index].name = name
    if (environmentNumber) profiles[index].environmentNumber = environmentNumber
    if (token) profiles[index].token = token
    if (environmentType) profiles[index].environmentType = environmentType
    profiles[index].updatedAt = new Date().toISOString()

    writeData("connections", profiles)

    console.log(`[API /connections PUT] Verbinding "${profiles[index].name}" bijgewerkt`)
    return NextResponse.json(toPublic(profiles[index]))
  } catch (error) {
    console.error("[API /connections PUT]", error)
    return NextResponse.json(
      { error: "Verbinding bijwerken mislukt", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is verplicht" }, { status: 400 })
    }

    const profiles = readData<ConnectionProfile[]>("connections", [])
    const filtered = profiles.filter((p) => p.id !== id)

    if (filtered.length === profiles.length) {
      return NextResponse.json({ error: "Verbinding niet gevonden" }, { status: 404 })
    }

    writeData("connections", filtered)

    console.log(`[API /connections DELETE] Verbinding ${id} verwijderd`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API /connections DELETE]", error)
    return NextResponse.json(
      { error: "Verbinding verwijderen mislukt", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
