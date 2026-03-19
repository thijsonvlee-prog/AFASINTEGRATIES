"use client"

import React, { useState } from "react"
import { useLogStore } from "@/store/logStore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, ChevronDown, ChevronUp } from "lucide-react"

export function ApiLogViewer() {
  const { logs, clearLogs } = useLogStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">API Log</CardTitle>
          <Button size="sm" variant="ghost" onClick={clearLogs}>
            <Trash2 className="mr-1 h-3 w-3" /> Wissen
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 && (
          <p className="text-sm text-muted-foreground">Nog geen API-calls gelogd</p>
        )}
        <div className="space-y-2 max-h-[400px] overflow-auto">
          {logs.map((log) => (
            <div key={log.id} className="rounded-md border text-sm">
              <div
                className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50"
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={log.responseStatus < 300 ? "success" : "destructive"}
                    className="text-xs font-mono"
                  >
                    {log.responseStatus}
                  </Badge>
                  <span className="font-mono text-xs font-medium">{log.method}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                    {log.url}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{log.duration}ms</span>
                  {expandedId === log.id ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </div>
              </div>
              {expandedId === log.id && (
                <div className="border-t p-2 space-y-2">
                  {log.requestBody ? (
                    <div>
                      <p className="text-xs font-medium mb-1">Request:</p>
                      <pre className="text-xs bg-muted rounded p-2 overflow-auto max-h-[200px]">
                        {JSON.stringify(log.requestBody, null, 2)}
                      </pre>
                    </div>
                  ) : null}
                  <div>
                    <p className="text-xs font-medium mb-1">Response:</p>
                    <pre className="text-xs bg-muted rounded p-2 overflow-auto max-h-[200px]">
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
