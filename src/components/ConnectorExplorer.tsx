"use client"

import React, { useEffect } from "react"
import { motion } from "framer-motion"
import { useConnectionStore } from "@/store/connectionStore"
import { useConnectorStore } from "@/store/connectorStore"
import { useToastStore } from "@/store/toastStore"
import { BentoCard, BentoGrid, BentoLabel, BentoValue, bentoSpring } from "@/components/ui/bento-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterBuilder } from "./FilterBuilder"
import { DataGrid } from "./DataGrid"
import { Loader2, Play, ChevronLeft, ChevronRight, AlertCircle, Search, Database } from "lucide-react"

export function ConnectorExplorer() {
  const { activeConnectionId } = useConnectionStore()
  const {
    getConnectors, selectedGetConnector, getConnectorFields, connectorData,
    filters, skip, take, loading, error,
    fetchMetaInfo, fetchGetConnectorFields, fetchConnectorData,
    setSelectedGetConnector, setFilters, setSkip, setTake,
  } = useConnectorStore()
  const { addToast } = useToastStore()

  useEffect(() => {
    if (activeConnectionId) fetchMetaInfo(activeConnectionId)
  }, [activeConnectionId, fetchMetaInfo])

  useEffect(() => {
    if (activeConnectionId && selectedGetConnector) fetchGetConnectorFields(activeConnectionId, selectedGetConnector)
  }, [activeConnectionId, selectedGetConnector, fetchGetConnectorFields])

  const handleFetch = async () => {
    if (activeConnectionId && selectedGetConnector) {
      await fetchConnectorData(activeConnectionId, selectedGetConnector)
      addToast({ type: "success", title: "Data opgehaald", description: `Resultaten geladen van ${selectedGetConnector}` })
    }
  }

  if (!activeConnectionId) {
    return (
      <BentoCard className="flex flex-col items-center justify-center py-16 border-dashed border-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 mb-4">
          <Search className="h-7 w-7 text-sky-500" />
        </div>
        <p className="text-lg font-extrabold">Geen actieve verbinding</p>
        <p className="text-sm text-slate-400">Selecteer eerst een verbinding in het Verbindingen-tabblad</p>
      </BentoCard>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <BentoLabel>Verkennen</BentoLabel>
        <h2 className="text-2xl font-extrabold tracking-tight mt-1">GetConnector Explorer</h2>
        <p className="text-slate-400 text-sm">Data ophalen uit AFAS Profit</p>
      </div>

      <BentoGrid>
        {/* Controls card — 1 wide */}
        <BentoCard span={1} className="bento-row-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100">
              <Database className="h-4 w-4 text-sky-600" />
            </div>
            <span className="font-bold text-sm">Connector</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">GetConnector</Label>
              <Select value={selectedGetConnector || ""} onValueChange={setSelectedGetConnector}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Kies een connector..." /></SelectTrigger>
                <SelectContent>
                  {getConnectors.map((c) => (
                    <SelectItem key={c.id || c.name} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Per pagina</Label>
              <Input type="number" value={take} onChange={(e) => setTake(parseInt(e.target.value) || 100)} min={1} max={10000} className="rounded-xl" />
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - take))}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-xs text-slate-400 flex-1 text-center font-mono tabular-nums">{skip + 1} - {skip + take}</span>
              <Button size="sm" variant="outline" onClick={() => setSkip(skip + take)}><ChevronRight className="h-4 w-4" /></Button>
            </div>

            <Button className="w-full" onClick={handleFetch} disabled={!selectedGetConnector || loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              Data ophalen
            </Button>

            {getConnectorFields.length > 0 && (
              <div className="pt-2 border-t border-border/30">
                <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2 block">Filters</Label>
                <FilterBuilder filters={filters} fields={getConnectorFields} onChange={setFilters} />
              </div>
            )}
          </div>
        </BentoCard>

        {/* Data area — 2 wide */}
        <BentoCard span={2} noPadding className="min-h-[300px]">
          {error && (
            <div className="m-4 rounded-2xl glass-red p-4 text-sm text-red-800 flex items-center gap-3 animate-scale-in">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
            </div>
          )}

          {!loading && getConnectorFields.length > 0 && connectorData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 mb-3">
                <Play className="h-6 w-6" />
              </div>
              <p className="font-bold">Klik op &quot;Data ophalen&quot;</p>
              <p className="text-sm">om resultaten te laden</p>
            </div>
          )}

          {connectorData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={bentoSpring}
              className="p-4 md:p-5"
            >
              <DataGrid data={connectorData} />
            </motion.div>
          )}
        </BentoCard>
      </BentoGrid>
    </div>
  )
}
