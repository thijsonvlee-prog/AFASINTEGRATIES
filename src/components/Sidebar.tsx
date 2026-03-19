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
  Zap,
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
      <div className="p-5 md:p-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <Zap className="h-4.5 w-4.5 text-violet-300" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">AFAS Integratie</h1>
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-medium">Platform</p>
          </div>
        </div>
      </div>

      <div className="px-3 mb-2">
        <div className="h-px bg-white/10" />
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        <p className="px-3 py-2 text-[10px] uppercase tracking-widest text-white/30 font-semibold">Navigatie</p>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/60 hover:bg-white/8 hover:text-white/90"
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-violet-300" : "")} />
              {item.label}
              {active && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 mx-3 mb-3 rounded-lg bg-white/5 hidden md:block">
        <p className="text-[11px] text-white/40 leading-relaxed">
          AFAS REST API<br />Integratieplatform v1.0
        </p>
      </div>
    </>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobiele header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-sidebar border-b border-white/10 flex items-center h-14 px-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 -ml-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="flex items-center gap-2 ml-3">
          <Zap className="h-4 w-4 text-violet-300" />
          <h1 className="text-sm font-bold text-white">AFAS Integratie</h1>
        </div>
      </div>

      {/* Mobiele overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobiele sidebar */}
      <aside
        className={cn(
          "md:hidden fixed top-14 left-0 bottom-0 z-30 w-64 bg-sidebar flex flex-col transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-sidebar flex-col shrink-0">
        <NavContent />
      </aside>
    </>
  )
}
