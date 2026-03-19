import type {
  TransformStep,
  RenameConfig,
  FormulaConfig,
  FilterConfig,
  CalculatedConfig,
} from "@/types"

type Row = Record<string, unknown>

export function applyTransformations(data: Row[], steps: TransformStep[]): Row[] {
  let result = [...data.map((r) => ({ ...r }))]

  for (const step of steps) {
    switch (step.type) {
      case "rename":
        result = applyRename(result, step.config as RenameConfig)
        break
      case "formula":
        result = applyFormula(result, step.config as FormulaConfig)
        break
      case "filter":
        result = applyFilter(result, step.config as FilterConfig)
        break
      case "calculated":
        result = applyCalculated(result, step.config as CalculatedConfig)
        break
      case "join":
        // Join is handled separately as it needs external data
        break
    }
  }

  return result
}

function applyRename(data: Row[], config: RenameConfig): Row[] {
  return data.map((row) => {
    const newRow: Row = {}
    for (const [key, value] of Object.entries(row)) {
      const mapping = config.mappings.find((m) => m.from === key)
      newRow[mapping ? mapping.to : key] = value
    }
    return newRow
  })
}

function applyFormula(data: Row[], config: FormulaConfig): Row[] {
  return data.map((row) => {
    const newRow = { ...row }
    try {
      const value = row[config.field]
      // Safe evaluation of simple math expressions
      const result = evaluateExpression(config.expression, { value, row })
      newRow[config.field] = result
    } catch {
      // Keep original value on error
    }
    return newRow
  })
}

function applyFilter(data: Row[], config: FilterConfig): Row[] {
  return data.filter((row) => {
    const value = row[config.field]
    const filterValue = config.value

    switch (config.operator) {
      case "equals":
        return String(value) === filterValue
      case "not_equals":
        return String(value) !== filterValue
      case "greater_than":
        return Number(value) > Number(filterValue)
      case "less_than":
        return Number(value) < Number(filterValue)
      case "contains":
        return String(value).toLowerCase().includes(filterValue.toLowerCase())
      case "not_empty":
        return value !== null && value !== undefined && value !== ""
      case "empty":
        return value === null || value === undefined || value === ""
      default:
        return true
    }
  })
}

function applyCalculated(data: Row[], config: CalculatedConfig): Row[] {
  return data.map((row) => {
    const newRow = { ...row }
    try {
      const result = evaluateExpression(config.expression, { row })
      newRow[config.newField] = result
    } catch {
      newRow[config.newField] = null
    }
    return newRow
  })
}

function evaluateExpression(
  expression: string,
  context: { value?: unknown; row?: Row }
): unknown {
  // Allow only safe operations: numbers, basic math, field references
  const sanitized = expression.replace(/[^a-zA-Z0-9_.+\-*/() ]/g, "")

  // Replace row.fieldName references with actual values
  let processed = sanitized
  if (context.row) {
    for (const [key, val] of Object.entries(context.row)) {
      const regex = new RegExp(`row\\.${key}`, "g")
      processed = processed.replace(regex, typeof val === "number" ? String(val) : `0`)
    }
  }

  // Replace "value" with the actual value
  if (context.value !== undefined) {
    processed = processed.replace(
      /\bvalue\b/g,
      typeof context.value === "number" ? String(context.value) : "0"
    )
  }

  // Evaluate the math expression safely using Function constructor
  // Only allow numeric operations
  if (!/^[0-9+\-*/.()\s]+$/.test(processed)) {
    throw new Error("Invalid expression")
  }

  const fn = new Function(`return (${processed})`)
  return fn()
}
