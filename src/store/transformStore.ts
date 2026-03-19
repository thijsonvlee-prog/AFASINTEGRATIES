"use client"

import { create } from "zustand"
import type { TransformStep, FieldMapping } from "@/types"
import { v4 as uuidv4 } from "uuid"

interface TransformState {
  steps: TransformStep[]
  fieldMappings: FieldMapping[]
  previewData: Record<string, unknown>[]
  addStep: (type: TransformStep["type"], config: TransformStep["config"]) => void
  updateStep: (id: string, config: TransformStep["config"]) => void
  removeStep: (id: string) => void
  reorderSteps: (fromIndex: number, toIndex: number) => void
  setFieldMappings: (mappings: FieldMapping[]) => void
  setPreviewData: (data: Record<string, unknown>[]) => void
  setSteps: (steps: TransformStep[]) => void
  clear: () => void
}

export const useTransformStore = create<TransformState>((set, get) => ({
  steps: [],
  fieldMappings: [],
  previewData: [],

  addStep: (type, config) => {
    const steps = [...get().steps, { id: uuidv4(), type, config }]
    set({ steps })
  },

  updateStep: (id, config) => {
    const steps = get().steps.map((s) => (s.id === id ? { ...s, config } : s))
    set({ steps })
  },

  removeStep: (id) => {
    const steps = get().steps.filter((s) => s.id !== id)
    set({ steps })
  },

  reorderSteps: (fromIndex, toIndex) => {
    const steps = [...get().steps]
    const [removed] = steps.splice(fromIndex, 1)
    steps.splice(toIndex, 0, removed)
    set({ steps })
  },

  setFieldMappings: (mappings) => set({ fieldMappings: mappings }),
  setPreviewData: (data) => set({ previewData: data }),
  setSteps: (steps) => set({ steps }),
  clear: () => set({ steps: [], fieldMappings: [], previewData: [] }),
}))
