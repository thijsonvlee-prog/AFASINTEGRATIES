"use client"

import { create } from "zustand"
import { apiFetch } from "@/lib/apiFetch"
import type { ConnectorMeta, GetConnectorField, FilterRule, SortRule } from "@/types"

interface ConnectorState {
  getConnectors: ConnectorMeta[]
  updateConnectors: ConnectorMeta[]
  selectedGetConnector: string | null
  getConnectorFields: GetConnectorField[]
  connectorData: Record<string, unknown>[]
  totalRows: number
  filters: FilterRule[]
  sortFields: SortRule[]
  skip: number
  take: number
  loading: boolean
  error: string | null
  fetchMetaInfo: (connectionId: string) => Promise<void>
  fetchGetConnectorFields: (connectionId: string, connectorName: string) => Promise<void>
  fetchConnectorData: (connectionId: string, connectorName: string) => Promise<void>
  setSelectedGetConnector: (name: string | null) => void
  setFilters: (filters: FilterRule[]) => void
  setSortFields: (fields: SortRule[]) => void
  setSkip: (skip: number) => void
  setTake: (take: number) => void
}

export const useConnectorStore = create<ConnectorState>((set, get) => ({
  getConnectors: [],
  updateConnectors: [],
  selectedGetConnector: null,
  getConnectorFields: [],
  connectorData: [],
  totalRows: 0,
  filters: [],
  sortFields: [],
  skip: 0,
  take: 100,
  loading: false,
  error: null,

  fetchMetaInfo: async (connectionId) => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<Record<string, unknown>>("/api/afas/metainfo", {
        headers: { "x-connection-id": connectionId },
      })
      if (!res.ok) {
        const err = res.data as unknown as Record<string, string>
        throw new Error(err?.error || "MetaInfo ophalen mislukt")
      }
      set({
        getConnectors: (res.data.getConnectors || res.data.GetConnectors || []) as ConnectorMeta[],
        updateConnectors: (res.data.updateConnectors || res.data.UpdateConnectors || []) as ConnectorMeta[],
        loading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fout"
      console.error("[ConnectorStore] fetchMetaInfo mislukt:", message)
      set({ error: message, loading: false })
    }
  },

  fetchGetConnectorFields: async (connectionId, connectorName) => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<Record<string, unknown>>(`/api/afas/metainfo/get/${encodeURIComponent(connectorName)}`, {
        headers: { "x-connection-id": connectionId },
      })
      if (!res.ok) {
        const err = res.data as unknown as Record<string, string>
        throw new Error(err?.error || "Connector velden ophalen mislukt")
      }
      set({ getConnectorFields: (res.data.fields || res.data.Fields || []) as GetConnectorField[], loading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fout"
      console.error("[ConnectorStore] fetchGetConnectorFields mislukt:", message)
      set({ error: message, loading: false })
    }
  },

  fetchConnectorData: async (connectionId, connectorName) => {
    const state = get()
    set({ loading: true, error: null })
    try {
      const params = new URLSearchParams()
      params.set("skip", String(state.skip))
      params.set("take", String(state.take))

      if (state.filters.length > 0) {
        params.set("filterjson", JSON.stringify({ filters: state.filters }))
      }

      if (state.sortFields.length > 0) {
        params.set(
          "orderbyfieldids",
          state.sortFields.map((s) => `${s.order === "DESC" ? "-" : ""}${s.fieldId}`).join(",")
        )
      }

      const res = await apiFetch<Record<string, unknown>>(
        `/api/afas/connectors/${encodeURIComponent(connectorName)}?${params.toString()}`,
        { headers: { "x-connection-id": connectionId } }
      )
      if (!res.ok) {
        const err = res.data as unknown as Record<string, string>
        throw new Error(err?.error || "Data ophalen mislukt")
      }
      const rows = (res.data.rows || res.data.Rows || []) as Record<string, unknown>[]
      set({
        connectorData: rows,
        totalRows: rows.length,
        loading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fout"
      console.error("[ConnectorStore] fetchConnectorData mislukt:", message)
      set({ error: message, loading: false })
    }
  },

  setSelectedGetConnector: (name) => set({ selectedGetConnector: name, connectorData: [], getConnectorFields: [] }),
  setFilters: (filters) => set({ filters }),
  setSortFields: (fields) => set({ sortFields: fields }),
  setSkip: (skip) => set({ skip }),
  setTake: (take) => set({ take }),
}))
