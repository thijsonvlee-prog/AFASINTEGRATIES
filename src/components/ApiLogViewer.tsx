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
    <BentoCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100">
            <Terminal className="h-4 w-4 text-slate-500" />
          </div>
          <span className="font-bold text-sm">API Log</span>
        </div>
        <Button size="sm" variant="ghost" onClick={clearLogs} className="text-xs">
          <Trash2 className="mr-1 h-3 w-3" /> Wissen
        </Button>
      </div>

      {logs.length === 0 && (
        <p className="text-sm text-slate-400 py-4 text-center">Nog geen API-calls gelogd</p>
      )}

      <div className="space-y-1.5 max-h-[400px] overflow-auto">
        {logs.map((log) => (
          <div key={log.id} className="rounded-2xl border border-white/20 bg-white text-sm overflow-hidden shadow-soft">
            <div
              className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-slate-50/60 transition-colors"
              onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
            >
              <div className="flex items-center gap-2">
                <Badge variant={log.responseStatus < 300 ? "success" : "destructive"} className="text-[10px] font-mono px-1.5">{log.responseStatus}</Badge>
                <span className="font-mono text-xs font-bold">{log.method}</span>
                <span className="text-xs text-slate-400 truncate max-w-[200px] md:max-w-[300px]">{log.url}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono tabular-nums">{log.duration}ms</span>
                {expandedId === log.id ? <ChevronUp className="h-3 w-3 text-slate-300" /> : <ChevronDown className="h-3 w-3 text-slate-300" />}
              </div>
            </div>
            {expandedId === log.id && (
              <div className="border-t p-3 space-y-3 bg-slate-50/40 animate-slide-down">
                {log.requestBody ? (
                  <div>
                    <BentoLabel>Request</BentoLabel>
                    <pre className="text-xs bg-white rounded-xl p-3 overflow-auto max-h-[200px] font-mono border border-white/20 mt-1">{JSON.stringify(log.requestBody, null, 2)}</pre>
                  </div>
                ) : null}
                <div>
                  <BentoLabel>Response</BentoLabel>
                  <pre className="text-xs bg-white rounded-xl p-3 overflow-auto max-h-[200px] font-mono border border-white/20 mt-1">{JSON.stringify(log.responseBody, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </BentoCard>
  )
}
