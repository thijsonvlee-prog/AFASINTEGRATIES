"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Download } from "lucide-react"

interface DataGridProps {
  data: Record<string, unknown>[]
  onSort?: (field: string) => void
}

export function DataGrid({ data, onSort }: DataGridProps) {
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"ASC" | "DESC">("ASC")

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Geen data beschikbaar
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
        <p className="text-sm text-muted-foreground">{data.length} rijen</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportJSON}>
            <Download className="mr-1 h-3 w-3" /> <span className="hidden sm:inline">JSON</span>
          </Button>
          <Button size="sm" variant="outline" onClick={exportCSV}>
            <Download className="mr-1 h-3 w-3" /> <span className="hidden sm:inline">CSV</span>
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto -mx-4 md:mx-0">
        <div className="min-w-[600px]">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-left font-medium cursor-pointer hover:bg-muted whitespace-nowrap text-xs md:text-sm"
                    onClick={() => handleSort(col)}
                  >
                    <div className="flex items-center gap-1">
                      {col}
                      <ArrowUpDown className="h-3 w-3 opacity-50" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-t hover:bg-muted/30">
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-2 whitespace-nowrap max-w-[200px] md:max-w-[300px] truncate text-xs md:text-sm">
                      {row[col] === null || row[col] === undefined
                        ? <span className="text-muted-foreground italic">null</span>
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
