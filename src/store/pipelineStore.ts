"use client"

import { create } from "zustand"
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
      const res = await fetch("/api/pipelines")
      const data = await res.json()
      set({ pipelines: data, loading: false })
    } catch {
      set({ error: "Pipelines laden mislukt", loading: false })
    }
  },

  createPipeline: async (pipeline) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch("/api/pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pipeline),
      })
      if (!res.ok) throw new Error("Pipeline aanmaken mislukt")
      const data = await res.json()
      await get().fetchPipelines()
      set({ loading: false })
      return data
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Fout", loading: false })
      return null
    }
  },

  updatePipeline: async (pipeline) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch("/api/pipelines", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pipeline),
      })
      if (!res.ok) throw new Error("Pipeline bijwerken mislukt")
      await get().fetchPipelines()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Fout", loading: false })
    }
  },

  deletePipeline: async (id) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`/api/pipelines?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Pipeline verwijderen mislukt")
      await get().fetchPipelines()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Fout", loading: false })
    }
  },

  executePipeline: async (id, dryRun = false) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`/api/pipelines/${id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun }),
      })
      const data = await res.json()
      set({ loading: false })
      return data
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Fout", loading: false })
      return null
    }
  },

  fetchExecutionLog: async (pipelineId) => {
    try {
      const res = await fetch(`/api/pipelines/${pipelineId}/log`)
      const data = await res.json()
      set((state) => ({
        executions: { ...state.executions, [pipelineId]: data },
      }))
    } catch {
      // silent fail
    }
  },
}))
