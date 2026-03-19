import type { FilterRule } from "@/types"

export class AfasClient {
  private baseUrl: string
  private authHeader: string

  constructor(environmentNumber: string, token: string) {
    this.baseUrl = `https://${environmentNumber}.rest.afas.online/profitrestservices`
    this.authHeader = `AfasToken ${Buffer.from(token).toString("base64")}`
  }

  private async request(path: string, options: RequestInit = {}): Promise<{ status: number; data: unknown }> {
    const url = `${this.baseUrl}${path}`
    const startTime = Date.now()

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.authHeader,
        ...options.headers,
      },
    })

    const duration = Date.now() - startTime
    let data: unknown

    const text = await response.text()
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }

    return { status: response.status, data }
  }

  async getMetaInfo() {
    return this.request("/metainfo")
  }

  async getGetConnectorMeta(connectorName: string) {
    return this.request(`/metainfo/get/${encodeURIComponent(connectorName)}`)
  }

  async getUpdateConnectorMeta(connectorName: string) {
    return this.request(`/metainfo/update/${encodeURIComponent(connectorName)}`)
  }

  async getConnectorData(
    connectorName: string,
    params: {
      skip?: number
      take?: number
      filters?: FilterRule[]
      orderbyfieldids?: string
    } = {}
  ) {
    const searchParams = new URLSearchParams()

    if (params.skip !== undefined) searchParams.set("skip", String(params.skip))
    if (params.take !== undefined) searchParams.set("take", String(params.take))
    if (params.orderbyfieldids) searchParams.set("orderbyfieldids", params.orderbyfieldids)

    if (params.filters && params.filters.length > 0) {
      const filterJson = {
        Filters: {
          Filter: params.filters.map((f) => ({
            FilterId: f.id,
            Field: [
              {
                FieldId: f.fieldId,
                OperatorType: f.operator,
                Value: f.value,
              },
            ],
          })),
        },
      }
      searchParams.set("filterjson", JSON.stringify(filterJson))
    }

    const qs = searchParams.toString()
    const path = `/connectors/${encodeURIComponent(connectorName)}${qs ? `?${qs}` : ""}`
    return this.request(path)
  }

  async insertRecord(connectorName: string, body: unknown) {
    return this.request(`/connectors/${encodeURIComponent(connectorName)}`, {
      method: "POST",
      body: JSON.stringify(body),
    })
  }

  async updateRecord(connectorName: string, body: unknown) {
    return this.request(`/connectors/${encodeURIComponent(connectorName)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    })
  }

  async deleteRecord(connectorName: string, body: unknown) {
    return this.request(`/connectors/${encodeURIComponent(connectorName)}`, {
      method: "DELETE",
      body: JSON.stringify(body),
    })
  }
}
