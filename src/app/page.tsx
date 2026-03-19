"use client"

import React, { useEffect } from "react"
import { useConnectionStore } from "@/store/connectionStore"
import { usePipelineStore } from "@/store/pipelineStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plug, Search, Shuffle, GitBranch, ArrowRight, Zap, Activity, Database, AlertTriangle } from "lucide-react"
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
    <div className="space-y-8">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(245,58%,51%)] via-[hsl(245,50%,45%)] to-[hsl(260,45%,35%)] p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMjR2Nmg2di02aC02em0wLTEydjZoNnYtNmgtNnptLTEyIDEydjZoNnYtNmgtNnptMCAxMnY2aDZ2LTZoLTZ6bTAtMjR2Nmg2di02aC02em0wLTEydjZoNnYtNmgtNnptLTEyIDEydjZoNnYtNmgtNnptMCAxMnY2aDZ2LTZoLTZ6bTAtMjR2Nmg2di02aC02em0wLTEydjZoNnYtNmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-5 w-5 text-violet-200" />
            <span className="text-xs uppercase tracking-widest text-white/60 font-semibold">Dashboard</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            AFAS Integratieplatform
          </h2>
          <p className="text-white/70 mt-1 text-sm md:text-base">
            Beheer je connectoren, transformaties en pipelines
          </p>
        </div>
      </div>

      {/* Active connection banner */}
      {activeConnection && (
        <div className="animate-slide-up rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
              <Plug className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-emerald-900 truncate text-sm">
                Verbonden met {activeConnection.name}
              </p>
              <p className="text-xs text-emerald-600">
                Omgeving {activeConnection.environmentNumber}
              </p>
            </div>
            <Badge variant={activeConnection.environmentType === "production" ? "destructive" : activeConnection.environmentType === "accept" ? "warning" : "info"}>
              {activeConnection.environmentType === "production" ? "Productie" : activeConnection.environmentType === "accept" ? "Accept" : "Test"}
            </Badge>
          </div>
        </div>
      )}

      {!activeConnection && (
        <div className="animate-slide-up rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800">
            Geen actieve verbinding.{" "}
            <Link href="/connections" className="font-semibold underline underline-offset-2 hover:text-amber-900">
              Maak een verbinding
            </Link>{" "}
            om te starten.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100">
                <Plug className="h-4 w-4 text-violet-600" />
              </div>
            </div>
            <div className="text-2xl font-bold">{connections.length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Verbindingen</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100">
                <Activity className="h-4 w-4 text-sky-600" />
              </div>
            </div>
            <div className="text-2xl font-bold">{pipelines.length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Pipelines</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                <Database className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-bold">{activeConnection ? "Online" : "-"}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Status</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                <Shuffle className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <div className="text-2xl font-bold">{pipelines.reduce((acc, p) => acc + p.transformSteps.length, 0)}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Transformaties</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick start */}
      <div>
        <h3 className="text-base font-semibold mb-4 text-foreground/80">Snel starten</h3>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/connections", icon: Plug, title: "Verbinding", desc: "Configureer omgeving", color: "bg-violet-100 text-violet-600" },
            { href: "/explorer", icon: Search, title: "Data ophalen", desc: "GetConnector Explorer", color: "bg-sky-100 text-sky-600" },
            { href: "/transform", icon: Shuffle, title: "Transformeren", desc: "Hernoemen, berekenen", color: "bg-amber-100 text-amber-600" },
            { href: "/pipelines", icon: GitBranch, title: "Pipeline", desc: "Automatiseer workflow", color: "bg-emerald-100 text-emerald-600" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full group">
                <CardContent className="flex flex-col items-center text-center py-6 px-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color} mb-3 group-hover:scale-110 transition-transform duration-200`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent pipelines */}
      {pipelines.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground/80">Recente pipelines</h3>
            <Link href="/pipelines">
              <Button variant="ghost" size="sm" className="text-xs">
                Bekijk alle <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {pipelines.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border bg-card p-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                    <GitBranch className="h-3.5 w-3.5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.getConnector.name} → {p.updateConnector.name}
                    </p>
                  </div>
                </div>
                <Link href="/pipelines">
                  <Button size="sm" variant="ghost" className="group">
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
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
