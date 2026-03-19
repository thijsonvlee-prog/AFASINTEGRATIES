import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { readData, writeData } from "@/lib/storage"
import { AfasClient } from "@/lib/afasClient"
import { applyTransformations } from "@/lib/transformer"
import type { Pipeline, PipelineExecution, ConnectionProfile, ExecutionLogEntry } from "@/types"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const pipelines = readData<Pipeline[]>("pipelines", [])
  const pipeline = pipelines.find((p) => p.id === params.id)
  if (!pipeline) {
    return NextResponse.json({ error: "Pipeline not found" }, { status: 404 })
  }

  const profiles = readData<ConnectionProfile[]>("connections", [])
  const profile = profiles.find((p) => p.id === pipeline.connectionId)
  if (!profile) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 })
  }

  const body = await req.json().catch(() => ({}))
  const dryRun = body.dryRun === true

  const execution: PipelineExecution = {
    id: uuidv4(),
    pipelineId: pipeline.id,
    status: "running",
    startedAt: new Date().toISOString(),
    recordsProcessed: 0,
    recordsFailed: 0,
    logs: [],
  }

  const addLog = (level: ExecutionLogEntry["level"], message: string, details?: unknown) => {
    execution.logs.push({ timestamp: new Date().toISOString(), level, message, details })
  }

  try {
    const client = new AfasClient(profile.environmentNumber, profile.token, profile.environmentType)

    // Step 1: Get data
    addLog("info", `Data ophalen via GetConnector: ${pipeline.getConnector.name}`)
    const getResult = await client.getConnectorData(pipeline.getConnector.name, {
      take: pipeline.getConnector.take,
      filters: pipeline.getConnector.filters,
      orderbyfieldids: pipeline.getConnector.sortFields
        .map((s) => `${s.order === "DESC" ? "-" : ""}${s.fieldId}`)
        .join(",") || undefined,
    })

    if (getResult.status !== 200) {
      throw new Error(`GetConnector fout: ${JSON.stringify(getResult.data)}`)
    }

    const rawData = (getResult.data as { rows?: Record<string, unknown>[] })?.rows || []
    addLog("info", `${rawData.length} records opgehaald`)

    // Step 2: Transform data
    addLog("info", "Transformaties toepassen...")
    const transformedData = applyTransformations(rawData, pipeline.transformSteps)
    addLog("info", `${transformedData.length} records na transformatie`)

    // Step 3: Map fields for UpdateConnector
    const mappedData = transformedData.map((row) => {
      const mapped: Record<string, unknown> = {}
      for (const mapping of pipeline.updateConnector.fieldMappings) {
        if (row[mapping.sourceField] !== undefined) {
          mapped[mapping.targetField] = row[mapping.sourceField]
        }
      }
      return mapped
    })

    if (dryRun) {
      addLog("info", "Dry run - geen data verzonden naar AFAS")
      execution.status = "success"
      execution.completedAt = new Date().toISOString()
      execution.recordsProcessed = mappedData.length

      return NextResponse.json({
        execution,
        preview: mappedData.slice(0, 10),
        totalRecords: mappedData.length,
      })
    }

    // Step 4: Send to UpdateConnector
    addLog("info", `Data versturen naar UpdateConnector: ${pipeline.updateConnector.name} (${pipeline.updateConnector.operation})`)

    let processed = 0
    let failed = 0

    for (const record of mappedData) {
      try {
        const payload = {
          [pipeline.updateConnector.name]: {
            Element: {
              Fields: record,
            },
          },
        }

        let result
        switch (pipeline.updateConnector.operation) {
          case "POST":
            result = await client.insertRecord(pipeline.updateConnector.name, payload)
            break
          case "PUT":
            result = await client.updateRecord(pipeline.updateConnector.name, payload)
            break
          case "DELETE":
            result = await client.deleteRecord(pipeline.updateConnector.name, payload)
            break
        }

        if (result.status >= 200 && result.status < 300) {
          processed++
        } else {
          failed++
          addLog("error", `Record mislukt: ${JSON.stringify(result.data)}`, record)
        }
      } catch (error) {
        failed++
        addLog("error", `Record error: ${error instanceof Error ? error.message : "Unknown"}`, record)
      }
    }

    execution.recordsProcessed = processed
    execution.recordsFailed = failed
    execution.status = failed > 0 && processed === 0 ? "error" : "success"
    execution.completedAt = new Date().toISOString()
    addLog("info", `Klaar: ${processed} verwerkt, ${failed} mislukt`)

    // Save execution log
    const executions = readData<PipelineExecution[]>("executions", [])
    executions.push(execution)
    writeData("executions", executions)

    return NextResponse.json({ execution })
  } catch (error) {
    execution.status = "error"
    execution.error = error instanceof Error ? error.message : "Unknown error"
    execution.completedAt = new Date().toISOString()
    addLog("error", execution.error)

    const executions = readData<PipelineExecution[]>("executions", [])
    executions.push(execution)
    writeData("executions", executions)

    return NextResponse.json({ execution }, { status: 500 })
  }
}
