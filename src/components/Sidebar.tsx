"use client"

import React, { useState, useEffect } from "react"
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
  Menu,
  X,
} from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/connections", label: "Verbindingen", icon: Plug },
  { href: "/explorer", label: "GetConnector", icon: Search },
  { href: "/transform", label: "Transformatie", icon: Shuffle },
  { href: "/update", label: "UpdateConnector", icon: Upload },
  { href: "/pipelines", label: "Pipelines", icon: GitBranch },
]

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <>
      <div className="p-4 md:p-6 border-b">
        <h1 className="text-lg md:text-xl font-bold text-primary">AFAS Integratie</h1>
        <p className="text-xs text-muted-foreground mt-1">Connectoren Platform</p>
      </div>
      <nav className="flex-1 p-3 md:p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 md:py-2 text-sm font-medium transition-colors",
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
      <div className="p-4 border-t hidden md:block">
        <p className="text-xs text-muted-foreground">
          AFAS REST API Integratieplatform
        </p>
      </div>
    </>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Sluit menu bij route-wijziging
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobiele header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b flex items-center h-14 px-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 -ml-2 rounded-md hover:bg-muted"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <h1 className="ml-3 text-base font-bold text-primary">AFAS Integratie</h1>
      </div>

      {/* Mobiele overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobiele sidebar (slide-in) */}
      <aside
        className={cn(
          "md:hidden fixed top-14 left-0 bottom-0 z-30 w-64 bg-background border-r flex flex-col transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r bg-muted/30 flex-col shrink-0">
        <NavContent />
      </aside>
    </>
  )
}
