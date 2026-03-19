"use client"

import React, { useState } from "react"
import { useTransformStore } from "@/store/transformStore"
import { useConnectorStore } from "@/store/connectorStore"
import { applyTransformations } from "@/lib/transformer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DataGrid } from "./DataGrid"
import {
  Plus,
  Trash2,
  ArrowRight,
  ArrowDown,
  Play,
  GripVertical,
  Type,
  Calculator,
  Filter,
  Columns,
} from "lucide-react"
import type { TransformStep, RenameConfig, FormulaConfig, FilterConfig, CalculatedConfig } from "@/types"

const STEP_TYPES = [
  { value: "rename", label: "Veld hernoemen", icon: Type },
  { value: "formula", label: "Formule toepassen", icon: Calculator },
  { value: "filter", label: "Rijen filteren", icon: Filter },
  { value: "calculated", label: "Berekend veld", icon: Columns },
] as const

function StepEditor({
  step,
  fields,
  onUpdate,
  onRemove,
}: {
  step: TransformStep
  fields: string[]
  onUpdate: (config: TransformStep["config"]) => void
  onRemove: () => void
}) {
  const config = step.config

  switch (step.type) {
    case "rename": {
      const renameConfig = config as RenameConfig
      const mappings = renameConfig.mappings || [{ from: "", to: "" }]
      return (
        <div className="space-y-2">
          {mappings.map((m, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Select
                value={m.from}
                onValueChange={(val) => {
                  const updated = [...mappings]
                  updated[i] = { ...updated[i], from: val }
                  onUpdate({ mappings: updated })
                }}
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Van veld" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Input
                className="w-full sm:w-[160px]"
                placeholder="Nieuwe naam"
                value={m.to}
                onChange={(e) => {
                  const updated = [...mappings]
                  updated[i] = { ...updated[i], to: e.target.value }
                  onUpdate({ mappings: updated })
                }}
              />
              {mappings.length > 1 && (
                <Button size="icon" variant="ghost" onClick={() => {
                  onUpdate({ mappings: mappings.filter((_, j) => j !== i) })
                }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => {
            onUpdate({ mappings: [...mappings, { from: "", to: "" }] })
          }}>
            <Plus className="mr-1 h-3 w-3" /> Mapping toevoegen
          </Button>
        </div>
      )
    }
    case "formula": {
      const formulaConfig = config as FormulaConfig
      return (
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Veld</Label>
              <Select
                value={formulaConfig.field || ""}
                onValueChange={(val) => onUpdate({ ...formulaConfig, field: val })}
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Veld" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 flex-1">
              <Label className="text-xs">Formule (gebruik &quot;value&quot; voor de huidige waarde)</Label>
              <Input
                placeholder="bijv. value * 1.21"
                value={formulaConfig.expression || ""}
                onChange={(e) => onUpdate({ ...formulaConfig, expression: e.target.value })}
              />
            </div>
          </div>
        </div>
      )
    }
    case "filter": {
      const filterConfig = config as FilterConfig
      return (
        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={filterConfig.field || ""}
            onValueChange={(val) => onUpdate({ ...filterConfig, field: val })}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Veld" />
            </SelectTrigger>
            <SelectContent>
              {fields.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filterConfig.operator || "equals"}
            onValueChange={(val) => onUpdate({ ...filterConfig, operator: val })}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
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
          <Input
            className="flex-1"
            placeholder="Waarde"
            value={filterConfig.value || ""}
            onChange={(e) => onUpdate({ ...filterConfig, value: e.target.value })}
          />
        </div>
      )
    }
    case "calculated": {
      const calcConfig = config as CalculatedConfig
      return (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Nieuw veld</Label>
            <Input
              className="w-full sm:w-[160px]"
              placeholder="Veldnaam"
              value={calcConfig.newField || ""}
              onChange={(e) => onUpdate({ ...calcConfig, newField: e.target.value })}
            />
          </div>
          <div className="space-y-1 flex-1">
            <Label className="text-xs">Formule (gebruik row.veldnaam)</Label>
            <Input
              placeholder="bijv. row.aantal * row.prijs"
              value={calcConfig.expression || ""}
              onChange={(e) => onUpdate({ ...calcConfig, expression: e.target.value })}
            />
          </div>
        </div>
      )
    }
    default:
      return null
  }
}

export function TransformPipeline() {
  const { steps, addStep, updateStep, removeStep, setPreviewData, previewData } = useTransformStore()
  const { connectorData } = useConnectorStore()
  const [selectedType, setSelectedType] = useState<TransformStep["type"]>("rename")

  const sourceFields = connectorData.length > 0 ? Object.keys(connectorData[0]) : []

  const handleAddStep = () => {
    const defaultConfigs: Record<string, TransformStep["config"]> = {
      rename: { mappings: [{ from: "", to: "" }] },
      formula: { field: "", expression: "" },
      filter: { field: "", operator: "equals", value: "" },
      calculated: { newField: "", expression: "" },
      join: { sourceConnector: "", joinField: "", targetField: "" },
    }
    addStep(selectedType, defaultConfigs[selectedType])
  }

  const handlePreview = () => {
    if (connectorData.length === 0) return
    try {
      const result = applyTransformations(
        connectorData as Record<string, unknown>[],
        steps
      )
      setPreviewData(result)
    } catch (error) {
      console.error("Transform error:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Data Transformatie</h2>
        <p className="text-muted-foreground">
          Transformeer data tussen GetConnector en UpdateConnector
        </p>
      </div>

      {connectorData.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>Haal eerst data op via de GetConnector Explorer</p>
          </CardContent>
        </Card>
      )}

      {connectorData.length > 0 && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Brondata</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                {connectorData.length} rijen, {sourceFields.length} kolommen:
                {" "}{sourceFields.join(", ")}
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center">
            <ArrowDown className="h-6 w-6 text-muted-foreground" />
          </div>

          {steps.map((step, index) => {
            const StepIcon = STEP_TYPES.find((t) => t.value === step.type)?.icon || Type
            return (
              <React.Fragment key={step.id}>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <StepIcon className="h-4 w-4" />
                        <CardTitle className="text-base">
                          Stap {index + 1}:{" "}
                          {STEP_TYPES.find((t) => t.value === step.type)?.label}
                        </CardTitle>
                        <Badge variant="secondary">{step.type}</Badge>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => removeStep(step.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <StepEditor
                      step={step}
                      fields={sourceFields}
                      onUpdate={(config) => updateStep(step.id, config)}
                      onRemove={() => removeStep(step.id)}
                    />
                  </CardContent>
                </Card>
                <div className="flex items-center justify-center">
                  <ArrowDown className="h-6 w-6 text-muted-foreground" />
                </div>
              </React.Fragment>
            )
          })}

          <Card className="border-dashed">
            <CardContent className="flex items-center gap-4 py-4">
              <Select
                value={selectedType}
                onValueChange={(val) => setSelectedType(val as TransformStep["type"])}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STEP_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleAddStep}>
                <Plus className="mr-1 h-4 w-4" /> Stap toevoegen
              </Button>
              <div className="flex-1" />
              <Button onClick={handlePreview}>
                <Play className="mr-1 h-4 w-4" /> Preview
              </Button>
            </CardContent>
          </Card>

          {previewData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Preview getransformeerde data</CardTitle>
              </CardHeader>
              <CardContent>
                <DataGrid data={previewData} />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
