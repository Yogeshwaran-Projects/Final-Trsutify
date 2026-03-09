"use client"

import type { EscrowStatus } from "@/lib/solana"

const config: Record<EscrowStatus, { label: string; classes: string }> = {
  Open: {
    label: "Open",
    classes: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  InProgress: {
    label: "In Progress",
    classes: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  },
  Submitted: {
    label: "Submitted",
    classes: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  Completed: {
    label: "Completed",
    classes: "bg-green-500/20 text-green-300 border-green-500/30",
  },
  Cancelled: {
    label: "Cancelled",
    classes: "bg-red-500/20 text-red-300 border-red-500/30",
  },
  Disputed: {
    label: "Disputed",
    classes: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  },
}

interface StatusBadgeProps {
  status: EscrowStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, classes } = config[status]
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes} ${className ?? ""}`}
    >
      {label}
    </span>
  )
}
