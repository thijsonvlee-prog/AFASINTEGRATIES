"use client"

import { create } from "zustand"
import type { ApiLogEntry } from "@/types"
import { v4 as uuidv4 } from "uuid"

interface LogState {
  logs: ApiLogEntry[]
  addLog: (log: Omit<ApiLogEntry, "id" | "timestamp">) => void
  clearLogs: () => void
}

export const useLogStore = create<LogState>((set) => ({
  logs: [],

  addLog: (log) => {
    set((state) => ({
      logs: [
        {
          ...log,
          id: uuidv4(),
          timestamp: new Date().toISOString(),
        },
        ...state.logs,
      ].slice(0, 200), // Keep last 200 entries
    }))
  },

  clearLogs: () => set({ logs: [] }),
}))
