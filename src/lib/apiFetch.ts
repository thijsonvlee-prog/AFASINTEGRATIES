"use client"

import { useLogStore } from "@/store/logStore"

export interface ApiResponse<T = unknown> {
  ok: boolean
  status: number
  data: T
}

/**
 * Wrapper rond fetch die automatisch naar de API log store logt.
 * Retourneert een geparsed ApiResponse zodat callers niet opnieuw .json() hoeven te callen.
 */
export async function apiFetch<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const method = options?.method || "GET"
  const start = performance.now()

  let requestBody: unknown = undefined
  if (options?.body && typeof options.body === "string") {
    try {
      requestBody = JSON.parse(options.body)
    } catch {
      requestBody = options.body
    }
  }

  try {
    const res = await fetch(url, options)
    const duration = Math.round(performance.now() - start)

    let data: T
    try {
      data = await res.json()
    } catch {
      data = (null as unknown) as T
    }

    useLogStore.getState().addLog({
      method,
      url,
      requestBody,
      responseStatus: res.status,
      responseBody: data,
      duration,
    })

    if (!res.ok) {
      console.error(`[API ${method} ${url}] HTTP ${res.status}:`, data)
    }

    return { ok: res.ok, status: res.status, data }
  } catch (error) {
    const duration = Math.round(performance.now() - start)

    const errorData = {
      error: "Network error",
      message: error instanceof Error ? error.message : String(error),
    }

    useLogStore.getState().addLog({
      method,
      url,
      requestBody,
      responseStatus: 0,
      responseBody: errorData,
      duration,
    })

    console.error(`[API ${method} ${url}] Network error:`, error)
    throw error
  }
}
