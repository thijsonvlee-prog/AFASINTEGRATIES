"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { useLogStore } from "@/store/logStore"
import { BentoCard, BentoLabel, bentoSpring } from "@/components/ui/bento-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, ChevronDown, ChevronUp, Terminal } from "lucide-react"

export function ApiLogViewer() {
  const { logs, clearLogs } = useLogStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <BentoCard index={0}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
            <Terminal className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight block">API Log</span>
            <span className="text-[10px] text-slate-400 font-mono tabular-nums">{logs.length} calls</span>
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={clearLogs} className="text-xs">
          <Trash2 className="mr-1 h-3 w-3" /> Wissen
        </Button>
      </div>

      {logs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 mb-4"><Terminal className="h-7 w-7 opacity-40" /></div>
          <p className="font-extrabold tracking-tight">Nog geen API-calls gelogd</p>
        </div>
      )}

      <div className="space-y-2 max-h-[400px] overflow-auto">
        {logs.map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...bentoSpring, delay: i * 0.03 }}
            className="rounded-2xl border border-white/20 bg-white/80 backdrop-blur-xl text-sm overflow-hidden shadow-soft"
          >
            <div
              className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50/60 transition-colors"
              onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
            >
              <div className="flex items-center gap-2">
                <Badge variant={log.responseStatus < 300 ? "success" : "destructive"} className="text-[10px] font-mono px-1.5">{log.responseStatus}</Badge>
                <span className="font-mono text-xs font-extrabold">{log.method}</span>
                <span className="text-xs text-slate-400 truncate max-w-[200px] md:max-w-[300px] font-medium">{log.url}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono tabular-nums">{log.duration}ms</span>
                {expandedId === log.id ? <ChevronUp className="h-3 w-3 text-slate-300" /> : <ChevronDown className="h-3 w-3 text-slate-300" />}
              </div>
            </div>
            {expandedId === log.id ? (
              <div className="border-t border-border/20 p-4 space-y-4 bg-slate-50/30">
                {log.requestBody ? (
                  <div>
                    <BentoLabel>Request</BentoLabel>
                    <pre className="text-xs bg-white/60 backdrop-blur-sm rounded-2xl p-3.5 overflow-auto max-h-[200px] font-mono border border-white/20 mt-1.5">{JSON.stringify(log.requestBody, null, 2)}</pre>
                  </div>
                ) : null}
                <div>
                  <BentoLabel>Response</BentoLabel>
                  <pre className="text-xs bg-white/60 backdrop-blur-sm rounded-2xl p-3.5 overflow-auto max-h-[200px] font-mono border border-white/20 mt-1.5">{JSON.stringify(log.responseBody, null, 2)}</pre>
                </div>
              </div>
            ) : null}
          </motion.div>
        ))}
      </div>
    </BentoCard>
  )
}
