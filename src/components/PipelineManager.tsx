"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { usePipelineStore } from "@/store/pipelineStore"
import { useConnectionStore } from "@/store/connectionStore"
import { useConnectorStore } from "@/store/connectorStore"
import { useTransformStore } from "@/store/transformStore"
import { useToastStore } from "@/store/toastStore"
import { BentoCard, BentoGrid, BentoLabel, BentoValue, bentoSpring } from "@/components/ui/bento-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Plus, Play, Eye, Trash2, Loader2, CheckCircle, XCircle, ChevronDown, ChevronUp, ArrowRight, GitBranch } from "lucide-react"
import type { PipelineExecution } from "@/types"

export function PipelineManager() {
  const { pipelines, executions, loading, fetchPipelines, createPipeline, deletePipeline, executePipeline, fetchExecutionLog } = usePipelineStore()
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
  const [lastResult, setLastResult] = useState<{ pipelineId: string; execution: PipelineExecution; preview?: unknown[] } | null>(null)

  useEffect(() => { fetchPipelines() }, [fetchPipelines])

  const handleCreate = async () => {
    if (!activeConnectionId || !selectedGetConnector) return
    await createPipeline({
      name: pipelineName, description: pipelineDesc, connectionId: activeConnectionId,
      getConnector: { name: selectedGetConnector, filters, sortFields, take },
      transformSteps: steps,
      updateConnector: { name: updateConnectorName, operation, fieldMappings },
    })
    setPipelineName(""); setPipelineDesc(""); setDialogOpen(false)
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
    if (expandedPipeline === id) { setExpandedPipeline(null) }
    else { setExpandedPipeline(id); await fetchExecutionLog(id) }
  }

  const getConnectionName = (connId: string) => connections.find((c) => c.id === connId)?.name || connId

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <BentoLabel>Automatisering</BentoLabel>
          <h2 className="text-2xl font-extrabold tracking-tight mt-1">Pipelines</h2>
          <p className="text-slate-400 text-sm">Herbruikbare workflows: Get → Transformatie → Update</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!activeConnectionId || !selectedGetConnector}><Plus className="mr-2 h-4 w-4" /> Nieuwe pipeline</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pipeline opslaan</DialogTitle>
              <DialogDescription>Sla de huidige configuratie op als herbruikbare pipeline</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Naam</Label><Input placeholder="Bijv. Medewerkers synchronisatie" value={pipelineName} onChange={(e) => setPipelineName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Beschrijving</Label><Input placeholder="Optionele beschrijving..." value={pipelineDesc} onChange={(e) => setPipelineDesc(e.target.value)} /></div>
              <div className="space-y-2"><Label>UpdateConnector naam</Label><Input placeholder="Connector naam" value={updateConnectorName} onChange={(e) => setUpdateConnectorName(e.target.value)} /></div>
              <div className="rounded-2xl glass-violet p-4 text-sm space-y-1.5">
                <p><span className="font-bold">GetConnector:</span> {selectedGetConnector}</p>
                <p><span className="font-bold">Transformatiestappen:</span> <span className="font-mono">{steps.length}</span></p>
                <p><span className="font-bold">Field mappings:</span> <span className="font-mono">{fieldMappings.length}</span></p>
              </div>
            </div>
            <DialogFooter><Button onClick={handleCreate} disabled={!pipelineName}>Opslaan</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {pipelines.length > 0 && (
        <BentoGrid>
          <BentoCard span={1}>
            <BentoLabel>Totaal</BentoLabel>
            <div className="mt-1"><BentoValue mono>{pipelines.length}</BentoValue></div>
          </BentoCard>
          <BentoCard span={2} glass="blue">
            <BentoLabel>Overzicht</BentoLabel>
            <div className="mt-2 flex flex-wrap gap-2">
              {pipelines.slice(0, 6).map((p) => (
                <Badge key={p.id} variant="secondary" className="font-mono text-xs">{p.name}</Badge>
              ))}
            </div>
          </BentoCard>
        </BentoGrid>
      )}

      {pipelines.length === 0 && (
        <BentoCard className="flex flex-col items-center justify-center py-16 border-dashed border-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 mb-4">
            <GitBranch className="h-7 w-7 text-emerald-500" />
          </div>
          <p className="text-lg font-extrabold">Nog geen pipelines</p>
          <p className="text-sm text-slate-400 text-center max-w-xs">Configureer een GetConnector, transformatie en UpdateConnector om een pipeline te maken</p>
        </BentoCard>
      )}

      {/* Pipeline cards */}
      <div className="space-y-4">
        {pipelines.map((pipeline, i) => (
          <motion.div
            key={pipeline.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...bentoSpring, delay: i * 0.04 }}
          >
            <BentoCard span={1} className="bento-span-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-extrabold text-base">{pipeline.name}</p>
                  {pipeline.description && <p className="text-xs text-slate-400 mt-0.5">{pipeline.description}</p>}
                </div>
                <Badge variant="outline" className="font-mono text-xs">{getConnectionName(pipeline.connectionId)}</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                <Badge variant="info" className="text-xs font-mono">{pipeline.getConnector.name}</Badge>
                <ArrowRight className="h-3 w-3 text-slate-300 hidden sm:block" />
                <Badge variant="secondary" className="text-xs"><span className="font-mono">{pipeline.transformSteps.length}</span> stappen</Badge>
                <ArrowRight className="h-3 w-3 text-slate-300 hidden sm:block" />
                <Badge variant="warning" className="text-xs font-mono">{pipeline.updateConnector.name} ({pipeline.updateConnector.operation})</Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handleExecute(pipeline.id, pipeline.name, true)} disabled={executingId === pipeline.id}>
                  <Eye className="mr-1 h-3 w-3" /> Dry Run
                </Button>
                <Button size="sm" onClick={() => handleExecute(pipeline.id, pipeline.name)} disabled={executingId === pipeline.id}>
                  {executingId === pipeline.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Play className="mr-1 h-3 w-3" />}
                  Uitvoeren
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggleExpand(pipeline.id)}>
                  {expandedPipeline === pipeline.id ? <ChevronUp className="mr-1 h-3 w-3" /> : <ChevronDown className="mr-1 h-3 w-3" />}Log
                </Button>
                <div className="flex-1" />
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(pipeline.id, pipeline.name)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              {lastResult && lastResult.pipelineId === pipeline.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={bentoSpring}
                  className={`mt-4 rounded-2xl p-4 text-sm ${lastResult.execution.status === "success" ? "glass-emerald text-emerald-800" : "glass-red text-red-800"}`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {lastResult.execution.status === "success" ? <CheckCircle className="h-4 w-4 text-emerald-500 animate-success-pop" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    <span className="font-mono">{lastResult.execution.recordsProcessed}</span> verwerkt,{" "}
                    <span className="font-mono">{lastResult.execution.recordsFailed}</span> mislukt
                  </div>
                  {lastResult.preview && (
                    <pre className="mt-2 rounded-xl bg-white/50 p-2 text-xs overflow-auto max-h-[200px] font-mono">{JSON.stringify(lastResult.preview, null, 2)}</pre>
                  )}
                </motion.div>
              )}

              {expandedPipeline === pipeline.id && executions[pipeline.id] && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={bentoSpring} className="mt-4 space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Uitvoerlog</span>
                  {executions[pipeline.id].length === 0 && <p className="text-sm text-slate-400">Nog niet uitgevoerd</p>}
                  {executions[pipeline.id].map((exec) => (
                    <ExecutionEntry key={exec.id} execution={exec} />
                  ))}
                </motion.div>
              )}
            </BentoCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ExecutionEntry({ execution }: { execution: PipelineExecution }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="rounded-2xl border border-white/20 bg-white p-3 text-sm shadow-soft">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2">
          {execution.status === "success" ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : execution.status === "error" ? <XCircle className="h-3.5 w-3.5 text-red-500" /> : <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
          <span className="font-bold text-xs">{new Date(execution.startedAt).toLocaleString("nl-NL")}</span>
          <Badge variant={execution.status === "success" ? "success" : "destructive"} className="text-[10px]">{execution.status}</Badge>
        </div>
        <span className="text-[10px] text-slate-400 font-mono tabular-nums">{execution.recordsProcessed} verwerkt, {execution.recordsFailed} mislukt</span>
      </div>
      {expanded && execution.logs.length > 0 && (
        <div className="mt-3 space-y-1 border-t pt-3">
          {execution.logs.map((log, i) => (
            <div key={i} className={`text-xs ${log.level === "error" ? "text-red-600" : log.level === "warn" ? "text-amber-600" : "text-slate-400"}`}>
              <span className="font-mono text-[10px] opacity-60">{new Date(log.timestamp).toLocaleTimeString("nl-NL")}</span>{" "}
              <Badge variant={log.level === "error" ? "destructive" : log.level === "warn" ? "warning" : "secondary"} className="text-[10px] px-1.5 py-0">{log.level}</Badge>{" "}
              {log.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
