"use client"

import { create } from "zustand"
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
      const res = await fetch("/api/afas/metainfo", {
        headers: { "x-connection-id": connectionId },
      })
      if (!res.ok) throw new Error("MetaInfo ophalen mislukt")
      const data = await res.json()
      set({
        getConnectors: data.getConnectors || data.GetConnectors || [],
        updateConnectors: data.updateConnectors || data.UpdateConnectors || [],
        loading: false,
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Fout", loading: false })
    }
  },

  fetchGetConnectorFields: async (connectionId, connectorName) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`/api/afas/metainfo/get/${encodeURIComponent(connectorName)}`, {
        headers: { "x-connection-id": connectionId },
      })
      if (!res.ok) throw new Error("Connector velden ophalen mislukt")
      const data = await res.json()
      set({ getConnectorFields: data.fields || data.Fields || [], loading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Fout", loading: false })
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

      const res = await fetch(
        `/api/afas/connectors/${encodeURIComponent(connectorName)}?${params.toString()}`,
        { headers: { "x-connection-id": connectionId } }
      )
      if (!res.ok) throw new Error("Data ophalen mislukt")
      const data = await res.json()
      set({
        connectorData: data.rows || data.Rows || [],
        totalRows: data.rows?.length || data.Rows?.length || 0,
        loading: false,
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Fout", loading: false })
    }
  },

  setSelectedGetConnector: (name) => set({ selectedGetConnector: name, connectorData: [], getConnectorFields: [] }),
  setFilters: (filters) => set({ filters }),
  setSortFields: (fields) => set({ sortFields: fields }),
  setSkip: (skip) => set({ skip }),
  setTake: (take) => set({ take }),
}))
