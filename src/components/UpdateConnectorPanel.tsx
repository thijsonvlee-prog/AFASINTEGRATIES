"use client"

import React, { useEffect, useState } from "react"
import { useConnectionStore } from "@/store/connectionStore"
import { useConnectorStore } from "@/store/connectorStore"
import { useTransformStore } from "@/store/transformStore"
import { useToastStore } from "@/store/toastStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Eye,
  Loader2,
  Play,
  Send,
  Trash2,
  Plus,
  XCircle,
  Upload,
} from "lucide-react"
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

  useEffect(() => {
    if (activeConnectionId) {
      fetchMetaInfo(activeConnectionId)
    }
  }, [activeConnectionId, fetchMetaInfo])

  useEffect(() => {
    if (activeConnectionId && selectedConnector) {
      fetch(`/api/afas/metainfo/update/${encodeURIComponent(selectedConnector)}`, {
        headers: { "x-connection-id": activeConnectionId },
      })
        .then((r) => r.json())
        .then((data) => {
          setSchema(data)
          const fields: string[] = []
          const extractFields = (obj: Record<string, unknown>, prefix = "") => {
            if (obj.fields || obj.Fields) {
              const f = (obj.fields || obj.Fields) as { fieldId?: string; FieldId?: string }[]
              f.forEach((field) => {
                fields.push(prefix + (field.fieldId || field.FieldId || ""))
              })
            }
            if (obj.objects || obj.Objects) {
              const objs = (obj.objects || obj.Objects) as Record<string, unknown>[]
              objs.forEach((o) => {
                extractFields(o, prefix + (o.name as string || "") + ".")
              })
            }
          }
          if (data) extractFields(data as Record<string, unknown>)
          setSchemaFields(fields)
        })
        .catch(console.error)
    }
  }, [activeConnectionId, selectedConnector])

  const sourceFields = previewData.length > 0 ? Object.keys(previewData[0]) : []

  const addMapping = () => {
    setFieldMappings([...fieldMappings, { sourceField: "", targetField: "" }])
  }

  const updateMapping = (index: number, updates: Partial<FieldMapping>) => {
    const updated = fieldMappings.map((m, i) => (i === index ? { ...m, ...updates } : m))
    setFieldMappings(updated)
  }

  const removeMapping = (index: number) => {
    setFieldMappings(fieldMappings.filter((_, i) => i !== index))
  }

  const handleDryRun = () => {
    if (previewData.length === 0) return

    const mapped = previewData.slice(0, 5).map((row) => {
      const result: Record<string, unknown> = {}
      for (const mapping of fieldMappings) {
        if (mapping.sourceField && mapping.targetField) {
          result[mapping.targetField] = row[mapping.sourceField]
        }
      }
      return {
        [selectedConnector]: {
          Element: { Fields: result },
        },
      }
    })

    setDryRunResult(mapped)
    addToast({ type: "info", title: "Dry Run klaar", description: "Preview van 5 records gegenereerd" })
  }

  const handleExecute = async () => {
    if (!activeConnectionId || !selectedConnector) return
    setLoading(true)
    setExecuteResult(null)

    let success = 0
    let failed = 0

    for (const row of previewData) {
      const mapped: Record<string, unknown> = {}
      for (const mapping of fieldMappings) {
        if (mapping.sourceField && mapping.targetField) {
          mapped[mapping.targetField] = row[mapping.sourceField]
        }
      }

      const payload = {
        [selectedConnector]: {
          Element: { Fields: mapped },
        },
      }

      try {
        const res = await fetch(
          `/api/afas/connectors/${encodeURIComponent(selectedConnector)}`,
          {
            method: operation,
            headers: {
              "Content-Type": "application/json",
              "x-connection-id": activeConnectionId,
            },
            body: JSON.stringify(payload),
          }
        )

        if (res.ok) {
          success++
        } else {
          failed++
          const err = await res.json().catch(() => ({}))
          console.error("AFAS error:", err)
        }
      } catch (err) {
        failed++
      }
    }

    const result = {
      success: failed === 0,
      message: `${success} records verwerkt, ${failed} mislukt`,
    }
    setExecuteResult(result)
    setLoading(false)
    addToast({
      type: failed === 0 ? "success" : "error",
      title: failed === 0 ? "Uitvoering geslaagd" : "Uitvoering met fouten",
      description: result.message,
    })
  }

  if (!activeConnectionId) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 mb-4">
            <Upload className="h-7 w-7 text-violet-500" />
          </div>
          <p className="text-lg font-semibold">Geen actieve verbinding</p>
          <p className="text-sm text-muted-foreground">Activeer een verbinding om data te schrijven</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">UpdateConnector</h2>
        <p className="text-muted-foreground text-sm">Data terugschrijven naar AFAS Profit</p>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-100">
                <Upload className="h-3.5 w-3.5 text-violet-600" />
              </div>
              Connector & Operatie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>UpdateConnector</Label>
              <Select value={selectedConnector} onValueChange={setSelectedConnector}>
                <SelectTrigger>
                  <SelectValue placeholder="Kies een connector..." />
                </SelectTrigger>
                <SelectContent>
                  {updateConnectors.map((c) => (
                    <SelectItem key={c.id || c.name} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Operatie</Label>
              <Select value={operation} onValueChange={(v) => setOperation(v as "POST" | "PUT" | "DELETE")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">Insert (POST) - Nieuw record</SelectItem>
                  <SelectItem value="PUT">Update (PUT) - Bijwerken</SelectItem>
                  <SelectItem value="DELETE">Delete - Verwijderen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {schema ? (
              <div className="space-y-2">
                <Label>Schema velden</Label>
                <div className="rounded-xl border p-3 max-h-[200px] overflow-auto bg-muted/30">
                  <div className="flex flex-wrap gap-1">
                    {schemaFields.map((f) => (
                      <Badge key={f} variant="secondary" className="text-xs font-mono">{f}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100">
                  <ArrowRight className="h-3.5 w-3.5 text-amber-600" />
                </div>
                Field Mapping
              </CardTitle>
              <Button size="sm" variant="outline" onClick={addMapping}>
                <Plus className="mr-1 h-3 w-3" /> Mapping
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {fieldMappings.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Koppel bronvelden aan UpdateConnector velden
              </p>
            )}
            {fieldMappings.map((mapping, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border p-2.5 sm:p-2 bg-muted/20">
                <Select
                  value={mapping.sourceField}
                  onValueChange={(val) => updateMapping(index, { sourceField: val })}
                >
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Bronveld" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceFields.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Select
                    value={mapping.targetField}
                    onValueChange={(val) => updateMapping(index, { targetField: val })}
                  >
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Doelveld" />
                    </SelectTrigger>
                    <SelectContent>
                      {schemaFields.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" onClick={() => removeMapping(index)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={handleDryRun} disabled={previewData.length === 0 || fieldMappings.length === 0}>
          <Eye className="mr-2 h-4 w-4" /> Dry Run (Preview)
        </Button>
        <Button onClick={handleExecute} disabled={loading || previewData.length === 0 || fieldMappings.length === 0}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Uitvoeren ({previewData.length} records)
        </Button>
      </div>

      {executeResult && (
        <div
          className={`flex items-center gap-3 rounded-xl p-4 animate-scale-in ${
            executeResult.success
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {executeResult.success ? (
            <CheckCircle className="h-5 w-5 text-emerald-500 animate-success-pop" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <span className="font-medium">{executeResult.message}</span>
        </div>
      )}

      {dryRunResult && (
        <Card className="animate-slide-up">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dry Run - Preview JSON Payload</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="rounded-xl bg-muted/50 p-4 overflow-auto text-xs max-h-[400px] font-mono">
              {JSON.stringify(dryRunResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
