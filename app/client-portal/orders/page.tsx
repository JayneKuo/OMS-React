"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ClientPortalOrdersPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/client-portal/orders/sales")
  }, [router])
  return null
}
