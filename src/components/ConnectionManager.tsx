"use client"

import React, { useState, useEffect } from "react"
import { useConnectionStore } from "@/store/connectionStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Plus, Trash2, CheckCircle, XCircle, Loader2, Plug, Star } from "lucide-react"
import type { EnvironmentType } from "@/types"

const ENV_TYPE_LABELS: Record<EnvironmentType, string> = {
  production: "Productie",
  test: "Test",
  accept: "Accept",
}

const ENV_TYPE_BADGE_VARIANT: Record<EnvironmentType, "destructive" | "secondary" | "warning"> = {
  production: "destructive",
  test: "secondary",
  accept: "warning",
}

export function ConnectionManager() {
  const {
    connections,
    activeConnectionId,
    loading,
    fetchConnections,
    fetchActiveConnection,
    addConnection,
    deleteConnection,
    setActiveConnection,
    testConnection,
  } = useConnectionStore()

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
    const result = await testConnection({
      environmentNumber: envNumber,
      token,
      environmentType,
    })
    setTestResult(result)
    setTesting(false)
  }

  const handleAdd = async () => {
    try {
      await addConnection({
        name,
        environmentNumber: envNumber,
        token,
        environmentType,
      })
      setName("")
      setEnvNumber("")
      setToken("")
      setEnvironmentType("test")
      setTestResult(null)
      setDialogOpen(false)
    } catch {
      // error is al in de store gezet
    }
  }

  const handleTestExisting = async (connectionId: string) => {
    setTesting(true)
    setTestResult(null)
    const result = await testConnection({ connectionId })
    setTestResult(result)
    setTesting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Verbindingen</h2>
          <p className="text-muted-foreground">Beheer je AFAS Profit omgevingen</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nieuwe verbinding
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nieuwe AFAS verbinding</DialogTitle>
              <DialogDescription>
                Voer de gegevens in van je AFAS Profit omgeving
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Naam</Label>
                <Input
                  id="name"
                  placeholder="Bijv. Mijn bedrijf - Test"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="env">Omgevingsnummer</Label>
                <Input
                  id="env"
                  placeholder="Bijv. 12345"
                  value={envNumber}
                  onChange={(e) => setEnvNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Alleen de cijfers van je omgevingsnaam (bijv. O12345AA → 12345)
                </p>
              </div>
              <div className="space-y-2">
                <Label>Omgevingstype</Label>
                <Select
                  value={environmentType}
                  onValueChange={(val) => setEnvironmentType(val as EnvironmentType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test (resttest.afas.online)</SelectItem>
                    <SelectItem value="accept">Accept (restaccept.afas.online)</SelectItem>
                    <SelectItem value="production">Productie (rest.afas.online)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="token">App Connector Token</Label>
                <Input
                  id="token"
                  type="password"
                  placeholder="<token><version>1</version><data>...</data></token>"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Plak het XML-token of het base64-encoded token. Wordt veilig server-side opgeslagen.
                </p>
              </div>

              {testResult && (
                <div
                  className={`flex items-center gap-2 rounded-md p-3 text-sm ${
                    testResult.success
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {testResult.message}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleTest} disabled={!envNumber || !token || testing}>
                {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plug className="mr-2 h-4 w-4" />}
                Test verbinding
              </Button>
              <Button onClick={handleAdd} disabled={!name || !envNumber || !token}>
                Opslaan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading && connections.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {connections.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Plug className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nog geen verbindingen</p>
            <p className="text-sm text-muted-foreground mb-4">
              Maak een verbinding aan om te starten met AFAS
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Eerste verbinding toevoegen
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {connections.map((conn) => {
          const envType = conn.environmentType || "production"
          return (
            <Card
              key={conn.id}
              className={`cursor-pointer transition-all ${
                activeConnectionId === conn.id
                  ? "ring-2 ring-primary border-primary"
                  : "hover:border-primary/50"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{conn.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {activeConnectionId === conn.id && (
                      <Badge variant="success">Actief</Badge>
                    )}
                    <Badge variant={ENV_TYPE_BADGE_VARIANT[envType]}>
                      {ENV_TYPE_LABELS[envType]}
                    </Badge>
                  </div>
                </div>
                <CardDescription>Omgeving: {conn.environmentNumber}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={activeConnectionId === conn.id ? "secondary" : "default"}
                    onClick={() => setActiveConnection(conn.id)}
                    disabled={activeConnectionId === conn.id}
                  >
                    <Star className="mr-1 h-3 w-3" />
                    {activeConnectionId === conn.id ? "Actief" : "Activeren"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestExisting(conn.id)}
                    disabled={testing}
                  >
                    {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plug className="mr-1 h-3 w-3" />}
                    Test
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => deleteConnection(conn.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
