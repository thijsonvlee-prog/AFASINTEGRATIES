import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { readData, writeData } from "@/lib/storage"
import type { Pipeline } from "@/types"

export async function GET() {
  const pipelines = await readData<Pipeline[]>("pipelines", [])
  return NextResponse.json(pipelines)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const pipeline: Pipeline = {
    id: uuidv4(),
    name: body.name || "Nieuwe pipeline",
    description: body.description || "",
    connectionId: body.connectionId,
    getConnector: body.getConnector || { name: "", filters: [], sortFields: [], take: 100 },
    transformSteps: body.transformSteps || [],
    updateConnector: body.updateConnector || { name: "", operation: "POST", fieldMappings: [] },
    schedule: body.schedule || { enabled: false },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const pipelines = await readData<Pipeline[]>("pipelines", [])
  pipelines.push(pipeline)
  await writeData("pipelines", pipelines)

  return NextResponse.json(pipeline, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()

  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  const pipelines = await readData<Pipeline[]>("pipelines", [])
  const index = pipelines.findIndex((p) => p.id === body.id)
  if (index === -1) {
    return NextResponse.json({ error: "Pipeline not found" }, { status: 404 })
  }

  pipelines[index] = {
    ...pipelines[index],
    ...body,
    updatedAt: new Date().toISOString(),
  }
  await writeData("pipelines", pipelines)

  return NextResponse.json(pipelines[index])
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  const pipelines = await readData<Pipeline[]>("pipelines", [])
  const filtered = pipelines.filter((p) => p.id !== id)

  if (filtered.length === pipelines.length) {
    return NextResponse.json({ error: "Pipeline not found" }, { status: 404 })
  }

  await writeData("pipelines", filtered)
  return NextResponse.json({ success: true })
}
