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
      <div className="p-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
            <Zap className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-tight">AFAS Integratie</h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-semibold">Platform</p>
          </div>
        </div>
      </div>

      <div className="px-4 mb-3">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <nav className="flex-1 px-3 space-y-1">
        <p className="px-3 py-2 text-[9px] uppercase tracking-[0.2em] text-white/25 font-bold">Navigatie</p>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-300",
                active
                  ? "bg-gradient-to-r from-white/15 to-white/5 text-white shadow-sm backdrop-blur-sm"
                  : "text-white/40 hover:bg-white/[0.06] hover:text-white/80"
              )}
            >
              <Icon className={cn("h-4 w-4 transition-colors", active ? "text-violet-400" : "")} />
              {item.label}
              {active && (
                <div className="ml-auto flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-violet-400 opacity-50" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-400" />
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 mx-3 mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hidden md:block">
        <p className="text-[10px] text-white/25 leading-relaxed font-medium">
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
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#07070a] border-b border-white/[0.06] flex items-center h-14 px-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 -ml-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.06] transition-all"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="flex items-center gap-2 ml-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
            <Zap className="h-3 w-3 text-white" />
          </div>
          <h1 className="text-sm font-extrabold text-white">AFAS Integratie</h1>
        </div>
      </div>

      {/* Mobiele overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/70 backdrop-blur-md"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobiele sidebar */}
      <aside
        className={cn(
          "md:hidden fixed top-14 left-0 bottom-0 z-30 w-64 bg-[#07070a] flex flex-col transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[260px] bg-[#07070a] flex-col shrink-0 border-r border-white/[0.04]">
        <NavContent />
      </aside>
    </>
  )
}
