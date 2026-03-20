"use client"

import React, { useEffect } from "react"
import { motion } from "framer-motion"
import { useConnectionStore } from "@/store/connectionStore"
import { useConnectorStore } from "@/store/connectorStore"
import { useToastStore } from "@/store/toastStore"
import { BentoCard, BentoGrid, BentoLabel, bentoSpring } from "@/components/ui/bento-card"
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

  useEffect(() => { if (activeConnectionId) fetchMetaInfo(activeConnectionId) }, [activeConnectionId, fetchMetaInfo])
  useEffect(() => { if (activeConnectionId && selectedGetConnector) fetchGetConnectorFields(activeConnectionId, selectedGetConnector) }, [activeConnectionId, selectedGetConnector, fetchGetConnectorFields])

  const handleFetch = async () => {
    if (activeConnectionId && selectedGetConnector) {
      await fetchConnectorData(activeConnectionId, selectedGetConnector)
      addToast({ type: "success", title: "Data opgehaald", description: `Resultaten geladen van ${selectedGetConnector}` })
    }
  }

  if (!activeConnectionId) {
    return (
      <BentoCard index={0} className="flex flex-col items-center justify-center py-20 border-dashed border-2">
        <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-sky-50 mb-5">
          <Search className="h-9 w-9 text-sky-400" />
        </div>
        <p className="text-xl font-extrabold tracking-tight">Geen actieve verbinding</p>
        <p className="text-sm text-slate-400 font-medium">Selecteer eerst een verbinding</p>
      </BentoCard>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <BentoLabel>Verkennen</BentoLabel>
        <h2 className="text-3xl font-extrabold tracking-tighter mt-1">GetConnector Explorer</h2>
        <p className="text-slate-400 text-sm font-medium">Data ophalen uit AFAS Profit</p>
      </div>

      <BentoGrid>
        <BentoCard span={1} index={0} hoverGlow="sky" className="bento-row-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50">
              <Database className="h-5 w-5 text-sky-500" />
            </div>
            <span className="font-extrabold text-sm tracking-tight">Connector</span>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold">GetConnector</Label>
              <Select value={selectedGetConnector || ""} onValueChange={setSelectedGetConnector}>
                <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Kies een connector..." /></SelectTrigger>
                <SelectContent>
                  {getConnectors.map((c) => <SelectItem key={c.id || c.name} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold">Per pagina</Label>
              <Input type="number" value={take} onChange={(e) => setTake(parseInt(e.target.value) || 100)} min={1} max={10000} className="rounded-2xl" />
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - take))}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-[11px] text-slate-400 flex-1 text-center font-mono tabular-nums">{skip + 1} - {skip + take}</span>
              <Button size="sm" variant="outline" onClick={() => setSkip(skip + take)}><ChevronRight className="h-4 w-4" /></Button>
            </div>

            <Button className="w-full rounded-2xl" onClick={handleFetch} disabled={!selectedGetConnector || loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              Data ophalen
            </Button>

            {getConnectorFields.length > 0 && (
              <div className="pt-3 border-t border-border/20">
                <Label className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold mb-3 block">Filters</Label>
                <FilterBuilder filters={filters} fields={getConnectorFields} onChange={setFilters} />
              </div>
            )}
          </div>
        </BentoCard>

        <BentoCard span={2} noPadding index={1} className="min-h-[300px]">
          {error && (
            <div className="m-5 rounded-2xl glass-red p-4 text-sm text-red-800 flex items-center gap-3 animate-scale-in">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />{error}
            </div>
          )}
          {loading && (
            <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary/30" /></div>
          )}
          {!loading && getConnectorFields.length > 0 && connectorData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 mb-4"><Play className="h-7 w-7" /></div>
              <p className="font-extrabold tracking-tight">Klik op &quot;Data ophalen&quot;</p>
              <p className="text-sm font-medium">om resultaten te laden</p>
            </div>
          )}
          {connectorData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={bentoSpring} className="p-5 md:p-6">
              <DataGrid data={connectorData} />
            </motion.div>
          )}
        </BentoCard>
      </BentoGrid>
    </div>
  )
}
