"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import type { FilterRule, FilterOperator, GetConnectorField } from "@/types"
import { FILTER_OPERATORS } from "@/types"
import { v4 as uuidv4 } from "uuid"

interface FilterBuilderProps {
  filters: FilterRule[]
  fields: GetConnectorField[]
  onChange: (filters: FilterRule[]) => void
}

export function FilterBuilder({ filters, fields, onChange }: FilterBuilderProps) {
  const addFilter = () => {
    onChange([
      ...filters,
      {
        id: uuidv4(),
        fieldId: fields[0]?.fieldId || "",
        operator: 1 as FilterOperator,
        value: "",
      },
    ])
  }

  const updateFilter = (index: number, updates: Partial<FilterRule>) => {
    const updated = filters.map((f, i) => (i === index ? { ...f, ...updates } : f))
    onChange(updated)
  }

  const removeFilter = (index: number) => {
    onChange(filters.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Filters</h4>
        <Button size="sm" variant="outline" onClick={addFilter}>
          <Plus className="mr-1 h-3 w-3" /> Filter toevoegen
        </Button>
      </div>

      {filters.length === 0 && (
        <p className="text-sm text-muted-foreground">Geen filters ingesteld</p>
      )}

      {filters.map((filter, index) => (
        <div key={filter.id} className="flex items-center gap-2">
          <Select
            value={filter.fieldId}
            onValueChange={(val) => updateFilter(index, { fieldId: val })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Veld" />
            </SelectTrigger>
            <SelectContent>
              {fields.map((field) => (
                <SelectItem key={field.fieldId} value={field.fieldId}>
                  {field.label || field.fieldId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(filter.operator)}
            onValueChange={(val) =>
              updateFilter(index, { operator: parseInt(val) as FilterOperator })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Operator" />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPERATORS.map((op) => (
                <SelectItem key={op.value} value={String(op.value)}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            className="flex-1"
            placeholder="Waarde"
            value={filter.value}
            onChange={(e) => updateFilter(index, { value: e.target.value })}
          />

          <Button size="icon" variant="ghost" onClick={() => removeFilter(index)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  )
}
