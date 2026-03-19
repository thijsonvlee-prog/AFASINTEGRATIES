"use client"

import { create } from "zustand"
import { apiFetch } from "@/lib/apiFetch"
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
      const res = await apiFetch<ConnectionProfilePublic[]>("/api/connections")
      if (!res.ok) {
        const err = res.data as unknown as Record<string, string>
        throw new Error(err?.error || `HTTP ${res.status}`)
      }
      set({ connections: res.data, loading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Onbekende fout"
      console.error("[ConnectionStore] fetchConnections mislukt:", message)
      set({ error: `Kon verbindingen niet laden: ${message}`, loading: false })
    }
  },

  fetchActiveConnection: async () => {
    try {
      const res = await apiFetch<{ activeConnectionId?: string }>("/api/connections/activate")
      if (res.ok && res.data?.activeConnectionId) {
        set({ activeConnectionId: res.data.activeConnectionId })
      }
    } catch (error) {
      console.error("[ConnectionStore] fetchActiveConnection mislukt:", error)
    }
  },

  addConnection: async (data) => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = res.data as unknown as Record<string, string>
        const errorMsg = err?.details
          ? `${err.error}: ${err.details}`
          : err?.error || `Server fout (HTTP ${res.status})`
        throw new Error(errorMsg)
      }

      // POST geslaagd - haal de lijst opnieuw op
      try {
        await get().fetchConnections()
      } catch {
        console.warn("[ConnectionStore] fetchConnections na POST mislukt, maar verbinding is opgeslagen")
        set({ loading: false })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Onbekende fout bij opslaan"
      console.error("[ConnectionStore] addConnection mislukt:", message)
      set({ error: message, loading: false })
      throw error
    }
  },

  updateConnection: async (data) => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch("/api/connections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = res.data as unknown as Record<string, string>
        throw new Error(err?.error || "Verbinding bijwerken mislukt")
      }
      await get().fetchConnections()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fout bij bijwerken"
      console.error("[ConnectionStore] updateConnection mislukt:", message)
      set({ error: message, loading: false })
    }
  },

  deleteConnection: async (id) => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch(`/api/connections?id=${id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = res.data as unknown as Record<string, string>
        throw new Error(err?.error || "Verbinding verwijderen mislukt")
      }
      const state = get()
      if (state.activeConnectionId === id) {
        set({ activeConnectionId: null })
      }
      await get().fetchConnections()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fout bij verwijderen"
      console.error("[ConnectionStore] deleteConnection mislukt:", message)
      set({ error: message, loading: false })
    }
  },

  setActiveConnection: async (id) => {
    try {
      const res = await apiFetch("/api/connections/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: id }),
      })
      if (!res.ok) {
        const err = res.data as unknown as Record<string, string>
        throw new Error(err?.error || "Activering mislukt")
      }
      set({ activeConnectionId: id })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fout bij activeren"
      console.error("[ConnectionStore] setActiveConnection mislukt:", message)
      set({ error: message })
    }
  },

  testConnection: async (data) => {
    try {
      const res = await apiFetch<{ success: boolean; message: string; data?: unknown }>("/api/connections/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return res.data
    } catch (error) {
      console.error("[ConnectionStore] testConnection mislukt:", error)
      return { success: false, message: "Verbindingstest mislukt - netwerk fout" }
    }
  },
}))
