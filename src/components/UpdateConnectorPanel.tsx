"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useConnectionStore } from "@/store/connectionStore"
import { useConnectorStore } from "@/store/connectorStore"
import { useTransformStore } from "@/store/transformStore"
import { useToastStore } from "@/store/toastStore"
import { apiFetch } from "@/lib/apiFetch"
import { BentoCard, BentoGrid, BentoLabel, BentoValue, bentoSpring } from "@/components/ui/bento-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ArrowRight, CheckCircle, Eye, Loader2, Send, Trash2, Plus, XCircle, Upload } from "lucide-react"
import type { FieldMapping } from "@/types"

export function UpdateConnectorPanel() {
  const { activeConnectionId } = useConnectionStore()
  const { updateConnectors, fetchMetaInfo } = useConnectorStore()
  const { previewData, fieldMappings, setFieldMappings } = useTransformStore()
  const { addToast } = useToastStore()

  const [selectedConnector, setSelectedConnector] = useState<string>("")
  const [schema, setSchema] = useState<unknown>(null)
  const [schemaFields, setSchemaFields] = useState<string[]>([])
  const [operation, setOperation] = useState<"POST" | "PUT" | "DELETE">("POST")
  const [dryRunResult, setDryRunResult] = useState<unknown[] | null>(null)
  const [executeResult, setExecuteResult] = useState<{ success: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (activeConnectionId) fetchMetaInfo(activeConnectionId) }, [activeConnectionId, fetchMetaInfo])

  useEffect(() => {
    if (activeConnectionId && selectedConnector) {
      apiFetch<Record<string, unknown>>(`/api/afas/metainfo/update/${encodeURIComponent(selectedConnector)}`, { headers: { "x-connection-id": activeConnectionId } })
        .then((res) => {
          const data = res.data; setSchema(data)
          const fields: string[] = []
          const extractFields = (obj: Record<string, unknown>, prefix = "") => {
            if (obj.fields || obj.Fields) { const f = (obj.fields || obj.Fields) as { fieldId?: string; FieldId?: string }[]; f.forEach((field) => fields.push(prefix + (field.fieldId || field.FieldId || ""))) }
            if (obj.objects || obj.Objects) { const objs = (obj.objects || obj.Objects) as Record<string, unknown>[]; objs.forEach((o) => extractFields(o, prefix + (o.name as string || "") + ".")) }
          }
          if (data) extractFields(data as Record<string, unknown>)
          setSchemaFields(fields)
        }).catch(console.error)
    }
  }, [activeConnectionId, selectedConnector])

  const sourceFields = previewData.length > 0 ? Object.keys(previewData[0]) : []
  const addMapping = () => setFieldMappings([...fieldMappings, { sourceField: "", targetField: "" }])
  const updateMapping = (index: number, updates: Partial<FieldMapping>) => setFieldMappings(fieldMappings.map((m, i) => (i === index ? { ...m, ...updates } : m)))
  const removeMapping = (index: number) => setFieldMappings(fieldMappings.filter((_, i) => i !== index))

  const handleDryRun = () => {
    if (previewData.length === 0) return
    const mapped = previewData.slice(0, 5).map((row) => {
      const result: Record<string, unknown> = {}
      for (const mapping of fieldMappings) { if (mapping.sourceField && mapping.targetField) result[mapping.targetField] = row[mapping.sourceField] }
      return { [selectedConnector]: { Element: { Fields: result } } }
    })
    setDryRunResult(mapped)
    addToast({ type: "info", title: "Dry Run klaar", description: "Preview van 5 records gegenereerd" })
  }

  const handleExecute = async () => {
    if (!activeConnectionId || !selectedConnector) return
    setLoading(true); setExecuteResult(null)
    let success = 0, failed = 0
    for (const row of previewData) {
      const mapped: Record<string, unknown> = {}
      for (const mapping of fieldMappings) { if (mapping.sourceField && mapping.targetField) mapped[mapping.targetField] = row[mapping.sourceField] }
      try {
        const res = await apiFetch(`/api/afas/connectors/${encodeURIComponent(selectedConnector)}`, { method: operation, headers: { "Content-Type": "application/json", "x-connection-id": activeConnectionId }, body: JSON.stringify({ [selectedConnector]: { Element: { Fields: mapped } } }) })
        if (res.ok) success++; else { failed++; console.error("AFAS error:", res.data) }
      } catch { failed++ }
    }
    const result = { success: failed === 0, message: `${success} records verwerkt, ${failed} mislukt` }
    setExecuteResult(result); setLoading(false)
    addToast({ type: failed === 0 ? "success" : "error", title: failed === 0 ? "Uitvoering geslaagd" : "Uitvoering met fouten", description: result.message })
  }

  if (!activeConnectionId) {
    return (
      <BentoCard index={0} className="flex flex-col items-center justify-center py-20 border-dashed border-2">
        <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-violet-50 mb-5"><Upload className="h-9 w-9 text-violet-400" /></div>
        <p className="text-xl font-extrabold tracking-tight">Geen actieve verbinding</p>
        <p className="text-sm text-slate-400 font-medium">Activeer een verbinding om data te schrijven</p>
      </BentoCard>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <BentoLabel>Schrijven</BentoLabel>
        <h2 className="text-3xl font-extrabold tracking-tighter mt-1">UpdateConnector</h2>
        <p className="text-slate-400 text-sm font-medium">Data terugschrijven naar AFAS Profit</p>
      </div>

      {previewData.length > 0 && (
        <BentoGrid>
          <BentoCard span={1} glass="violet" index={0}><BentoLabel>Bronrijen</BentoLabel><div className="mt-2"><BentoValue mono size="large">{previewData.length}</BentoValue></div></BentoCard>
          <BentoCard span={1} index={1}><BentoLabel>Mappings</BentoLabel><div className="mt-2"><BentoValue mono size="large">{fieldMappings.length}</BentoValue></div></BentoCard>
          <BentoCard span={1} index={2}><BentoLabel>Doelvelden</BentoLabel><div className="mt-2"><BentoValue mono size="large">{schemaFields.length}</BentoValue></div></BentoCard>
        </BentoGrid>
      )}

      <BentoGrid>
        {/* Connector & operatie */}
        <BentoCard span={1} glass="violet" index={0} hoverGlow="violet">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50"><Upload className="h-5 w-5 text-violet-500" /></div>
            <span className="font-extrabold text-sm tracking-tight">Connector & Operatie</span>
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold">UpdateConnector</Label>
              <Select value={selectedConnector} onValueChange={setSelectedConnector}>
                <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Kies een connector..." /></SelectTrigger>
                <SelectContent>{updateConnectors.map((c) => <SelectItem key={c.id || c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold">Operatie</Label>
              <Select value={operation} onValueChange={(v) => setOperation(v as "POST" | "PUT" | "DELETE")}>
                <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">Insert (POST)</SelectItem>
                  <SelectItem value="PUT">Update (PUT)</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {schema ? (
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold">Schema velden</Label>
                <div className="rounded-2xl border border-white/20 p-3 max-h-[200px] overflow-auto bg-white/40 backdrop-blur-sm">
                  <div className="flex flex-wrap gap-1">{schemaFields.map((f) => <Badge key={f} variant="secondary" className="text-xs font-mono">{f}</Badge>)}</div>
                </div>
              </div>
            ) : null}
          </div>
        </BentoCard>

        {/* Field mappings */}
        <BentoCard span={2} glass="amber" index={1} hoverGlow="amber">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50"><ArrowRight className="h-5 w-5 text-amber-500" /></div>
              <span className="font-extrabold text-sm tracking-tight">Field Mapping</span>
            </div>
            <Button size="sm" variant="outline" onClick={addMapping}><Plus className="mr-1 h-3 w-3" /> Mapping</Button>
          </div>
          <div className="space-y-3">
            {fieldMappings.length === 0 && <p className="text-sm text-slate-400 font-medium">Koppel bronvelden aan UpdateConnector velden</p>}
            {fieldMappings.map((mapping, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-2xl border border-white/20 p-3 bg-white/40 backdrop-blur-sm">
                <Select value={mapping.sourceField} onValueChange={(val) => updateMapping(index, { sourceField: val })}>
                  <SelectTrigger className="w-full sm:w-[160px] rounded-2xl"><SelectValue placeholder="Bronveld" /></SelectTrigger>
                  <SelectContent>{sourceFields.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
                <ArrowRight className="h-4 w-4 text-slate-300 shrink-0 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Select value={mapping.targetField} onValueChange={(val) => updateMapping(index, { targetField: val })}>
                    <SelectTrigger className="w-full sm:w-[160px] rounded-2xl"><SelectValue placeholder="Doelveld" /></SelectTrigger>
                    <SelectContent>{schemaFields.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" onClick={() => removeMapping(index)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        </BentoCard>
      </BentoGrid>

      <BentoCard index={0} className="border-dashed border-2">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button variant="outline" onClick={handleDryRun} disabled={previewData.length === 0 || fieldMappings.length === 0}><Eye className="mr-2 h-4 w-4" /> Dry Run</Button>
          <Button onClick={handleExecute} disabled={loading || previewData.length === 0 || fieldMappings.length === 0}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Uitvoeren (<span className="font-mono tabular-nums">{previewData.length}</span> records)
          </Button>
        </div>
      </BentoCard>

      {executeResult && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={bentoSpring}
          className={`flex items-center gap-3 rounded-[2.5rem] p-5 ${executeResult.success ? "glass-emerald text-emerald-800" : "glass-red text-red-800"}`}>
          {executeResult.success ? <CheckCircle className="h-5 w-5 text-emerald-500 animate-success-pop" /> : <XCircle className="h-5 w-5 text-red-500" />}
          <span className="font-extrabold">{executeResult.message}</span>
        </motion.div>
      )}

      {dryRunResult && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={bentoSpring}>
          <BentoCard index={0} glass="blue">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100/50"><Eye className="h-4 w-4 text-sky-600" /></div>
              <span className="font-extrabold text-sm tracking-tight">Dry Run - Preview JSON Payload</span>
            </div>
            <pre className="rounded-2xl bg-white/50 backdrop-blur-sm p-4 overflow-auto text-xs max-h-[400px] font-mono border border-white/20">{JSON.stringify(dryRunResult, null, 2)}</pre>
          </BentoCard>
        </motion.div>
      )}
    </div>
  )
}
