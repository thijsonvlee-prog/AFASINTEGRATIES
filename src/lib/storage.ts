import fs from "fs"
import path from "path"

function getDataDir(): string {
  // In serverless/cloud omgevingen (Vercel, AWS Lambda) is process.cwd() read-only.
  // /tmp is altijd schrijfbaar. Bij lokale dev werkt process.cwd()/data ook.
  const cwdData = path.join(process.cwd(), "data")
  try {
    // Probeer eerst de project-directory (werkt lokaal)
    if (fs.existsSync(cwdData)) {
      // Test of we kunnen schrijven
      fs.accessSync(cwdData, fs.constants.W_OK)
      return cwdData
    }
    // Map bestaat niet — probeer aan te maken
    fs.mkdirSync(cwdData, { recursive: true })
    return cwdData
  } catch {
    // Fallback naar /tmp/afas-data (serverless/cloud)
    const tmpData = path.join("/tmp", "afas-data")
    if (!fs.existsSync(tmpData)) {
      fs.mkdirSync(tmpData, { recursive: true })
    }
    console.log(`[Storage] Gebruik /tmp/afas-data (${cwdData} is niet schrijfbaar)`)
    return tmpData
  }
}

// Cache de data directory zodat we niet elke keer opnieuw checken
let _dataDir: string | null = null
function getDir(): string {
  if (!_dataDir) {
    _dataDir = getDataDir()
  }
  return _dataDir
}

function getFilePath(name: string) {
  return path.join(getDir(), `${name}.json`)
}

export function readData<T>(name: string, defaultValue: T): T {
  const filePath = getFilePath(name)
  if (!fs.existsSync(filePath)) {
    return defaultValue
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(raw)
  } catch (error) {
    console.error(`[Storage] Fout bij lezen ${name}:`, error)
    return defaultValue
  }
}

export function writeData<T>(name: string, data: T): void {
  const filePath = getFilePath(name)
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
  } catch (error) {
    console.error(`[Storage] Fout bij schrijven ${name} naar ${filePath}:`, error)
    throw new Error(`Kan data niet opslaan: ${error instanceof Error ? error.message : String(error)}`)
  }
}
