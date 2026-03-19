"use client"

import { create } from "zustand"
import { apiFetch } from "@/lib/apiFetch"
import type { Pipeline, PipelineExecution } from "@/types"

interface PipelineState {
  pipelines: Pipeline[]
  executions: Record<string, PipelineExecution[]>
  loading: boolean
  error: string | null
  fetchPipelines: () => Promise<void>
  createPipeline: (pipeline: Partial<Pipeline>) => Promise<Pipeline | null>
  updatePipeline: (pipeline: Partial<Pipeline> & { id: string }) => Promise<void>
  deletePipeline: (id: string) => Promise<void>
  executePipeline: (id: string, dryRun?: boolean) => Promise<{ execution: PipelineExecution; preview?: unknown[]; totalRecords?: number } | null>
  fetchExecutionLog: (pipelineId: string) => Promise<void>
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  pipelines: [],
  executions: {},
  loading: false,
  error: null,

  fetchPipelines: async () => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<Pipeline[]>("/api/pipelines")
      if (!res.ok) {
        throw new Error("Pipelines laden mislukt")
      }
      set({ pipelines: res.data, loading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fout"
      console.error("[PipelineStore] fetchPipelines mislukt:", message)
      set({ error: message, loading: false })
    }
  },

  createPipeline: async (pipeline) => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<Pipeline>("/api/pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pipeline),
      })
      if (!res.ok) {
        const err = res.data as unknown as Record<string, string>
        throw new Error(err?.error || "Pipeline aanmaken mislukt")
      }
      await get().fetchPipelines()
      set({ loading: false })
      return res.data
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fout"
      console.error("[PipelineStore] createPipeline mislukt:", message)
      set({ error: message, loading: false })
      return null
    }
  },

  updatePipeline: async (pipeline) => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch("/api/pipelines", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pipeline),
      })
      if (!res.ok) throw new Error("Pipeline bijwerken mislukt")
      await get().fetchPipelines()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fout"
      console.error("[PipelineStore] updatePipeline mislukt:", message)
      set({ error: message, loading: false })
    }
  },

  deletePipeline: async (id) => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch(`/api/pipelines?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Pipeline verwijderen mislukt")
      await get().fetchPipelines()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fout"
      console.error("[PipelineStore] deletePipeline mislukt:", message)
      set({ error: message, loading: false })
    }
  },

  executePipeline: async (id, dryRun = false) => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<{ execution: PipelineExecution; preview?: unknown[]; totalRecords?: number }>(`/api/pipelines/${id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun }),
      })
      set({ loading: false })
      return res.data
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fout"
      console.error("[PipelineStore] executePipeline mislukt:", message)
      set({ error: message, loading: false })
      return null
    }
  },

  fetchExecutionLog: async (pipelineId) => {
    try {
      const res = await apiFetch<PipelineExecution[]>(`/api/pipelines/${pipelineId}/log`)
      if (res.ok) {
        set((state) => ({
          executions: { ...state.executions, [pipelineId]: res.data },
        }))
      }
    } catch (error) {
      console.error("[PipelineStore] fetchExecutionLog mislukt:", error)
    }
  },
}))
