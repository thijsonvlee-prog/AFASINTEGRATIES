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
    <div className="space-y-8">
      {/* Mesh-gradient hero — col-span-full */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={bentoSpring}
        className="rounded-[2.5rem] mesh-gradient p-8 md:p-10 text-white relative overflow-hidden"
      >
        {/* Glow spots */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-violet-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-indigo-400/15 rounded-full blur-3xl" />
        <div className="relative">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Dashboard</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter mt-2">
            AFAS Integratieplatform
          </h2>
          <p className="text-white/50 mt-2 text-sm font-medium max-w-md">
            Beheer je connectoren, transformaties en pipelines vanuit een centraal dashboard.
          </p>
        </div>
      </motion.div>

      {/* Status banner */}
      {activeConnection ? (
        <BentoCard glass="emerald" index={1} className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
              <Plug className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <BentoLabel>Actieve verbinding</BentoLabel>
              <p className="font-extrabold text-emerald-900 truncate text-lg tracking-tight mt-0.5">{activeConnection.name}</p>
            </div>
            <Badge variant={activeConnection.environmentType === "production" ? "destructive" : activeConnection.environmentType === "accept" ? "warning" : "info"}>
              {activeConnection.environmentType === "production" ? "Productie" : activeConnection.environmentType === "accept" ? "Accept" : "Test"}
            </Badge>
          </div>
        </BentoCard>
      ) : (
        <BentoCard glass="amber" index={1} className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-sm text-amber-800">
            Geen actieve verbinding.{" "}
            <Link href="/connections" className="font-extrabold underline underline-offset-2 hover:text-amber-900">Maak een verbinding</Link>{" "}
            om te starten.
          </p>
        </BentoCard>
      )}

      {/* Stats Bento Grid — different sizes */}
      <BentoGrid>
        {/* Connections — large */}
        <BentoCard span={1} index={0}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-violet-50">
              <Plug className="h-6 w-6 text-violet-500" />
            </div>
          </div>
          <BentoLabel>Verbindingen</BentoLabel>
          <div className="mt-2">
            <BentoValue mono size="large">{connections.length}</BentoValue>
          </div>
        </BentoCard>

        {/* Pipelines — large */}
        <BentoCard span={1} index={1}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-50">
              <Activity className="h-6 w-6 text-sky-500" />
            </div>
          </div>
          <BentoLabel>Pipelines</BentoLabel>
          <div className="mt-2">
            <BentoValue mono size="large">{pipelines.length}</BentoValue>
          </div>
        </BentoCard>

        {/* Status — with live indicator */}
        <BentoCard span={1} index={2}>
          <div className="flex items-start justify-between mb-6">
            <div className={`flex h-14 w-14 items-center justify-center rounded-3xl ${activeConnection ? "bg-emerald-50" : "bg-slate-50"}`}>
              <Database className={`h-6 w-6 ${activeConnection ? "text-emerald-500" : "text-slate-300"}`} />
            </div>
            {activeConnection && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            )}
          </div>
          <BentoLabel>Status</BentoLabel>
          <div className="mt-2">
            <BentoValue size="large">{activeConnection ? "Online" : "Offline"}</BentoValue>
          </div>
        </BentoCard>

        {/* Transformaties count */}
        <BentoCard span={1} index={3}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-50">
              <Shuffle className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <BentoLabel>Transformaties</BentoLabel>
          <div className="mt-2">
            <BentoValue mono size="large">{pipelines.reduce((acc, p) => acc + p.transformSteps.length, 0)}</BentoValue>
          </div>
        </BentoCard>

        {/* Quick start — col-span-2, horizontal layout with hover-glow */}
        <BentoCard span={2} noPadding index={4}>
          <div className="p-6 md:p-7 pb-4">
            <BentoLabel>Snel starten</BentoLabel>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { href: "/connections", icon: Plug, title: "Verbinding", desc: "Configureer omgeving", iconBg: "bg-violet-50", iconColor: "text-violet-500", glow: "hover:shadow-glow-violet" },
              { href: "/explorer", icon: Search, title: "Data ophalen", desc: "GetConnector Explorer", iconBg: "bg-sky-50", iconColor: "text-sky-500", glow: "hover:shadow-glow-sky" },
              { href: "/transform", icon: Shuffle, title: "Transformeren", desc: "Hernoemen, berekenen", iconBg: "bg-amber-50", iconColor: "text-amber-500", glow: "hover:shadow-glow-amber" },
              { href: "/pipelines", icon: GitBranch, title: "Pipeline", desc: "Automatiseer workflow", iconBg: "bg-emerald-50", iconColor: "text-emerald-500", glow: "hover:shadow-glow-emerald" },
            ].map((item, i) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  transition={bentoSpring}
                  className={`flex flex-col items-center text-center py-7 px-4 cursor-pointer transition-all duration-300 rounded-2xl mx-1 mb-1 ${item.glow}`}
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-3xl ${item.iconBg} mb-3`}>
                    <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                  </div>
                  <p className="font-extrabold text-sm tracking-tight">{item.title}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">{item.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </BentoCard>
      </BentoGrid>

      {/* Recent pipelines */}
      {pipelines.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <BentoLabel>Recente pipelines</BentoLabel>
            <Link href="/pipelines">
              <Button variant="ghost" size="sm" className="text-xs font-semibold">Bekijk alle <ArrowRight className="ml-1 h-3 w-3" /></Button>
            </Link>
          </div>
          <div className="space-y-3">
            {pipelines.slice(0, 5).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...bentoSpring, delay: i * 0.06 }}
              >
                <Link href="/pipelines">
                  <motion.div
                    whileHover={{ y: -3, scale: 1.01 }}
                    transition={bentoSpring}
                    className="flex items-center justify-between rounded-[2rem] border border-white/20 bg-white/80 backdrop-blur-xl shadow-bento p-5 hover:shadow-bento-hover transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50">
                        <GitBranch className="h-5 w-5 text-violet-500" />
                      </div>
                      <div>
                        <p className="font-extrabold text-sm tracking-tight">{p.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{p.getConnector.name} → {p.updateConnector.name}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
