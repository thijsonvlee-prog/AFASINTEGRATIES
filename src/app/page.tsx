"use client"

import React, { useEffect } from "react"
import { useConnectionStore } from "@/store/connectionStore"
import { usePipelineStore } from "@/store/pipelineStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plug, Search, Shuffle, Upload, GitBranch, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { connections, activeConnectionId, fetchConnections, fetchActiveConnection } = useConnectionStore()
  const { pipelines, fetchPipelines } = usePipelineStore()

  useEffect(() => {
    fetchConnections()
    fetchActiveConnection()
    fetchPipelines()
  }, [fetchConnections, fetchActiveConnection, fetchPipelines])

  const activeConnection = connections.find((c) => c.id === activeConnectionId)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">AFAS Profit Integratieplatform</p>
      </div>

      {activeConnection && (
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Plug className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="font-medium truncate">Actieve verbinding: {activeConnection.name}</p>
              <p className="text-sm text-muted-foreground">
                Omgeving {activeConnection.environmentNumber}
              </p>
            </div>
            <Badge variant={activeConnection.environmentType === "production" ? "destructive" : "secondary"}>
              {activeConnection.environmentType === "production" ? "Productie" : activeConnection.environmentType === "accept" ? "Accept" : "Test"}
            </Badge>
          </div>
        </div>
      )}

      {!activeConnection && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <p className="text-sm text-yellow-800">
            Geen actieve verbinding. Ga naar{" "}
            <Link href="/connections" className="font-medium underline">
              Verbindingen
            </Link>{" "}
            om een verbinding te configureren.
          </p>
        </div>
      )}

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verbindingen</CardTitle>
            <Plug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connections.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipelines</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelines.length}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Snel starten</h3>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/connections", icon: Plug, title: "Verbinding maken", desc: "Configureer AFAS omgeving" },
            { href: "/explorer", icon: Search, title: "Data ophalen", desc: "GetConnector Explorer" },
            { href: "/transform", icon: Shuffle, title: "Data transformeren", desc: "Velden hernoemen, berekenen" },
            { href: "/pipelines", icon: GitBranch, title: "Pipeline maken", desc: "Automatiseer je workflow" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardContent className="flex flex-col items-center text-center py-6">
                  <item.icon className="h-8 w-8 text-primary mb-3" />
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {pipelines.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Recente pipelines</h3>
          <div className="space-y-2">
            {pipelines.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.getConnector.name} → {p.updateConnector.name}
                    </p>
                  </div>
                </div>
                <Link href="/pipelines">
                  <Button size="sm" variant="ghost">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
