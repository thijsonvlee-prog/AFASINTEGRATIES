"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { useTransformStore } from "@/store/transformStore"
import { useConnectorStore } from "@/store/connectorStore"
import { useToastStore } from "@/store/toastStore"
import { applyTransformations } from "@/lib/transformer"
import { BentoCard, BentoGrid, BentoLabel, BentoValue, bentoSpring } from "@/components/ui/bento-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DataGrid } from "./DataGrid"
import { Plus, Trash2, ArrowRight, ArrowDown, Play, GripVertical, Type, Calculator, Filter, Columns, Shuffle } from "lucide-react"
import type { TransformStep, RenameConfig, FormulaConfig, FilterConfig, CalculatedConfig } from "@/types"

const STEP_TYPES = [
  { value: "rename", label: "Veld hernoemen", icon: Type },
  { value: "formula", label: "Formule toepassen", icon: Calculator },
  { value: "filter", label: "Rijen filteren", icon: Filter },
  { value: "calculated", label: "Berekend veld", icon: Columns },
] as const

const STEP_COLORS: Record<string, string> = {
  rename: "bg-violet-100 text-violet-600",
  formula: "bg-amber-100 text-amber-600",
  filter: "bg-sky-100 text-sky-600",
  calculated: "bg-emerald-100 text-emerald-600",
}

const STEP_GLASS: Record<string, string> = {
  rename: "glass-violet",
  formula: "glass-amber",
  filter: "glass-blue",
  calculated: "glass-emerald",
}

