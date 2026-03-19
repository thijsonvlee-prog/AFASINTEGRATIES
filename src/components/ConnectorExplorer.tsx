"use client"

import React, { useEffect } from "react"
import { useConnectionStore } from "@/store/connectionStore"
import { useConnectorStore } from "@/store/connectorStore"
import { useToastStore } from "@/store/toastStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterBuilder } from "./FilterBuilder"
import { DataGrid } from "./DataGrid"
import { Loader2, Play, ChevronLeft, ChevronRight, AlertCircle, Search, Database } from "lucide-react"

export function ConnectorExplorer() {
  const { activeConnectionId } = useConnectionStore()
  const {
    getConnectors,
    selectedGetConnector,
    getConnectorFields,
    connectorData,
    filters,
    skip,
    take,
    loading,
    error,
    fetchMetaInfo,
    fetchGetConnectorFields,
    fetchConnectorData,
    setSelectedGetConnector,
    setFilters,
    setSkip,
    setTake,
  } = useConnectorStore()
  const { addToast } = useToastStore()

  useEffect(() => {
    if (activeConnectionId) {
      fetchMetaInfo(activeConnectionId)
    }
  }, [activeConnectionId, fetchMetaInfo])

  useEffect(() => {
    if (activeConnectionId && selectedGetConnector) {
      fetchGetConnectorFields(activeConnectionId, selectedGetConnector)
    }
  }, [activeConnectionId, selectedGetConnector, fetchGetConnectorFields])

  const handleFetch = async () => {
    if (activeConnectionId && selectedGetConnector) {
      await fetchConnectorData(activeConnectionId, selectedGetConnector)
      addToast({
        type: "success",
        title: "Data opgehaald",
        description: `Resultaten geladen van ${selectedGetConnector}`,
      })
    }
  }

  if (!activeConnectionId) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 mb-4">
            <Search className="h-7 w-7 text-sky-500" />
          </div>
          <p className="text-lg font-semibold">Geen actieve verbinding</p>
          <p className="text-sm text-muted-foreground">
            Selecteer eerst een verbinding in het Verbindingen-tabblad
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">GetConnector Explorer</h2>
        <p className="text-muted-foreground text-sm">Data ophalen uit AFAS Profit</p>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                Connector
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>GetConnector</Label>
                <Select
                  value={selectedGetConnector || ""}
                  onValueChange={setSelectedGetConnector}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kies een connector..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getConnectors.map((c) => (
                      <SelectItem key={c.id || c.name} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Aantal per pagina</Label>
                <Input
                  type="number"
                  value={take}
                  onChange={(e) => setTake(parseInt(e.target.value) || 100)}
                  min={1}
                  max={10000}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={skip === 0}
                  onClick={() => setSkip(Math.max(0, skip - take))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground flex-1 text-center tabular-nums">
                  {skip + 1} - {skip + take}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSkip(skip + take)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Button
                className="w-full"
                onClick={handleFetch}
                disabled={!selectedGetConnector || loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Data ophalen
              </Button>
            </CardContent>
          </Card>

          {getConnectorFields.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <FilterBuilder
                  filters={filters}
                  fields={getConnectorFields}
                  onChange={setFilters}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800 flex items-center gap-3 animate-scale-in">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              {error}
            </div>
          )}

          {getConnectorFields.length > 0 && connectorData.length === 0 && !loading && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3">
                  <Play className="h-5 w-5" />
                </div>
                <p className="font-medium">Klik op &quot;Data ophalen&quot;</p>
                <p className="text-sm">om resultaten te laden</p>
              </CardContent>
            </Card>
          )}

          {connectorData.length > 0 && (
            <div className="animate-slide-up">
              <DataGrid data={connectorData} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
