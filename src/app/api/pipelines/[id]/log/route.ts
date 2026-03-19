import { NextRequest, NextResponse } from "next/server"
import { readData } from "@/lib/storage"
import type { PipelineExecution } from "@/types"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const executions = await readData<PipelineExecution[]>("executions", [])
  const pipelineExecutions = executions
    .filter((e) => e.pipelineId === params.id)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())

  return NextResponse.json(pipelineExecutions)
}