function StepEditor({ step, fields, onUpdate, onRemove }: { step: TransformStep; fields: string[]; onUpdate: (config: TransformStep["config"]) => void; onRemove: () => void }) {
  const config = step.config
  switch (step.type) {
    case "rename": {
      const renameConfig = config as RenameConfig
      const mappings = renameConfig.mappings || [{ from: "", to: "" }]
      return (
        <div className="space-y-2">
          {mappings.map((m, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Select value={m.from} onValueChange={(val) => { const u = [...mappings]; u[i] = { ...u[i], from: val }; onUpdate({ mappings: u }) }}>
                <SelectTrigger className="w-full sm:w-[160px] rounded-xl"><SelectValue placeholder="Van veld" /></SelectTrigger>
                <SelectContent>{fields.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
              <ArrowRight className="h-4 w-4 text-slate-300 hidden sm:block" />
              <Input className="w-full sm:w-[160px] rounded-xl" placeholder="Nieuwe naam" value={m.to} onChange={(e) => { const u = [...mappings]; u[i] = { ...u[i], to: e.target.value }; onUpdate({ mappings: u }) }} />
              {mappings.length > 1 && <Button size="icon" variant="ghost" onClick={() => onUpdate({ mappings: mappings.filter((_, j) => j !== i) })}><Trash2 className="h-3 w-3 text-destructive" /></Button>}
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => onUpdate({ mappings: [...mappings, { from: "", to: "" }] })}><Plus className="mr-1 h-3 w-3" /> Mapping</Button>
        </div>
      )
    }
    case "formula": {
      const fc = config as FormulaConfig
      return (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-slate-400">Veld</Label>
            <Select value={fc.field || ""} onValueChange={(val) => onUpdate({ ...fc, field: val })}>
              <SelectTrigger className="w-full sm:w-[160px] rounded-xl"><SelectValue placeholder="Veld" /></SelectTrigger>
              <SelectContent>{fields.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1 flex-1">
            <Label className="text-[10px] uppercase tracking-wider text-slate-400">Formule</Label>
            <Input className="rounded-xl" placeholder="bijv. value * 1.21" value={fc.expression || ""} onChange={(e) => onUpdate({ ...fc, expression: e.target.value })} />
          </div>
        </div>
      )
    }
    case "filter": {
      const fc = config as FilterConfig
      return (
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={fc.field || ""} onValueChange={(val) => onUpdate({ ...fc, field: val })}>
            <SelectTrigger className="w-full sm:w-[160px] rounded-xl"><SelectValue placeholder="Veld" /></SelectTrigger>
            <SelectContent>{fields.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={fc.operator || "equals"} onValueChange={(val) => onUpdate({ ...fc, operator: val })}>
            <SelectTrigger className="w-full sm:w-[160px] rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">Gelijk aan</SelectItem>
              <SelectItem value="not_equals">Niet gelijk aan</SelectItem>
              <SelectItem value="greater_than">Groter dan</SelectItem>
              <SelectItem value="less_than">Kleiner dan</SelectItem>
              <SelectItem value="contains">Bevat</SelectItem>
              <SelectItem value="not_empty">Niet leeg</SelectItem>
              <SelectItem value="empty">Leeg</SelectItem>
            </SelectContent>
          </Select>
          <Input className="flex-1 rounded-xl" placeholder="Waarde" value={fc.value || ""} onChange={(e) => onUpdate({ ...fc, value: e.target.value })} />
        </div>
      )
    }
    case "calculated": {
      const cc = config as CalculatedConfig
      return (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-slate-400">Nieuw veld</Label>
            <Input className="w-full sm:w-[160px] rounded-xl" placeholder="Veldnaam" value={cc.newField || ""} onChange={(e) => onUpdate({ ...cc, newField: e.target.value })} />
          </div>
          <div className="space-y-1 flex-1">
            <Label className="text-[10px] uppercase tracking-wider text-slate-400">Formule</Label>
            <Input className="rounded-xl" placeholder="bijv. row.aantal * row.prijs" value={cc.expression || ""} onChange={(e) => onUpdate({ ...cc, expression: e.target.value })} />
          </div>
        </div>
      )
    }
    default: return null
  }
}

export function TransformPipeline() {
  const { steps, addStep, updateStep, removeStep, setPreviewData, previewData } = useTransformStore()
  const { connectorData } = useConnectorStore()
  const { addToast } = useToastStore()
  const [selectedType, setSelectedType] = useState<TransformStep["type"]>("rename")
  const sourceFields = connectorData.length > 0 ? Object.keys(connectorData[0]) : []

  const handleAddStep = () => {
    const defaultConfigs: Record<string, TransformStep["config"]> = {
      rename: { mappings: [{ from: "", to: "" }] }, formula: { field: "", expression: "" },
      filter: { field: "", operator: "equals", value: "" }, calculated: { newField: "", expression: "" },
      join: { sourceConnector: "", joinField: "", targetField: "" },
    }
    addStep(selectedType, defaultConfigs[selectedType])
  }

  const handlePreview = () => {
    if (connectorData.length === 0) return
    try {
      const result = applyTransformations(connectorData as Record<string, unknown>[], steps)
      setPreviewData(result)
      addToast({ type: "success", title: "Transformatie toegepast", description: `${result.length} rijen getransformeerd` })
    } catch (error) {
      addToast({ type: "error", title: "Transformatiefout", description: String(error) })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <BentoLabel>Verwerking</BentoLabel>
        <h2 className="text-2xl font-extrabold tracking-tight mt-1">Data Transformatie</h2>
        <p className="text-slate-400 text-sm">Transformeer data tussen GetConnector en UpdateConnector</p>
      </div>

      {connectorData.length === 0 && (
        <BentoCard className="flex flex-col items-center justify-center py-16 border-dashed border-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 mb-4"><Shuffle className="h-7 w-7 text-amber-500" /></div>
          <p className="font-extrabold">Geen brondata</p>
          <p className="text-sm text-slate-400">Haal eerst data op via de GetConnector Explorer</p>
        </BentoCard>
      )}

      {connectorData.length > 0 && (
        <>
          {/* Source data stats */}
          <BentoGrid>
            <BentoCard span={1} glass="blue">
              <BentoLabel>Bronrijen</BentoLabel>
              <div className="mt-1"><BentoValue mono>{connectorData.length}</BentoValue></div>
            </BentoCard>
            <BentoCard span={1}>
              <BentoLabel>Kolommen</BentoLabel>
              <div className="mt-1"><BentoValue mono>{sourceFields.length}</BentoValue></div>
            </BentoCard>
            <BentoCard span={1}>
              <BentoLabel>Stappen</BentoLabel>
              <div className="mt-1"><BentoValue mono>{steps.length}</BentoValue></div>
            </BentoCard>
          </BentoGrid>

          <div className="flex items-center justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100"><ArrowDown className="h-4 w-4 text-slate-400" /></div>
          </div>

          {steps.map((step, index) => {
            const StepIcon = STEP_TYPES.find((t) => t.value === step.type)?.icon || Type
            const colorClass = STEP_COLORS[step.type] || "bg-muted text-muted-foreground"
            const glassClass = STEP_GLASS[step.type] || ""
            return (
              <React.Fragment key={step.id}>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...bentoSpring, delay: index * 0.05 }}>
                  <BentoCard className={glassClass}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <GripVertical className="h-4 w-4 text-slate-300 cursor-grab" />
                        <div className={`flex h-7 w-7 items-center justify-center rounded-xl ${colorClass}`}><StepIcon className="h-3.5 w-3.5" /></div>
                        <span className="font-extrabold text-sm">Stap {index + 1}</span>
                        <Badge variant="secondary" className="text-xs">{STEP_TYPES.find((t) => t.value === step.type)?.label}</Badge>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => removeStep(step.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                    <StepEditor step={step} fields={sourceFields} onUpdate={(config) => updateStep(step.id, config)} onRemove={() => removeStep(step.id)} />
                  </BentoCard>
                </motion.div>
                <div className="flex items-center justify-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100"><ArrowDown className="h-4 w-4 text-slate-400" /></div>
                </div>
              </React.Fragment>
            )
          })}

          <BentoCard className="border-dashed border-2">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Select value={selectedType} onValueChange={(val) => setSelectedType(val as TransformStep["type"])}>
                <SelectTrigger className="w-full sm:w-[200px] rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{STEP_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
              <Button variant="outline" onClick={handleAddStep}><Plus className="mr-1 h-4 w-4" /> Stap toevoegen</Button>
              <div className="flex-1" />
              <Button onClick={handlePreview}><Play className="mr-1 h-4 w-4" /> Preview</Button>
            </div>
          </BentoCard>

          {previewData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={bentoSpring}>
              <BentoCard glass="emerald">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-200/50"><Columns className="h-3.5 w-3.5 text-emerald-700" /></div>
                  <span className="font-bold text-sm">Preview getransformeerde data</span>
                </div>
                <DataGrid data={previewData} />
              </BentoCard>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
