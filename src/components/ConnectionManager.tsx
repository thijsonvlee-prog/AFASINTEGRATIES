"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useConnectionStore } from "@/store/connectionStore"
import { useToastStore } from "@/store/toastStore"
import { BentoCard, BentoGrid, BentoLabel, BentoValue, bentoSpring } from "@/components/ui/bento-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Plus, Trash2, CheckCircle, XCircle, Loader2, Plug, Star, Zap } from "lucide-react"
import type { EnvironmentType } from "@/types"

const ENV_TYPE_LABELS: Record<EnvironmentType, string> = {
  production: "Productie",
  test: "Test",
  accept: "Accept",
}
const ENV_TYPE_BADGE_VARIANT: Record<EnvironmentType, "destructive" | "info" | "warning"> = {
  production: "destructive",
  test: "info",
  accept: "warning",
}

export function ConnectionManager() {
  const {
    connections, activeConnectionId, loading,
    fetchConnections, fetchActiveConnection,
    addConnection, deleteConnection, setActiveConnection, testConnection,
  } = useConnectionStore()
  const { addToast } = useToastStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [envNumber, setEnvNumber] = useState("")
  const [token, setToken] = useState("")
  const [environmentType, setEnvironmentType] = useState<EnvironmentType>("test")
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    fetchConnections()
    fetchActiveConnection()
  }, [fetchConnections, fetchActiveConnection])

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    const result = await testConnection({ environmentNumber: envNumber, token, environmentType })
    setTestResult(result)
    setTesting(false)
    addToast({ type: result.success ? "success" : "error", title: result.success ? "Verbinding geslaagd" : "Verbinding mislukt", description: result.message })
  }

  const handleAdd = async () => {
    try {
      await addConnection({ name, environmentNumber: envNumber, token, environmentType })
      setName(""); setEnvNumber(""); setToken(""); setEnvironmentType("test"); setTestResult(null); setDialogOpen(false)
      addToast({ type: "success", title: "Verbinding opgeslagen", description: `"${name}" is toegevoegd` })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Onbekende fout"
      addToast({ type: "error", title: "Fout bij opslaan", description: message, duration: 8000 })
    }
  }

  const handleSetActive = async (id: string, connName: string) => {
    await setActiveConnection(id)
    addToast({ type: "success", title: "Verbinding geactiveerd", description: `"${connName}" is nu actief` })
  }

  const handleDelete = async (id: string, connName: string) => {
    await deleteConnection(id)
    addToast({ type: "info", title: "Verbinding verwijderd", description: `"${connName}" is verwijderd` })
  }

  const handleTestExisting = async (connectionId: string) => {
    setTesting(true)
    setTestResult(null)
    const result = await testConnection({ connectionId })
    setTestResult(result)
    setTesting(false)
    addToast({ type: result.success ? "success" : "error", title: result.success ? "Verbinding OK" : "Verbinding mislukt", description: result.message })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <BentoLabel>Beheer</BentoLabel>
          <h2 className="text-2xl font-extrabold tracking-tight mt-1">Verbindingen</h2>
          <p className="text-slate-400 text-sm">Beheer je AFAS Profit omgevingen</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Nieuwe verbinding</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nieuwe AFAS verbinding</DialogTitle>
              <DialogDescription>Voer de gegevens in van je AFAS Profit omgeving</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Naam</Label>
                <Input id="name" placeholder="Bijv. Mijn bedrijf - Test" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="env">Omgevingsnummer</Label>
                <Input id="env" placeholder="Bijv. 12345" value={envNumber} onChange={(e) => setEnvNumber(e.target.value)} />
                <p className="text-xs text-slate-400">Alleen de cijfers (bijv. O12345AA → 12345)</p>
              </div>
              <div className="space-y-2">
                <Label>Omgevingstype</Label>
                <Select value={environmentType} onValueChange={(val) => setEnvironmentType(val as EnvironmentType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test (resttest.afas.online)</SelectItem>
                    <SelectItem value="accept">Accept (restaccept.afas.online)</SelectItem>
                    <SelectItem value="production">Productie (rest.afas.online)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="token">App Connector Token</Label>
                <Input id="token" type="password" placeholder="<token>...</token>" value={token} onChange={(e) => setToken(e.target.value)} />
                <p className="text-xs text-slate-400">Plak het XML-token of het base64-encoded token.</p>
              </div>
              {testResult && (
                <div className={`flex items-center gap-3 rounded-2xl p-3.5 text-sm animate-scale-in ${testResult.success ? "glass-emerald text-emerald-800" : "glass-red text-red-800"}`}>
                  {testResult.success ? <CheckCircle className="h-4 w-4 text-emerald-500 animate-success-pop" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  <span className="font-semibold">{testResult.message}</span>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleTest} disabled={!envNumber || !token || testing}>
                {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plug className="mr-2 h-4 w-4" />}
                Test verbinding
              </Button>
              <Button onClick={handleAdd} disabled={!name || !envNumber || !token}>Opslaan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading */}
      {loading && connections.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
        </div>
      )}

      {/* Empty state */}
      {connections.length === 0 && !loading && (
        <BentoCard span={1} className="flex flex-col items-center justify-center py-16 border-dashed border-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-100 mb-4">
            <Zap className="h-7 w-7 text-violet-500" />
          </div>
          <p className="text-lg font-extrabold">Nog geen verbindingen</p>
          <p className="text-sm text-slate-400 mb-5 text-center max-w-xs">Maak je eerste verbinding aan om te starten</p>
          <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Eerste verbinding</Button>
        </BentoCard>
      )}

      {/* Stats */}
      {connections.length > 0 && (
        <BentoGrid>
          <BentoCard span={1}>
            <BentoLabel>Totaal</BentoLabel>
            <div className="mt-1"><BentoValue mono>{connections.length}</BentoValue></div>
          </BentoCard>
          <BentoCard span={1} glass={activeConnectionId ? "emerald" : undefined}>
            <BentoLabel>Actief</BentoLabel>
            <div className="mt-1">
              <span className="text-2xl font-extrabold">
                {connections.find((c) => c.id === activeConnectionId)?.name || "Geen"}
              </span>
            </div>
          </BentoCard>
          <BentoCard span={1}>
            <BentoLabel>Omgevingen</BentoLabel>
            <div className="mt-1 flex gap-2 flex-wrap">
              {["production", "test", "accept"].map((t) => {
                const count = connections.filter((c) => c.environmentType === t).length
                if (count === 0) return null
                return <Badge key={t} variant={ENV_TYPE_BADGE_VARIANT[t as EnvironmentType]}>{ENV_TYPE_LABELS[t as EnvironmentType]} ({count})</Badge>
              })}
            </div>
          </BentoCard>
        </BentoGrid>
      )}

      {/* Connection cards */}
      <BentoGrid>
        {connections.map((conn, i) => {
          const envType = conn.environmentType || "production"
          const isActive = activeConnectionId === conn.id
          return (
            <BentoCard
              key={conn.id}
              span={1}
              glass={isActive ? "violet" : undefined}
              className={isActive ? "ring-2 ring-primary/30" : ""}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-extrabold text-base truncate">{conn.name}</p>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isActive && <Badge variant="success" className="animate-success-pop">Actief</Badge>}
                  <Badge variant={ENV_TYPE_BADGE_VARIANT[envType]}>{ENV_TYPE_LABELS[envType]}</Badge>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-4 font-mono">Omgeving: {conn.environmentNumber}</p>
              <div className="flex gap-2">
                <Button size="sm" variant={isActive ? "secondary" : "default"} onClick={() => handleSetActive(conn.id, conn.name)} disabled={isActive}>
                  <Star className="mr-1 h-3 w-3" />{isActive ? "Actief" : "Activeren"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleTestExisting(conn.id)} disabled={testing}>
                  {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plug className="mr-1 h-3 w-3" />}Test
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(conn.id, conn.name)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </BentoCard>
          )
        })}
      </BentoGrid>
    </div>
  )
}
