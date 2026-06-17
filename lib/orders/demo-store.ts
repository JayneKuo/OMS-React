"use client"

import * as React from "react"
import { mockOrders } from "@/lib/orders/mock-data"
import type { Order } from "@/lib/orders/types"

const STORAGE_KEY = "oms.sales-orders.demo.v1"

function cloneMockOrders() {
  return mockOrders.map((order) => ({ ...order, lineItems: order.lineItems.map((item) => ({ ...item })) }))
}

export function readDemoOrders(): Order[] {
  if (typeof window === "undefined") return cloneMockOrders()

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return cloneMockOrders()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : cloneMockOrders()
  } catch {
    return cloneMockOrders()
  }
}

export function writeDemoOrders(orders: Order[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

export function resetDemoOrders() {
  const orders = cloneMockOrders()
  writeDemoOrders(orders)
  return orders
}

export function useDemoOrders() {
  const [orders, setOrders] = React.useState<Order[]>(() => cloneMockOrders())

  React.useEffect(() => {
    setOrders(readDemoOrders())
  }, [])

  const replaceOrders = React.useCallback((nextOrders: Order[]) => {
    setOrders(nextOrders)
    writeDemoOrders(nextOrders)
  }, [])

  const upsertOrder = React.useCallback((order: Order) => {
    setOrders((current) => {
      const exists = current.some((item) => item.id === order.id)
      const next = exists ? current.map((item) => (item.id === order.id ? order : item)) : [order, ...current]
      writeDemoOrders(next)
      return next
    })
  }, [])

  const updateOrder = React.useCallback((id: string, updater: (order: Order) => Order) => {
    setOrders((current) => {
      const next = current.map((order) => (order.id === id ? updater(order) : order))
      writeDemoOrders(next)
      return next
    })
  }, [])

  const resetOrders = React.useCallback(() => {
    const next = resetDemoOrders()
    setOrders(next)
  }, [])

  return { orders, replaceOrders, upsertOrder, updateOrder, resetOrders }
}
