import fs from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function getFilePath(name: string) {
  return path.join(DATA_DIR, `${name}.json`)
}

export function readData<T>(name: string, defaultValue: T): T {
  ensureDir()
  const filePath = getFilePath(name)
  if (!fs.existsSync(filePath)) {
    return defaultValue
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(raw)
  } catch {
    return defaultValue
  }
}

export function writeData<T>(name: string, data: T): void {
  ensureDir()
  const filePath = getFilePath(name)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
}
