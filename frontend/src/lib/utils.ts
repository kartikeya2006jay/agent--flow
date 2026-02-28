import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined) return '-'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatDate(date: string | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

export function formatDuration(ms: number | undefined): string {
  if (ms === undefined) return '-'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function getRiskStyles(level: string | undefined): string {
  const styles: Record<string, string> = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    critical: 'bg-red-100 text-red-800 border-red-200',
  }
  return styles[level?.toLowerCase() || 'medium'] || styles.medium
}

export function getStatusColor(status: string | undefined): string {
  const colors: Record<string, string> = {
    success: 'text-green-600',
    completed: 'text-green-600',
    failed: 'text-red-600',
    error: 'text-red-600',
    pending: 'text-yellow-600',
    pending_approval: 'text-blue-600',
    running: 'text-blue-600',
    cancelled: 'text-slate-600',
  }
  return colors[status?.toLowerCase() || ''] || 'text-slate-600'
}
