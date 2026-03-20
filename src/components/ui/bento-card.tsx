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
  index?: number
  hoverGlow?: "violet" | "sky" | "amber" | "emerald"
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

const glowMap = {
  violet: "hover:shadow-glow-violet",
  sky: "hover:shadow-glow-sky",
  amber: "hover:shadow-glow-amber",
  emerald: "hover:shadow-glow-emerald",
}

export const bentoSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 22,
}

export function BentoCard({
  span = 1,
  rowSpan,
  glass,
  noPadding,
  className,
  children,
  index = 0,
  hoverGlow,
}: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...bentoSpring, delay: index * 0.06 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={cn(
        "rounded-[2.5rem] bg-white/80 backdrop-blur-xl border border-white/20",
        "shadow-bento transition-all duration-300 hover:shadow-bento-hover",
        spanMap[span],
        rowSpan === 2 && "bento-row-2",
        glass && glassMap[glass],
        hoverGlow && glowMap[hoverGlow],
        !noPadding && "p-6 md:p-7",
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
    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
      {children}
    </span>
  )
}

export function BentoValue({
  children,
  mono,
  size = "default",
}: {
  children: React.ReactNode
  mono?: boolean
  size?: "default" | "large"
}) {
  return (
    <span
      className={cn(
        "font-extrabold text-foreground tracking-tighter block",
        size === "large" ? "text-4xl md:text-5xl" : "text-3xl",
        mono && "font-mono tabular-nums"
      )}
    >
      {children}
    </span>
  )
}
