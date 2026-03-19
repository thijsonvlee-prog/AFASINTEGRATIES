export interface ConnectionProfile {
  id: string
  name: string
  environmentNumber: string
  token: string // stored server-side only
  isProduction: boolean
  createdAt: string
  updatedAt: string
}

export interface ConnectionProfilePublic {
  id: string
  name: string
  environmentNumber: string
  isProduction: boolean
  createdAt: string
  updatedAt: string
}

export interface ConnectorMeta {
  id: string
  name: string
  description?: string
}

export interface MetaInfoResponse {
  getConnectors: ConnectorMeta[]
  updateConnectors: ConnectorMeta[]
}

export interface GetConnectorField {
  id: string
  fieldId: string
  label: string
  dataType: string
  length?: number
  decimals?: number
  controlType?: number
}

export interface UpdateConnectorSchema {
  name: string
  description?: string
  fields: UpdateConnectorField[]
  objects?: UpdateConnectorObject[]
}

export interface UpdateConnectorField {
  fieldId: string
  label: string
  dataType: string
  mandatory: boolean
  length?: number
  decimals?: number
  values?: { id: string; description: string }[]
}

export interface UpdateConnectorObject {
  name: string
  fields: UpdateConnectorField[]
  objects?: UpdateConnectorObject[]
}

export interface FilterRule {
  id: string
  fieldId: string
  operator: FilterOperator
  value: string
}

export type FilterOperator =
  | 1  // Equal
  | 2  // LargerOrEqual
  | 3  // SmallerOrEqual
  | 4  // LargerThan
  | 5  // SmallerThan
  | 6  // Contains
  | 7  // NotEqual
  | 8  // Empty
  | 9  // NotEmpty
  | 10 // StartsWith
  | 11 // NotContains
  | 12 // EndsWith
  | 13 // QuickFilter

export const FILTER_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 1, label: "Gelijk aan" },
  { value: 2, label: "Groter of gelijk" },
  { value: 3, label: "Kleiner of gelijk" },
  { value: 4, label: "Groter dan" },
  { value: 5, label: "Kleiner dan" },
  { value: 6, label: "Bevat" },
  { value: 7, label: "Niet gelijk aan" },
  { value: 8, label: "Leeg" },
  { value: 9, label: "Niet leeg" },
  { value: 10, label: "Begint met" },
  { value: 11, label: "Bevat niet" },
  { value: 12, label: "Eindigt met" },
]

export interface SortRule {
  fieldId: string
  order: "ASC" | "DESC"
}

export interface GetConnectorRequest {
  connectorName: string
  skip?: number
  take?: number
  filters?: FilterRule[]
  sortFields?: SortRule[]
}

export interface TransformStep {
  id: string
  type: "rename" | "formula" | "filter" | "calculated" | "join"
  config: RenameConfig | FormulaConfig | FilterConfig | CalculatedConfig | JoinConfig
}

export interface RenameConfig {
  mappings: { from: string; to: string }[]
}

export interface FormulaConfig {
  field: string
  expression: string // e.g. "value * 1.21"
}

export interface FilterConfig {
  field: string
  operator: string
  value: string
}

export interface CalculatedConfig {
  newField: string
  expression: string // e.g. "row.aantal * row.prijs"
}

export interface JoinConfig {
  sourceConnector: string
  joinField: string
  targetField: string
  connectionId?: string
}

export interface FieldMapping {
  sourceField: string
  targetField: string
}

export interface Pipeline {
  id: string
  name: string
  description?: string
  connectionId: string
  getConnector: {
    name: string
    filters: FilterRule[]
    sortFields: SortRule[]
    take: number
  }
  transformSteps: TransformStep[]
  updateConnector: {
    name: string
    operation: "POST" | "PUT" | "DELETE"
    fieldMappings: FieldMapping[]
  }
  schedule?: {
    enabled: boolean
    intervalMinutes?: number
    cronExpression?: string
  }
  createdAt: string
  updatedAt: string
}

export interface PipelineExecution {
  id: string
  pipelineId: string
  status: "running" | "success" | "error"
  startedAt: string
  completedAt?: string
  recordsProcessed: number
  recordsFailed: number
  error?: string
  logs: ExecutionLogEntry[]
}

export interface ExecutionLogEntry {
  timestamp: string
  level: "info" | "warn" | "error"
  message: string
  details?: unknown
}

export interface ApiLogEntry {
  id: string
  timestamp: string
  method: string
  url: string
  requestBody?: unknown
  responseStatus: number
  responseBody?: unknown
  duration: number
}

export interface AfasError {
  externalMessage: string
  errorNumber?: number
  internalMessage?: string
}
