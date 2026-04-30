import { Activity, ShoppingCart, Package, Truck, Zap, Settings } from 'lucide-react'
import type { EventCategory, EventStatus } from './types'

export function getStatusVariant(status: EventStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'success': return 'default'
    case 'failed': return 'destructive'
    case 'warning': return 'secondary'
    case 'pending': return 'outline'
  }
}

export function getStatusColor(status: EventStatus): string {
  switch (status) {
    case 'success': return 'text-green-600 bg-green-50 border-green-200'
    case 'failed': return 'text-red-600 bg-red-50 border-red-200'
    case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200'
    case 'pending': return 'text-gray-500 bg-gray-50 border-gray-200'
  }
}

export function getCategoryIcon(category: EventCategory) {
  switch (category) {
    case 'order': return ShoppingCart
    case 'purchase': return Package
    case 'inventory': return Truck
    case 'api': return Activity
    case 'automation': return Zap
    case 'system': return Settings
  }
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}
