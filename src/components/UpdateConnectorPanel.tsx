"use client"

import React, { useEffect, useState } from "react"
import { useConnectionStore } from "@/store/connectionStore"
import { useConnectorStore } from "@/store/connectorStore"
import { useTransformStore } from "@/store/transformStore"
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
} from "lucide-react"
import type { FieldMapping } from "@/types"

export function UpdateConnectorPanel() {
  const { activeConnectionId } = useConnectionStore()
  const { updateConnectors, fetchMetaInfo } = useConnectorStore()
  const { previewData, fieldMappings, setFieldMappings } = useTransformStore()

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
          // Extract field names from schema
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

    setExecuteResult({
      success: failed === 0,
      message: `${success} records verwerkt, ${failed} mislukt`,
    })
    setLoading(false)
  }

  if (!activeConnectionId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Geen actieve verbinding</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">UpdateConnector</h2>
        <p className="text-muted-foreground">Data terugschrijven naar AFAS Profit</p>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Connector & Operatie</CardTitle>
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
                <div className="rounded-md border p-3 max-h-[200px] overflow-auto">
                  <div className="flex flex-wrap gap-1">
                    {schemaFields.map((f) => (
                      <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
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
              <CardTitle className="text-base">Field Mapping</CardTitle>
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
              <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-md border p-2 sm:p-0 sm:border-0">
                <Select
                  value={mapping.sourceField}
                  onValueChange={(val) => updateMapping(index, { sourceField: val })}
                >
                  <SelectTrigger className="w-full sm:w-[160px]">
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
                    <SelectTrigger className="w-full sm:w-[160px]">
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
          className={`flex items-center gap-2 rounded-md p-4 ${
            executeResult.success
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {executeResult.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {executeResult.message}
        </div>
      )}

      {dryRunResult && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dry Run - Preview JSON Payload</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="rounded-md bg-muted p-4 overflow-auto text-xs max-h-[400px]">
              {JSON.stringify(dryRunResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
