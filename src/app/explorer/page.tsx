"use client"

import { ConnectorExplorer } from "@/components/ConnectorExplorer"
import { ApiLogViewer } from "@/components/ApiLogViewer"

export default function ExplorerPage() {
  return (
    <div className="space-y-6">
      <ConnectorExplorer />
      <ApiLogViewer />
    </div>
  )
}
