import type { FilterRule, EnvironmentType } from "@/types"

const BASE_URLS: Record<EnvironmentType, string> = {
  production: "rest.afas.online",
  test: "resttest.afas.online",
  accept: "restaccept.afas.online",
}

function encodeToken(token: string): string {
  // AFAS verwacht: Authorization: AfasToken <base64-encoded-xml-token>
  // Het token is XML: <token><version>1</version><data>...</data></token>
  // Als het al base64 is (geen XML-tags), neem het direct over.
  // Anders: base64-encode het.
  const trimmed = token.trim()
  if (trimmed.startsWith("<token>") || trimmed.startsWith("<Token>")) {
    // Raw XML token — base64 encode het
    return Buffer.from(trimmed).toString("base64")
  }
  // Het token is waarschijnlijk al base64-encoded, gebruik het direct
  return trimmed
}

export class AfasClient {
  private baseUrl: string
  private authHeader: string

  constructor(environmentNumber: string, token: string, environmentType: EnvironmentType = "production") {
    const domain = BASE_URLS[environmentType]
    this.baseUrl = `https://${environmentNumber}.${domain}/profitrestservices`
    this.authHeader = `AfasToken ${encodeToken(token)}`
  }

  private async request(path: string, options: RequestInit = {}): Promise<{ status: number; data: unknown }> {
    const url = `${this.baseUrl}${path}`

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.authHeader,
        ...options.headers,
      },
    })

    const text = await response.text()
    let data: unknown
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
