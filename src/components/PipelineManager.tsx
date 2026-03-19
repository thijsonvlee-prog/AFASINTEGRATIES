"use client"

import React, { useEffect, useState } from "react"
import { usePipelineStore } from "@/store/pipelineStore"
import { useConnectionStore } from "@/store/connectionStore"
import { useConnectorStore } from "@/store/connectorStore"
import { useTransformStore } from "@/store/transformStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import {
  Plus,
  Play,
  Eye,
  Trash2,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react"
import type { Pipeline, PipelineExecution } from "@/types"

export function PipelineManager() {
  const {
    pipelines,
    executions,
    loading,
    fetchPipelines,
    createPipeline,
    deletePipeline,
    executePipeline,
    fetchExecutionLog,
  } = usePipelineStore()

  const { activeConnectionId, connections } = useConnectionStore()
  const { selectedGetConnector, filters, sortFields, take } = useConnectorStore()
  const { steps, fieldMappings } = useTransformStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [pipelineName, setPipelineName] = useState("")
  const [pipelineDesc, setPipelineDesc] = useState("")
  const [updateConnectorName, setUpdateConnectorName] = useState("")
  const [operation, setOperation] = useState<"POST" | "PUT" | "DELETE">("POST")
  const [expandedPipeline, setExpandedPipeline] = useState<string | null>(null)
  const [executingId, setExecutingId] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<{
    pipelineId: string
    execution: PipelineExecution
    preview?: unknown[]
  } | null>(null)

  useEffect(() => {
    fetchPipelines()
  }, [fetchPipelines])

  const handleCreate = async () => {
    if (!activeConnectionId || !selectedGetConnector) return

    await createPipeline({
      name: pipelineName,
      description: pipelineDesc,
      connectionId: activeConnectionId,
      getConnector: {
        name: selectedGetConnector,
        filters,
        sortFields,
        take,
      },
      transformSteps: steps,
      updateConnector: {
        name: updateConnectorName,
        operation,
        fieldMappings,
      },
    })

    setPipelineName("")
    setPipelineDesc("")
    setDialogOpen(false)
  }

  const handleExecute = async (id: string, dryRun = false) => {
    setExecutingId(id)
    const result = await executePipeline(id, dryRun)
    if (result) {
      setLastResult({ pipelineId: id, ...result })
      await fetchExecutionLog(id)
    }
    setExecutingId(null)
  }

  const toggleExpand = async (id: string) => {
    if (expandedPipeline === id) {
      setExpandedPipeline(null)
    } else {
      setExpandedPipeline(id)
      await fetchExecutionLog(id)
    }
  }

  const getConnectionName = (connId: string) => {
    return connections.find((c) => c.id === connId)?.name || connId
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pipelines</h2>
          <p className="text-muted-foreground text-sm">
            Herbruikbare workflows: Get → Transformatie → Update
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!activeConnectionId || !selectedGetConnector}>
              <Plus className="mr-2 h-4 w-4" /> Nieuwe pipeline
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pipeline opslaan</DialogTitle>
              <DialogDescription>
                Sla de huidige configuratie op als herbruikbare pipeline
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Naam</Label>
                <Input
                  placeholder="Bijv. Medewerkers synchronisatie"
                  value={pipelineName}
                  onChange={(e) => setPipelineName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Beschrijving</Label>
                <Input
                  placeholder="Optionele beschrijving..."
                  value={pipelineDesc}
                  onChange={(e) => setPipelineDesc(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>UpdateConnector naam</Label>
                <Input
                  placeholder="Connector naam"
                  value={updateConnectorName}
                  onChange={(e) => setUpdateConnectorName(e.target.value)}
                />
              </div>

              <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                <p><strong>GetConnector:</strong> {selectedGetConnector}</p>
                <p><strong>Transformatiestappen:</strong> {steps.length}</p>
                <p><strong>Field mappings:</strong> {fieldMappings.length}</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={!pipelineName}>
                Opslaan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {pipelines.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Nog geen pipelines</p>
            <p className="text-sm">
              Configureer een GetConnector, transformatie en UpdateConnector om een pipeline te maken
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {pipelines.map((pipeline) => (
          <Card key={pipeline.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                  {pipeline.description && (
                    <CardDescription>{pipeline.description}</CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{getConnectionName(pipeline.connectionId)}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-sm">
                <Badge variant="secondary" className="text-xs">{pipeline.getConnector.name}</Badge>
                <ArrowRight className="h-3 w-3 hidden sm:block" />
                <Badge variant="secondary" className="text-xs">{pipeline.transformSteps.length} stappen</Badge>
                <ArrowRight className="h-3 w-3 hidden sm:block" />
                <Badge variant="secondary" className="text-xs">
                  {pipeline.updateConnector.name} ({pipeline.updateConnector.operation})
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExecute(pipeline.id, true)}
                  disabled={executingId === pipeline.id}
                >
                  <Eye className="mr-1 h-3 w-3" /> Dry Run
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleExecute(pipeline.id)}
                  disabled={executingId === pipeline.id}
                >
                  {executingId === pipeline.id ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Play className="mr-1 h-3 w-3" />
                  )}
                  Uitvoeren
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleExpand(pipeline.id)}
                >
                  {expandedPipeline === pipeline.id ? (
                    <ChevronUp className="mr-1 h-3 w-3" />
                  ) : (
                    <ChevronDown className="mr-1 h-3 w-3" />
                  )}
                  Log
                </Button>
                <div className="flex-1" />
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => deletePipeline(pipeline.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              {lastResult && lastResult.pipelineId === pipeline.id && (
                <div
                  className={`rounded-md p-3 text-sm ${
                    lastResult.execution.status === "success"
                      ? "bg-green-50 border border-green-200 text-green-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium mb-1">
                    {lastResult.execution.status === "success" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {lastResult.execution.recordsProcessed} verwerkt,{" "}
                    {lastResult.execution.recordsFailed} mislukt
                  </div>
                  {lastResult.preview && (
                    <pre className="mt-2 rounded bg-white/50 p-2 text-xs overflow-auto max-h-[200px]">
                      {JSON.stringify(lastResult.preview, null, 2)}
                    </pre>
                  )}
                </div>
              )}

              {expandedPipeline === pipeline.id && executions[pipeline.id] && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Uitvoerlog</h4>
                  {executions[pipeline.id].length === 0 && (
                    <p className="text-sm text-muted-foreground">Nog niet uitgevoerd</p>
                  )}
                  {executions[pipeline.id].map((exec) => (
                    <ExecutionEntry key={exec.id} execution={exec} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ExecutionEntry({ execution }: { execution: PipelineExecution }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-md border p-3 text-sm">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {execution.status === "success" ? (
            <CheckCircle className="h-3 w-3 text-green-600" />
          ) : execution.status === "error" ? (
            <XCircle className="h-3 w-3 text-red-600" />
          ) : (
            <Loader2 className="h-3 w-3 animate-spin" />
          )}
          <span className="font-medium">
            {new Date(execution.startedAt).toLocaleString("nl-NL")}
          </span>
          <Badge variant={execution.status === "success" ? "success" : "destructive"}>
            {execution.status}
          </Badge>
        </div>
        <span className="text-muted-foreground">
          {execution.recordsProcessed} verwerkt, {execution.recordsFailed} mislukt
        </span>
      </div>

      {expanded && execution.logs.length > 0 && (
        <div className="mt-2 space-y-1 border-t pt-2">
          {execution.logs.map((log, i) => (
            <div
              key={i}
              className={`text-xs ${
                log.level === "error"
                  ? "text-red-600"
                  : log.level === "warn"
                  ? "text-yellow-600"
                  : "text-muted-foreground"
              }`}
            >
              <span className="font-mono">
                {new Date(log.timestamp).toLocaleTimeString("nl-NL")}
              </span>{" "}
              [{log.level}] {log.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
