import { put, get, list, del } from "@vercel/blob"

const BLOB_PREFIX = "afas-data/"

function blobPath(name: string): string {
  return `${BLOB_PREFIX}${name}.json`
}

export async function readData<T>(name: string, defaultValue: T): Promise<T> {
  try {
    const pathname = blobPath(name)
    const result = await get(pathname, { access: "private" })

    if (!result || result.statusCode !== 200 || !result.stream) {
      return defaultValue
    }

    // Stream uitlezen naar tekst
    const reader = result.stream.getReader()
    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    const text = new TextDecoder().decode(
      chunks.reduce((acc, chunk) => {
        const merged = new Uint8Array(acc.length + chunk.length)
        merged.set(acc)
        merged.set(chunk, acc.length)
        return merged
      }, new Uint8Array())
    )
    return JSON.parse(text) as T
  } catch (error) {
    // BlobNotFoundError = bestand bestaat nog niet, dat is normaal
    if (error instanceof Error && error.name === "BlobNotFoundError") {
      return defaultValue
    }
    console.error(`[Storage] Fout bij lezen ${name}:`, error)
    return defaultValue
  }
}

export async function writeData<T>(name: string, data: T): Promise<void> {
  const pathname = blobPath(name)
  try {
    // Verwijder bestaande blob als die er is
    try {
      const { blobs } = await list({ prefix: pathname })
      const existing = blobs.find((b) => b.pathname === pathname)
      if (existing) {
        await del(existing.url)
      }
    } catch {
      // Geen bestaande blob, doorgaan
    }

    await put(pathname, JSON.stringify(data, null, 2), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
    })
    console.log(`[Storage] ${name} opgeslagen in Vercel Blob`)
  } catch (error) {
    console.error(`[Storage] Fout bij schrijven ${name}:`, error)
    throw new Error(
      `Kan data niet opslaan: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
