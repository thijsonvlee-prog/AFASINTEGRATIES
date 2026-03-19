"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/cn"
import {
  Plug,
  Search,
  Shuffle,
  Upload,
  GitBranch,
  LayoutDashboard,
} from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/connections", label: "Verbindingen", icon: Plug },
  { href: "/explorer", label: "GetConnector", icon: Search },
  { href: "/transform", label: "Transformatie", icon: Shuffle },
  { href: "/update", label: "UpdateConnector", icon: Upload },
  { href: "/pipelines", label: "Pipelines", icon: GitBranch },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-muted/30 flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-primary">AFAS Integratie</h1>
        <p className="text-xs text-muted-foreground mt-1">Connectoren Platform</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t">
        <p className="text-xs text-muted-foreground">
          AFAS REST API Integratieplatform
        </p>
      </div>
    </aside>
  )
}
