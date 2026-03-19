"use client"

import React, { useEffect, useState } from "react"
import { usePipelineStore } from "@/store/pipelineStore"
import { useConnectionStore } from "@/store/connectionStore"
import { useConnectorStore } from "@/store/connectorStore"
import { useTransformStore } from "@/store/transformStore"
import { useToastStore } from "@/store/toastStore"
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
  GitBranch,
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
  const { addToast } = useToastStore()

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
    addToast({ type: "success", title: "Pipeline aangemaakt", description: `"${pipelineName}" is opgeslagen` })
  }

  const handleExecute = async (id: string, name: string, dryRun = false) => {
    setExecutingId(id)
    const result = await executePipeline(id, dryRun)
    if (result) {
      setLastResult({ pipelineId: id, ...result })
      await fetchExecutionLog(id)
      addToast({
        type: result.execution.status === "success" ? "success" : "error",
        title: dryRun ? "Dry Run klaar" : (result.execution.status === "success" ? "Pipeline geslaagd" : "Pipeline mislukt"),
        description: `${result.execution.recordsProcessed} verwerkt, ${result.execution.recordsFailed} mislukt`,
      })
    }
    setExecutingId(null)
  }

  const handleDelete = async (id: string, name: string) => {
    await deletePipeline(id)
    addToast({ type: "info", title: "Pipeline verwijderd", description: `"${name}" is verwijderd` })
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

              <div className="rounded-xl bg-muted/50 p-4 text-sm space-y-1.5">
                <p><span className="font-medium">GetConnector:</span> {selectedGetConnector}</p>
                <p><span className="font-medium">Transformatiestappen:</span> {steps.length}</p>
                <p><span className="font-medium">Field mappings:</span> {fieldMappings.length}</p>
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
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 mb-4">
              <GitBranch className="h-7 w-7 text-emerald-500" />
            </div>
            <p className="text-lg font-semibold text-foreground">Nog geen pipelines</p>
            <p className="text-sm text-center max-w-xs">
              Configureer een GetConnector, transformatie en UpdateConnector om een pipeline te maken
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {pipelines.map((pipeline) => (
          <Card key={pipeline.id} className="hover:shadow-card-hover transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{pipeline.name}</CardTitle>
                  {pipeline.description && (
                    <CardDescription className="mt-0.5">{pipeline.description}</CardDescription>
                  )}
                </div>
                <Badge variant="outline" className="font-normal">{getConnectionName(pipeline.connectionId)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Badge variant="info" className="text-xs">{pipeline.getConnector.name}</Badge>
                <ArrowRight className="h-3 w-3 text-muted-foreground hidden sm:block" />
                <Badge variant="secondary" className="text-xs">{pipeline.transformSteps.length} stappen</Badge>
                <ArrowRight className="h-3 w-3 text-muted-foreground hidden sm:block" />
                <Badge variant="warning" className="text-xs">
                  {pipeline.updateConnector.name} ({pipeline.updateConnector.operation})
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExecute(pipeline.id, pipeline.name, true)}
                  disabled={executingId === pipeline.id}
                >
                  <Eye className="mr-1 h-3 w-3" /> Dry Run
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleExecute(pipeline.id, pipeline.name)}
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
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(pipeline.id, pipeline.name)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              {lastResult && lastResult.pipelineId === pipeline.id && (
                <div
                  className={`rounded-xl p-4 text-sm animate-scale-in ${
                    lastResult.execution.status === "success"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    {lastResult.execution.status === "success" ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500 animate-success-pop" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    {lastResult.execution.recordsProcessed} verwerkt,{" "}
                    {lastResult.execution.recordsFailed} mislukt
                  </div>
                  {lastResult.preview && (
                    <pre className="mt-2 rounded-lg bg-white/50 p-2 text-xs overflow-auto max-h-[200px] font-mono">
                      {JSON.stringify(lastResult.preview, null, 2)}
                    </pre>
                  )}
                </div>
              )}

              {expandedPipeline === pipeline.id && executions[pipeline.id] && (
                <div className="space-y-2 animate-slide-up">
                  <h4 className="text-sm font-semibold">Uitvoerlog</h4>
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
    <div className="rounded-lg border p-3 text-sm bg-card">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {execution.status === "success" ? (
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
          ) : execution.status === "error" ? (
            <XCircle className="h-3.5 w-3.5 text-red-500" />
          ) : (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          )}
          <span className="font-medium">
            {new Date(execution.startedAt).toLocaleString("nl-NL")}
          </span>
          <Badge variant={execution.status === "success" ? "success" : "destructive"} className="text-xs">
            {execution.status}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {execution.recordsProcessed} verwerkt, {execution.recordsFailed} mislukt
        </span>
      </div>

      {expanded && execution.logs.length > 0 && (
        <div className="mt-3 space-y-1 border-t pt-3">
          {execution.logs.map((log, i) => (
            <div
              key={i}
              className={`text-xs ${
                log.level === "error"
                  ? "text-red-600"
                  : log.level === "warn"
                  ? "text-amber-600"
                  : "text-muted-foreground"
              }`}
            >
              <span className="font-mono text-[10px] opacity-60">
                {new Date(log.timestamp).toLocaleTimeString("nl-NL")}
              </span>{" "}
              <Badge variant={log.level === "error" ? "destructive" : log.level === "warn" ? "warning" : "secondary"} className="text-[10px] px-1.5 py-0">
                {log.level}
              </Badge>{" "}
              {log.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
