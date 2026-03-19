"use client"

import { create } from "zustand"
import type { ConnectionProfilePublic, EnvironmentType } from "@/types"

interface ConnectionState {
  connections: ConnectionProfilePublic[]
  activeConnectionId: string | null
  loading: boolean
  error: string | null
  fetchConnections: () => Promise<void>
  addConnection: (data: {
    name: string
    environmentNumber: string
    token: string
    environmentType: EnvironmentType
  }) => Promise<void>
  updateConnection: (data: {
    id: string
    name?: string
    environmentNumber?: string
    token?: string
    environmentType?: EnvironmentType
  }) => Promise<void>
  deleteConnection: (id: string) => Promise<void>
  setActiveConnection: (id: string) => Promise<void>
  fetchActiveConnection: () => Promise<void>
  testConnection: (
    data:
      | { environmentNumber: string; token: string; environmentType: EnvironmentType }
      | { connectionId: string }
  ) => Promise<{ success: boolean; message: string; data?: unknown }>
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  connections: [],
  activeConnectionId: null,
  loading: false,
  error: null,

  fetchConnections: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch("/api/connections")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      set({ connections: data, loading: false })
    } catch (error) {
      set({ error: "Kon verbindingen niet laden", loading: false })
    }
  },

  fetchActiveConnection: async () => {
    try {
      const res = await fetch("/api/connections/activate")
      if (res.ok) {
        const data = await res.json()
        if (data.activeConnectionId) {
          set({ activeConnectionId: data.activeConnectionId })
        }
      }
    } catch {
      // silent
    }
  },

  addConnection: async (data) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Onbekende fout" }))
        throw new Error(err.error || `HTTP ${res.status}`)
      }
      await get().fetchConnections()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Fout bij aanmaken", loading: false })
      throw error
    }
  },

  updateConnection: async (data) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch("/api/connections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Verbinding bijwerken mislukt")
      await get().fetchConnections()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Fout", loading: false })
    }
  },

  deleteConnection: async (id) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`/api/connections?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Verbinding verwijderen mislukt")
      const state = get()
      if (state.activeConnectionId === id) {
        set({ activeConnectionId: null })
      }
      await get().fetchConnections()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Fout", loading: false })
    }
  },

  setActiveConnection: async (id) => {
    try {
      const res = await fetch("/api/connections/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: id }),
      })
      if (!res.ok) throw new Error("Activering mislukt")
      set({ activeConnectionId: id })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Fout" })
    }
  },

  testConnection: async (data) => {
    try {
      const res = await fetch("/api/connections/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      // Als de HTTP status niet OK is maar we toch een JSON response hebben,
      // return de response (bevat success: false + message)
      return json
    } catch {
      return { success: false, message: "Verbindingstest mislukt - netwerk fout" }
    }
  },
}))
