"use client"

import React, { useState } from "react"
import { useLogStore } from "@/store/logStore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, ChevronDown, ChevronUp, Terminal } from "lucide-react"

export function ApiLogViewer() {
  const { logs, clearLogs } = useLogStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted">
              <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            API Log
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={clearLogs} className="text-xs">
            <Trash2 className="mr-1 h-3 w-3" /> Wissen
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">Nog geen API-calls gelogd</p>
        )}
        <div className="space-y-1.5 max-h-[400px] overflow-auto">
          {logs.map((log) => (
            <div key={log.id} className="rounded-lg border text-sm overflow-hidden">
              <div
                className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={log.responseStatus < 300 ? "success" : "destructive"}
                    className="text-[10px] font-mono px-1.5"
                  >
                    {log.responseStatus}
                  </Badge>
                  <span className="font-mono text-xs font-semibold">{log.method}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-[300px]">
                    {log.url}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-mono">{log.duration}ms</span>
                  {expandedId === log.id ? (
                    <ChevronUp className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              </div>
              {expandedId === log.id && (
                <div className="border-t p-3 space-y-3 bg-muted/20 animate-slide-down">
                  {log.requestBody ? (
                    <div>
                      <p className="text-xs font-semibold mb-1.5">Request:</p>
                      <pre className="text-xs bg-card rounded-lg p-3 overflow-auto max-h-[200px] font-mono border">
                        {JSON.stringify(log.requestBody, null, 2)}
                      </pre>
                    </div>
                  ) : null}
                  <div>
                    <p className="text-xs font-semibold mb-1.5">Response:</p>
                    <pre className="text-xs bg-card rounded-lg p-3 overflow-auto max-h-[200px] font-mono border">
                      {JSON.stringify(log.responseBody, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
