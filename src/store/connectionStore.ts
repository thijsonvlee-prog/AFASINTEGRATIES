"use client"

import { create } from "zustand"
import type { ConnectionProfilePublic } from "@/types"

interface ConnectionState {
  connections: ConnectionProfilePublic[]
  activeConnectionId: string | null
  loading: boolean
  error: string | null
  fetchConnections: () => Promise<void>
  addConnection: (data: { name: string; environmentNumber: string; token: string; isProduction: boolean }) => Promise<void>
  updateConnection: (data: { id: string; name?: string; environmentNumber?: string; token?: string; isProduction?: boolean }) => Promise<void>
  deleteConnection: (id: string) => Promise<void>
  setActiveConnection: (id: string) => Promise<void>
  testConnection: (data: { environmentNumber: string; token: string } | { connectionId: string }) => Promise<{ success: boolean; message: string; data?: unknown }>
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
      const data = await res.json()
      set({ connections: data, loading: false })
    } catch (error) {
      set({ error: "Kon verbindingen niet laden", loading: false })
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
      if (!res.ok) throw new Error("Verbinding aanmaken mislukt")
      await get().fetchConnections()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Fout", loading: false })
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
      return await res.json()
    } catch {
      return { success: false, message: "Verbindingstest mislukt" }
    }
  },
}))
