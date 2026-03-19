import { NextRequest, NextResponse } from "next/server"
import { AfasClient } from "@/lib/afasClient"
import { readData } from "@/lib/storage"
import type { ConnectionProfile } from "@/types"

export async function POST(req: NextRequest) {
  const body = await req.json()
  let environmentNumber: string
  let token: string

  if (body.connectionId) {
    const profiles = readData<ConnectionProfile[]>("connections", [])
    const profile = profiles.find((p) => p.id === body.connectionId)
    if (!profile) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 })
    }
    environmentNumber = profile.environmentNumber
    token = profile.token
  } else {
    environmentNumber = body.environmentNumber
    token = body.token
  }

  if (!environmentNumber || !token) {
    return NextResponse.json(
      { error: "environmentNumber and token are required" },
      { status: 400 }
    )
  }

  try {
    const client = new AfasClient(environmentNumber, token)
    const result = await client.getMetaInfo()

    if (result.status === 200) {
      return NextResponse.json({
        success: true,
        message: "Verbinding succesvol!",
        data: result.data,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Verbinding mislukt",
          error: result.data,
        },
        { status: result.status }
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Verbinding mislukt",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
