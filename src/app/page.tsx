"use client"

import React, { useEffect } from "react"
import { motion } from "framer-motion"
import { useConnectionStore } from "@/store/connectionStore"
import { usePipelineStore } from "@/store/pipelineStore"
import { BentoCard, BentoGrid, BentoLabel, BentoValue, bentoSpring } from "@/components/ui/bento-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plug, Search, Shuffle, GitBranch, ArrowRight, AlertTriangle, Activity, Database } from "lucide-react"

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
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={bentoSpring}
        className="rounded-3xl bg-gradient-to-br from-[hsl(245,58%,51%)] via-[hsl(245,50%,45%)] to-[hsl(260,45%,35%)] p-6 md:p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMjR2Nmg2di02aC02em0wLTEydjZoNnYtNmgtNnptLTEyIDEydjZoNnYtNmgtNnptMCAxMnY2aDZ2LTZoLTZ6bTAtMjR2Nmg2di02aC02em0wLTEydjZoNnYtNmgtNnptLTEyIDEydjZoNnYtNmgtNnptMCAxMnY2aDZ2LTZoLTZ6bTAtMjR2Nmg2di02aC02em0wLTEydjZoNnYtNmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="relative">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Dashboard</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">AFAS Integratieplatform</h2>
          <p className="text-white/60 mt-1 text-sm">Beheer je connectoren, transformaties en pipelines</p>
        </div>
      </motion.div>

      {/* Status banner */}
      {activeConnection ? (
        <BentoCard glass="emerald" className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10">
              <Plug className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <BentoLabel>Actieve verbinding</BentoLabel>
              <p className="font-bold text-emerald-900 truncate">{activeConnection.name}</p>
            </div>
            <Badge variant={activeConnection.environmentType === "production" ? "destructive" : activeConnection.environmentType === "accept" ? "warning" : "info"}>
              {activeConnection.environmentType === "production" ? "Productie" : activeConnection.environmentType === "accept" ? "Accept" : "Test"}
            </Badge>
          </div>
        </BentoCard>
      ) : (
        <BentoCard glass="amber" className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            Geen actieve verbinding.{" "}
            <Link href="/connections" className="font-bold underline underline-offset-2 hover:text-amber-900">Maak een verbinding</Link>{" "}
            om te starten.
          </p>
        </BentoCard>
      )}

      {/* Stats Bento Grid */}
      <BentoGrid>
        <BentoCard span={1}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100">
              <Plug className="h-5 w-5 text-violet-600" />
            </div>
          </div>
          <BentoLabel>Verbindingen</BentoLabel>
          <div className="mt-1"><BentoValue mono>{connections.length}</BentoValue></div>
        </BentoCard>

        <BentoCard span={1}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100">
              <Activity className="h-5 w-5 text-sky-600" />
            </div>
          </div>
          <BentoLabel>Pipelines</BentoLabel>
          <div className="mt-1"><BentoValue mono>{pipelines.length}</BentoValue></div>
        </BentoCard>

        <BentoCard span={1}>
          <div className="flex items-start justify-between mb-4">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${activeConnection ? "bg-emerald-100" : "bg-slate-100"}`}>
              <Database className={`h-5 w-5 ${activeConnection ? "text-emerald-600" : "text-slate-400"}`} />
            </div>
            {activeConnection && <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />}
          </div>
          <BentoLabel>Status</BentoLabel>
          <div className="mt-1"><span className="text-2xl font-extrabold">{activeConnection ? "Online" : "Offline"}</span></div>
        </BentoCard>

        {/* Quick start — wide */}
        <BentoCard span={3} noPadding>
          <div className="p-5 md:p-6 pb-3">
            <BentoLabel>Snel starten</BentoLabel>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-border/30">
            {[
              { href: "/connections", icon: Plug, title: "Verbinding", desc: "Configureer omgeving", color: "text-violet-600 bg-violet-50", hoverBg: "hover:bg-violet-50/60" },
              { href: "/explorer", icon: Search, title: "Data ophalen", desc: "GetConnector Explorer", color: "text-sky-600 bg-sky-50", hoverBg: "hover:bg-sky-50/60" },
              { href: "/transform", icon: Shuffle, title: "Transformeren", desc: "Hernoemen, berekenen", color: "text-amber-600 bg-amber-50", hoverBg: "hover:bg-amber-50/60" },
              { href: "/pipelines", icon: GitBranch, title: "Pipeline", desc: "Automatiseer workflow", color: "text-emerald-600 bg-emerald-50", hoverBg: "hover:bg-emerald-50/60" },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center text-center py-6 px-4 cursor-pointer transition-colors ${item.hoverBg} border-r border-b border-border/30 last:border-r-0`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.color} mb-3`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="font-bold text-sm">{item.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </BentoCard>
      </BentoGrid>

      {/* Recent pipelines */}
      {pipelines.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <BentoLabel>Recente pipelines</BentoLabel>
            <Link href="/pipelines">
              <Button variant="ghost" size="sm" className="text-xs">Bekijk alle <ArrowRight className="ml-1 h-3 w-3" /></Button>
            </Link>
          </div>
          <div className="space-y-3">
            {pipelines.slice(0, 5).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...bentoSpring, delay: i * 0.05 }}
              >
                <Link href="/pipelines">
                  <div className="flex items-center justify-between rounded-3xl border border-white/20 bg-white shadow-bento p-4 hover:shadow-bento-hover hover:scale-[1.01] transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100">
                        <GitBranch className="h-4 w-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{p.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{p.getConnector.name} → {p.updateConnector.name}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
