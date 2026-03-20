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
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 mb-4"><Table className="h-7 w-7 opacity-40" /></div>
        <p className="font-extrabold tracking-tight">Geen data beschikbaar</p>
      </div>
    )
  }

  const columns = Object.keys(data[0])
  const handleSort = (field: string) => {
    const newDir = sortField === field && sortDir === "ASC" ? "DESC" : "ASC"
    setSortField(field); setSortDir(newDir); onSort?.(field)
  }

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "export.json"; a.click(); URL.revokeObjectURL(url)
  }
  const exportCSV = () => {
    const header = columns.join(";")
    const rows = data.map((row) => columns.map((col) => { const v = row[col]; const s = v === null || v === undefined ? "" : String(v); return s.includes(";") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s }).join(";"))
    const csv = [header, ...rows].join("\n")
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "export.csv"; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="font-mono text-xs tabular-nums">
          {data.length} rijen &middot; {columns.length} kolommen
        </Badge>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportJSON}><Download className="mr-1.5 h-3 w-3" /> <span className="hidden sm:inline">JSON</span></Button>
          <Button size="sm" variant="outline" onClick={exportCSV}><Download className="mr-1.5 h-3 w-3" /> <span className="hidden sm:inline">CSV</span></Button>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/20 bg-white/80 backdrop-blur-xl overflow-x-auto -mx-4 md:mx-0 shadow-bento">
        <div className="min-w-[600px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/20 bg-slate-50/60">
                {columns.map((col) => (
                  <th key={col} className="px-4 py-3 text-left font-bold cursor-pointer hover:bg-slate-100/60 transition-colors whitespace-nowrap text-[10px] uppercase tracking-[0.15em] text-slate-400" onClick={() => handleSort(col)}>
                    <div className="flex items-center gap-1.5">
                      {col}
                      {sortField === col ? (sortDir === "ASC" ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />) : <ArrowUpDown className="h-3 w-3 opacity-20" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-t border-border/10 hover:bg-accent/20 transition-colors">
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-2.5 whitespace-nowrap max-w-[200px] md:max-w-[300px] truncate text-xs md:text-sm font-mono tabular-nums">
                      {row[col] === null || row[col] === undefined
                        ? <span className="text-slate-300 italic text-xs">null</span>
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
