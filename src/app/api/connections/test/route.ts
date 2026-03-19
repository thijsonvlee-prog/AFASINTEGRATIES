import { NextRequest, NextResponse } from "next/server"
import { AfasClient } from "@/lib/afasClient"
import { readData } from "@/lib/storage"
import type { ConnectionProfile, EnvironmentType } from "@/types"

export async function POST(req: NextRequest) {
  const body = await req.json()
  let environmentNumber: string
  let token: string
  let environmentType: EnvironmentType = "production"

  if (body.connectionId) {
    const profiles = readData<ConnectionProfile[]>("connections", [])
    const profile = profiles.find((p) => p.id === body.connectionId)
    if (!profile) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 })
    }
    environmentNumber = profile.environmentNumber
    token = profile.token
    environmentType = profile.environmentType
  } else {
    environmentNumber = body.environmentNumber
    token = body.token
    environmentType = body.environmentType || "production"
  }

  if (!environmentNumber || !token) {
    return NextResponse.json(
      { error: "environmentNumber and token are required" },
      { status: 400 }
    )
  }

  try {
    const client = new AfasClient(environmentNumber, token, environmentType)
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
          message: `Verbinding mislukt (HTTP ${result.status})`,
          error: result.data,
        },
        { status: result.status }
      )
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Onbekende fout"
    return NextResponse.json(
      {
        success: false,
        message: `Verbinding mislukt: ${message}`,
        error: message,
      },
      { status: 500 }
    )
  }
}
