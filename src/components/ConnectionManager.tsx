"use client"

import React, { useState, useEffect } from "react"
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

const ENV_TYPE_LABELS: Record<EnvironmentType, string> = { production: "Productie", test: "Test", accept: "Accept" }
const ENV_TYPE_BADGE_VARIANT: Record<EnvironmentType, "destructive" | "info" | "warning"> = { production: "destructive", test: "info", accept: "warning" }

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

  useEffect(() => { fetchConnections(); fetchActiveConnection() }, [fetchConnections, fetchActiveConnection])

  const handleTest = async () => {
    setTesting(true); setTestResult(null)
    const result = await testConnection({ environmentNumber: envNumber, token, environmentType })
    setTestResult(result); setTesting(false)
    addToast({ type: result.success ? "success" : "error", title: result.success ? "Verbinding geslaagd" : "Verbinding mislukt", description: result.message })
  }

  const handleAdd = async () => {
    try {
      await addConnection({ name, environmentNumber: envNumber, token, environmentType })
      setName(""); setEnvNumber(""); setToken(""); setEnvironmentType("test"); setTestResult(null); setDialogOpen(false)
      addToast({ type: "success", title: "Verbinding opgeslagen", description: `"${name}" is toegevoegd` })
    } catch (error) {
      addToast({ type: "error", title: "Fout bij opslaan", description: error instanceof Error ? error.message : "Onbekende fout", duration: 8000 })
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
    setTesting(true); setTestResult(null)
    const result = await testConnection({ connectionId })
    setTestResult(result); setTesting(false)
    addToast({ type: result.success ? "success" : "error", title: result.success ? "Verbinding OK" : "Verbinding mislukt", description: result.message })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <BentoLabel>Beheer</BentoLabel>
          <h2 className="text-3xl font-extrabold tracking-tighter mt-1">Verbindingen</h2>
          <p className="text-slate-400 text-sm font-medium">Beheer je AFAS Profit omgevingen</p>
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
              <div className="space-y-2"><Label htmlFor="name">Naam</Label><Input id="name" placeholder="Bijv. Mijn bedrijf - Test" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="space-y-2">
                <Label htmlFor="env">Omgevingsnummer</Label>
                <Input id="env" placeholder="Bijv. 12345" value={envNumber} onChange={(e) => setEnvNumber(e.target.value)} />
                <p className="text-[10px] text-slate-400 font-medium">Alleen de cijfers (bijv. O12345AA → 12345)</p>
              </div>
              <div className="space-y-2">
                <Label>Omgevingstype</Label>
                <Select value={environmentType} onValueChange={(val) => setEnvironmentType(val as EnvironmentType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test</SelectItem><SelectItem value="accept">Accept</SelectItem><SelectItem value="production">Productie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="token">App Connector Token</Label>
                <Input id="token" type="password" placeholder="<token>...</token>" value={token} onChange={(e) => setToken(e.target.value)} />
              </div>
              {testResult && (
                <div className={`flex items-center gap-3 rounded-2xl p-3.5 text-sm animate-scale-in ${testResult.success ? "glass-emerald text-emerald-800" : "glass-red text-red-800"}`}>
                  {testResult.success ? <CheckCircle className="h-4 w-4 text-emerald-500 animate-success-pop" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  <span className="font-bold">{testResult.message}</span>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleTest} disabled={!envNumber || !token || testing}>
                {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plug className="mr-2 h-4 w-4" />}Test
              </Button>
              <Button onClick={handleAdd} disabled={!name || !envNumber || !token}>Opslaan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading && connections.length === 0 && (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary/40" /></div>
      )}

      {connections.length === 0 && !loading && (
        <BentoCard index={0} className="flex flex-col items-center justify-center py-20 border-dashed border-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-violet-50 mb-5">
            <Zap className="h-9 w-9 text-violet-400" />
          </div>
          <p className="text-xl font-extrabold tracking-tight">Nog geen verbindingen</p>
          <p className="text-sm text-slate-400 mb-6 text-center max-w-xs font-medium">Maak je eerste verbinding aan om te starten</p>
          <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Eerste verbinding</Button>
        </BentoCard>
      )}

      {connections.length > 0 && (
        <BentoGrid>
          <BentoCard span={1} index={0}>
            <BentoLabel>Totaal</BentoLabel>
            <div className="mt-2"><BentoValue mono size="large">{connections.length}</BentoValue></div>
          </BentoCard>
          <BentoCard span={1} glass={activeConnectionId ? "emerald" : undefined} index={1}>
            <BentoLabel>Actief</BentoLabel>
            <div className="mt-2"><span className="text-3xl font-extrabold tracking-tighter">{connections.find((c) => c.id === activeConnectionId)?.name || "Geen"}</span></div>
          </BentoCard>
          <BentoCard span={1} index={2}>
            <BentoLabel>Omgevingen</BentoLabel>
            <div className="mt-3 flex gap-2 flex-wrap">
              {(["production", "test", "accept"] as const).map((t) => {
                const count = connections.filter((c) => c.environmentType === t).length
                if (count === 0) return null
                return <Badge key={t} variant={ENV_TYPE_BADGE_VARIANT[t]}>{ENV_TYPE_LABELS[t]} ({count})</Badge>
              })}
            </div>
          </BentoCard>
        </BentoGrid>
      )}

      <BentoGrid>
        {connections.map((conn, i) => {
          const envType = conn.environmentType || "production"
          const isActive = activeConnectionId === conn.id
          return (
            <BentoCard
              key={conn.id}
              span={1}
              index={i}
              glass={isActive ? "violet" : undefined}
              hoverGlow={isActive ? "violet" : undefined}
              className={isActive ? "ring-2 ring-primary/20" : ""}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="font-extrabold text-base tracking-tight truncate">{conn.name}</p>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isActive && <Badge variant="success" className="animate-success-pop">Actief</Badge>}
                  <Badge variant={ENV_TYPE_BADGE_VARIANT[envType]}>{ENV_TYPE_LABELS[envType]}</Badge>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mb-5 font-mono">Omgeving: {conn.environmentNumber}</p>
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
