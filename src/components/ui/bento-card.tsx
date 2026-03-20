"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/cn"

interface BentoCardProps {
  span?: 1 | 2 | 3
  rowSpan?: 2
  glass?: "blue" | "violet" | "amber" | "emerald" | "red" | "white"
  noPadding?: boolean
  className?: string
  children?: React.ReactNode
}

const spanMap = {
  1: "bento-span-1",
  2: "bento-span-2",
  3: "bento-span-3",
}

const glassMap = {
  blue: "glass-blue",
  violet: "glass-violet",
  amber: "glass-amber",
  emerald: "glass-emerald",
  red: "glass-red",
  white: "glass-white",
}

export const bentoSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 24,
}

export function BentoCard({
  span = 1,
  rowSpan,
  glass,
  noPadding,
  className,
  children,
}: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={bentoSpring}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "rounded-3xl bg-white border border-white/20 shadow-bento transition-shadow duration-300 hover:shadow-bento-hover",
        spanMap[span],
        rowSpan === 2 && "bento-row-2",
        glass && glassMap[glass],
        !noPadding && "p-5 md:p-6",
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export function BentoGrid({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("bento-grid", className)}>
      {children}
    </div>
  )
}

export function BentoLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </span>
  )
}

export function BentoValue({
  children,
  mono,
}: {
  children: React.ReactNode
  mono?: boolean
}) {
  return (
    <span className={cn("text-2xl font-extrabold text-foreground", mono && "font-mono tabular-nums")}>
      {children}
    </span>
  )
}
