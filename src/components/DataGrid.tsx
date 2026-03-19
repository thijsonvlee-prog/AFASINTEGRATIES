"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Download, ArrowUp, ArrowDown, Table } from "lucide-react"

interface DataGridProps {
  data: Record<string, unknown>[]
  onSort?: (field: string) => void
}

export function DataGrid({ data, onSort }: DataGridProps) {
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"ASC" | "DESC">("ASC")

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Table className="h-8 w-8 mb-2 opacity-50" />
        <p>Geen data beschikbaar</p>
      </div>
    )
  }

  const columns = Object.keys(data[0])

  const handleSort = (field: string) => {
    const newDir = sortField === field && sortDir === "ASC" ? "DESC" : "ASC"
    setSortField(field)
    setSortDir(newDir)
    onSort?.(field)
  }

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "export.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportCSV = () => {
    const header = columns.join(";")
    const rows = data.map((row) =>
      columns.map((col) => {
        const val = row[col]
        const str = val === null || val === undefined ? "" : String(val)
        return str.includes(";") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
      }).join(";")
    )
    const csv = [header, ...rows].join("\n")
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "export.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="font-mono text-xs">
          {data.length} rijen &middot; {columns.length} kolommen
        </Badge>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportJSON}>
            <Download className="mr-1.5 h-3 w-3" /> <span className="hidden sm:inline">JSON</span>
          </Button>
          <Button size="sm" variant="outline" onClick={exportCSV}>
            <Download className="mr-1.5 h-3 w-3" /> <span className="hidden sm:inline">CSV</span>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto -mx-4 md:mx-0 shadow-card">
        <div className="min-w-[600px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2.5 text-left font-semibold cursor-pointer hover:bg-muted/60 transition-colors whitespace-nowrap text-xs"
                    onClick={() => handleSort(col)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-foreground/70">{col}</span>
                      {sortField === col ? (
                        sortDir === "ASC" ? (
                          <ArrowUp className="h-3 w-3 text-primary" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-primary" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-30" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-border/50 hover:bg-accent/40 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-2 whitespace-nowrap max-w-[200px] md:max-w-[300px] truncate text-xs md:text-sm">
                      {row[col] === null || row[col] === undefined
                        ? <span className="text-muted-foreground/50 italic text-xs">null</span>
                        : String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
