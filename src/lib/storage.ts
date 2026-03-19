import { put, list, del } from "@vercel/blob"

const BLOB_PREFIX = "afas-data/"

function blobPath(name: string): string {
  return `${BLOB_PREFIX}${name}.json`
}

export async function readData<T>(name: string, defaultValue: T): Promise<T> {
  try {
    // Zoek het bestand in de blob store
    const { blobs } = await list({ prefix: blobPath(name) })
    const match = blobs.find((b) => b.pathname === blobPath(name))
    if (!match) {
      return defaultValue
    }
    const res = await fetch(match.url)
    if (!res.ok) {
      console.error(`[Storage] Blob fetch mislukt voor ${name}: ${res.status}`)
      return defaultValue
    }
    const data = await res.json()
    return data as T
  } catch (error) {
    console.error(`[Storage] Fout bij lezen ${name}:`, error)
    return defaultValue
  }
}

export async function writeData<T>(name: string, data: T): Promise<void> {
  const pathname = blobPath(name)
  try {
    // Verwijder bestaande blob als die er is (put met zelfde pathname overschrijft niet altijd)
    const { blobs } = await list({ prefix: pathname })
    const existing = blobs.find((b) => b.pathname === pathname)
    if (existing) {
      await del(existing.url)
    }

    await put(pathname, JSON.stringify(data, null, 2), {
      access: "public",
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
