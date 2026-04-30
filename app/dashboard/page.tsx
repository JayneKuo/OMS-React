"use client"

import * as React from "react"
import Link from "next/link"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  PackageCheck,
  PackageSearch,
  PackageX,
  RefreshCw,
  ShoppingCart,
  Timer,
  Truck,
  Wallet,
  Warehouse,
  XCircle,
} from "lucide-react"

import { MainLayout } from "@/components/layout/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const amazonHealth = [
  {
    key: "lsr",
    label: "Late Shipment Rate",
    value: 1.8,
    threshold: 4.0,
    goodLabel: "<4%",
    unit: "%",
    higherIsBetter: false,
    impact: "还有 14 单缓冲才会触线",
    riskNote: "今天若再迟发 5 单，LSR 约升至 2.6%",
  },
  {
    key: "vtr",
    label: "Valid Tracking Rate",
    value: 97.4,
    threshold: 95,
    goodLabel: ">95%",
    unit: "%",
    higherIsBetter: true,
    impact: "3 单缺失追踪号会跌破安全垫",
    riskNote: "主要风险来自承运商回传延迟",
  },
  {
    key: "cancel",
    label: "Pre-fulfillment Cancel Rate",
    value: 0.9,
    threshold: 2.5,
    goodLabel: "<2.5%",
    unit: "%",
    higherIsBetter: false,
    impact: "仍有 11 单取消缓冲",
    riskNote: "缺货与地址校验是主要诱因",
  },
  {
    key: "feedback",
    label: "Seller Feedback Score",
    value: 4.8,
    threshold: 4.0,
    goodLabel: ">4.0",
    unit: "",
    higherIsBetter: true,
    impact: "当前 Buy Box 竞争力稳定",
    riskNote: "异常履约持续 3 天会拖累评分",
  },
] as const

const slaOrders = [
  {
    id: "AMZ-114-7829301-2834567",
    product: "MegaRed Omega-3, 80 Softgels",
    sku: "HYG-8001-6PK",
    qty: 1,
    shipBy: "Today 14:00",
    minutesLeft: 87,
    status: "Pending",
    warehouse: "WH-SZ-01",
    blocker: "Ready to wave",
    action: "Ship now",
    value: "$89.99",
  },
  {
    id: "AMZ-114-6612045-9012384",
    product: "Glass Plus Glass Cleaner (4-Pack)",
    sku: "HYG-8501-4PK",
    qty: 2,
    shipBy: "Today 14:00",
    minutesLeft: 87,
    status: "Processing",
    warehouse: "WH-SZ-01",
    blocker: "Packing in progress",
    action: "Expedite pack",
    value: "$34.50",
  },
  {
    id: "AMZ-114-5533901-1122334",
    product: "Lysol Disinfectant Spray (6-Pack)",
    sku: "LYS-8511-6PK",
    qty: 1,
    shipBy: "Today 17:00",
    minutesLeft: 267,
    status: "Pending",
    warehouse: "WH-GZ-02",
    blocker: "Wave not released",
    action: "Release pick",
    value: "$67.20",
  },
  {
    id: "AMZ-114-4421678-8834561",
    product: "Air Wick Stick-Up (6-Pack)",
    sku: "AIR-8213-6PK",
    qty: 3,
    shipBy: "Today 17:00",
    minutesLeft: 267,
    status: "Pending",
    warehouse: "WH-SZ-01",
    blocker: "Address verify pending",
    action: "Review address",
    value: "$42.00",
  },
  {
    id: "AMZ-114-3309012-6645221",
    product: "D-Con No View, No Touch Mouse Trap",
    sku: "DIS-8001-2PK",
    qty: 1,
    shipBy: "Tomorrow 14:00",
    minutesLeft: 1527,
    status: "Pending",
    warehouse: "WH-GZ-02",
    blocker: "Awaiting wave",
    action: "Plan tomorrow",
    value: "$28.75",
  },
] as const

const orderStats = [
  {
    label: "Orders Received",
    icon: ShoppingCart,
    today: 274,
    todayDelta: 8.3,
    sevenD: 2151,
    thirtyD: 9847,
    ytd: 42103,
    customLabels: null,
  },
  {
    label: "Orders Shipped",
    icon: Truck,
    today: 248,
    todayDelta: 6.1,
    sevenD: 1982,
    thirtyD: 9244,
    ytd: 39871,
    customLabels: null,
  },
  {
    label: "Order Exceptions",
    icon: PackageX,
    today: 3,
    todayDelta: -25,
    sevenD: 12,
    thirtyD: 47,
    ytd: 198,
    customLabels: null,
  },
  {
    label: "Open Orders by Age",
    icon: Clock,
    today: 26,
    todayDelta: null,
    sevenD: 11,
    thirtyD: 0,
    ytd: 37,
    customLabels: ["Today", "Yesterday", "Late", "Total Open"],
  },
] as const

const triageSummary = [
  {
    title: "Blocking order exceptions",
    count: 3,
    oldest: "4h 11m",
    gmv: "$1,342",
    owner: "客服 / 订单运营",
  },
  {
    title: "Shipping reviews",
    count: 2,
    oldest: "52m",
    gmv: "$412",
    owner: "仓库主管",
  },
  {
    title: "System issues",
    count: 3,
    oldest: "1h 48m",
    gmv: "$0",
    owner: "系统 / 集成",
  },
] as const

const tier1Exceptions = [
  {
    id: "SO-20240421-0272",
    type: "Address Verify Failed",
    customer: "Sofia Martinez",
    ordered: "Apr 21 09:15 AM",
    source: "Shopify",
    owner: "CS",
    value: "$67.20",
  },
  {
    id: "SO-20240421-0261",
    type: "Inventory Shortage",
    customer: "RB Health US",
    ordered: "Apr 21 08:04 AM",
    source: "Wholesale",
    owner: "Inventory",
    value: "$1,240.00",
  },
  {
    id: "SO-20240421-0254",
    type: "Payment Hold",
    customer: "James Davis",
    ordered: "Apr 21 07:47 AM",
    source: "Amazon",
    owner: "Finance",
    value: "$34.99",
  },
] as const

const tier2Shipping = [
  {
    id: "SR-20240421-0019",
    orderId: "SO-20240421-0265",
    location: "WH-SZ-01",
    updated: "11:22 AM",
    issue: "Carrier mismatch",
  },
  {
    id: "SR-20240421-0018",
    orderId: "SO-20240421-0258",
    location: "WH-GZ-02",
    updated: "10:45 AM",
    issue: "Address override",
  },
] as const

const tier3System = [
  {
    category: "Sent Order Failure",
    label: "Stuck",
    related: "SO-20240421-0265",
    source: "Exceptions Engine",
    created: "11:22 AM",
  },
  {
    category: "Sent Order Failure",
    label: "Stuck",
    related: "SO-20240421-0258",
    source: "Exceptions Engine",
    created: "10:45 AM",
  },
  {
    category: "API Sync Error",
    label: "Generic",
    related: "Shopify Channel",
    source: "Integration Engine",
    created: "09:30 AM",
  },
] as const

const inventoryBlocking = [
  {
    orderId: "SO-20240421-0261",
    sku: "HYG-8001-6PK",
    product: "MegaRed Omega-3, 80 Softgels",
    needed: 12,
    onHand: 0,
    impactedOrders: 4,
    channel: "Wholesale",
    coverage: "No inbound coverage",
    value: "$1,240.00",
  },
  {
    orderId: "SO-20240421-0247",
    sku: "LYS-8521-4PK",
    product: "Lysol Bleach Fresh Atlantic",
    needed: 6,
    onHand: 2,
    impactedOrders: 2,
    channel: "Amazon FBM",
    coverage: "Covered by PO-1263",
    value: "$156.00",
  },
] as const

const forwardRisk = [
  {
    sku: "LYS-8511-6PK-FBA",
    name: "Lysol Disinfectant Spray (6-Pack)",
    qtyNeeded: 1740,
    daysLeft: 12,
    inbound: "FBA 1102 pending",
    risk: "High",
  },
  {
    sku: "HYG-8001-6PK-FBA",
    name: "MegaRed Omega-3, 80 Softgels",
    qtyNeeded: 1503,
    daysLeft: 18,
    inbound: "PO-1264 arriving Apr 28",
    risk: "Medium",
  },
  {
    sku: "LYS-8518-FBA",
    name: "Lysol To Go Bursts (15 Count)",
    qtyNeeded: 2448,
    daysLeft: 21,
    inbound: "No PO linked",
    risk: "High",
  },
  {
    sku: "AIR-8213-6PK-FBA",
    name: "Air Wick Stick-Up (6-Pack)",
    qtyNeeded: 26,
    daysLeft: 24,
    inbound: "PO coverage ok",
    risk: "Low",
  },
] as const

const purchaseOrders = [
  {
    id: "1264",
    vendor: "RB Health US",
    total: "$75,509.28",
    eta: "Apr 28",
    status: "On time",
  },
  {
    id: "1263",
    vendor: "RB Health US",
    total: "$173,238.44",
    eta: "May 03",
    status: "At risk",
  },
  {
    id: "1262",
    vendor: "RB Health US",
    total: "$598,260.42",
    eta: "May 12",
    status: "On time",
  },
  {
    id: "1261",
    vendor: "RB Health US",
    total: "$42,346.00",
    eta: "May 19",
    status: "Delayed",
  },
] as const

const fbaInbound = [
  { id: "1102", date: "Apr 20", units: 0, status: "Pending" },
  { id: "1101", date: "Apr 01", units: 0, status: "Pending" },
  { id: "1100", date: "Jan 15", units: 256, status: "Received" },
  { id: "1098", date: "Jan 15", units: 450, status: "Received" },
] as const

const orderTrend = [
  { date: "Apr 15", orders: 312, shipped: 271 },
  { date: "Apr 16", orders: 287, shipped: 255 },
  { date: "Apr 17", orders: 341, shipped: 308 },
  { date: "Apr 18", orders: 298, shipped: 269 },
  { date: "Apr 19", orders: 263, shipped: 231 },
  { date: "Apr 20", orders: 376, shipped: 342 },
  { date: "Apr 21", orders: 274, shipped: 248 },
] as const

const recentOrders = [
  {
    id: "SO-20240421-0274",
    status: "Ready For Fulfillment",
    customer: "Emma Johnson",
    source: "Shopify",
    value: "$142.50",
  },
  {
    id: "SO-20240421-0273",
    status: "Shipped",
    customer: "Liam Chen",
    source: "Amazon",
    value: "$89.99",
  },
  {
    id: "SO-20240421-0272",
    status: "Exception",
    customer: "Sofia Martinez",
    source: "Shein",
    value: "$67.20",
  },
  {
    id: "SO-20240421-0271",
    status: "Shipped",
    customer: "Noah Williams",
    source: "Shopify",
    value: "$215.00",
  },
  {
    id: "SO-20240421-0270",
    status: "Pending",
    customer: "Olivia Brown",
    source: "Wholesale",
    value: "$1,240.00",
  },
] as const

function fmtMin(min: number) {
  if (min < 60) return `${min}m`
  if (min < 1440) return `${Math.floor(min / 60)}h ${min % 60}m`
  return `${Math.floor(min / 1440)}d`
}

function getRiskTone(level: "High" | "Medium" | "Low") {
  if (level === "High") return "border-red-200 bg-red-50 text-red-600"
  if (level === "Medium") return "border-orange-200 bg-orange-50 text-orange-600"
  return "border-green-200 bg-green-50 text-green-600"
}

function getSlaBucket(min: number) {
  if (min < 120) return "Urgent <2h"
  if (min < 1440) return "Ship today"
  return "Tomorrow"
}

function SlaTag({ min }: { min: number }) {
  if (min < 120) {
    return (
      <Badge className="gap-1 bg-red-600 text-xs text-white">
        <Flame className="h-3 w-3" />
        {fmtMin(min)} left
      </Badge>
    )
  }
  if (min < 480) {
    return (
      <Badge className="gap-1 bg-orange-500 text-xs text-white">
        <Timer className="h-3 w-3" />
        {fmtMin(min)} left
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="border-yellow-400 text-xs text-yellow-700">
      {fmtMin(min)} left
    </Badge>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Shipped: "bg-green-100 text-green-700 border-green-200",
    "Ready For Fulfillment": "bg-blue-100 text-blue-700 border-blue-200",
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Exception: "bg-red-100 text-red-700 border-red-200",
    Processing: "bg-blue-100 text-blue-700 border-blue-200",
  }

  return (
    <Badge variant="outline" className={`text-xs ${map[status] ?? ""}`}>
      {status}
    </Badge>
  )
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}

function MetricLine({
  label,
  value,
  detail,
  danger = false,
}: {
  label: string
  value: string
  detail: string
  danger?: boolean
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b py-3 last:border-0">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">{detail}</div>
      </div>
      <div className={`text-right text-2xl font-semibold ${danger ? "text-red-600" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const urgentCount = slaOrders.filter((order) => order.minutesLeft < 120).length
  const todayCount = slaOrders.filter((order) => order.minutesLeft >= 120 && order.minutesLeft < 1440).length
  const tomorrowCount = slaOrders.filter((order) => order.minutesLeft >= 1440).length
  const blockedOrderValue = inventoryBlocking.reduce((sum, item) => sum + Number(item.value.replace(/[$,]/g, "")), 0)

  return (
    <MainLayout>
      <div className="space-y-6 pb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-[0.18em]">
                Fulfillment command center
              </Badge>
              <span className="text-xs text-muted-foreground">April 21, 2026 · Updated just now</span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">先处理平台风险与当日动作，再看库存兜底和经营结果。</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-full px-4 text-xs">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button size="sm" className="h-9 rounded-full px-4 text-xs">
              Review urgent work
            </Button>
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border bg-background shadow-sm">
          <div className="grid divide-y md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-[1.35fr_repeat(3,minmax(0,1fr))]">
            <div className="p-6 md:col-span-2 xl:col-span-1 md:bg-red-50/20">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Priority</div>
              <div className="mt-2 text-sm text-muted-foreground">Urgent Amazon FBM</div>
              <div className="mt-3 text-6xl font-semibold text-red-600">{urgentCount}</div>
              <div className="mt-3 text-xs text-muted-foreground">2 小时内必须出货，否则直接拉高 LSR。</div>
              <div className="mt-4 flex items-center gap-2 text-xs text-red-600">
                <Flame className="h-3.5 w-3.5" />
                First focus for the team today
              </div>
            </div>
            <div className="p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Revenue at risk</div>
              <div className="mt-2 text-sm text-muted-foreground">Blocked GMV</div>
              <div className="mt-3 text-3xl font-semibold">${blockedOrderValue.toLocaleString()}</div>
              <div className="mt-3 text-xs text-muted-foreground">当前由缺货和异常卡住的订单金额。</div>
            </div>
            <div className="p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Preventable</div>
              <div className="mt-2 text-sm text-muted-foreground">Today defects</div>
              <div className="mt-3 text-3xl font-semibold">5</div>
              <div className="mt-3 text-xs text-muted-foreground">通过 ship-by、tracking、review 即可避免。</div>
            </div>
            <div className="p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Forward risk</div>
              <div className="mt-2 text-sm text-muted-foreground">Stockout watch</div>
              <div className="mt-3 text-3xl font-semibold">3</div>
              <div className="mt-3 text-xs text-muted-foreground">未来 21 天内高风险 SKU。</div>
            </div>
          </div>
        </section>

        <Card className="rounded-3xl shadow-sm">
          <CardContent className="space-y-6 p-5">
            <SectionHeader
              title="Operations today"
              description="把平台健康、当日 ship-by 和异常分诊收敛到一个主工作区。"
              action={<Badge className="rounded-full bg-red-600 text-white">{urgentCount} urgent</Badge>}
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_320px]">
              <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl border bg-background">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold">Platform health & penalty risk</div>
                      <div className="mt-1 text-xs text-muted-foreground">只保留关键指标，不拆成一堆小卡片。</div>
                    </div>
                    <Badge variant="outline" className="rounded-full border-green-400 text-green-600">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      All metrics safe
                    </Badge>
                  </div>
                  <div className="grid gap-px bg-border lg:grid-cols-2">
                    {amazonHealth.map((metric) => {
                      const safe = metric.higherIsBetter ? metric.value >= metric.threshold : metric.value <= metric.threshold
                      const pct = metric.higherIsBetter
                        ? Math.min(100, (metric.value / (metric.threshold * 1.15)) * 100)
                        : Math.min(100, ((metric.threshold * 1.5 - metric.value) / (metric.threshold * 1.5)) * 100)

                      return (
                        <div key={metric.key} className="bg-background px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-medium">{metric.label}</div>
                              <div className={`mt-2 text-2xl font-semibold ${safe ? "text-foreground" : "text-red-600"}`}>
                                {metric.value}
                                {metric.unit}
                              </div>
                            </div>
                            {safe ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                          </div>
                          <div className="mt-3">
                            <Progress value={pct} className={`h-1.5 ${safe ? "[&>div]:bg-foreground" : "[&>div]:bg-red-500"}`} />
                          </div>
                          <div className="mt-2 text-[11px] text-muted-foreground">Target {metric.goodLabel}</div>
                          <div className="mt-3 space-y-1 text-[11px] text-muted-foreground">
                            <div>{metric.impact}</div>
                            <div>{metric.riskNote}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border bg-background">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold">Amazon FBM ship-by</div>
                      <div className="mt-1 text-xs text-muted-foreground">唯一的首屏主操作表。</div>
                    </div>
                    <Button size="sm" className="h-8 rounded-full px-4 text-xs">
                      Batch ship
                    </Button>
                  </div>
                  <div className="grid gap-px border-b bg-border md:grid-cols-3">
                    <div className="bg-background px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Urgent &lt;2h</div>
                      <div className="mt-2 text-3xl font-semibold text-red-600">{urgentCount}</div>
                    </div>
                    <div className="bg-background px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Ship today</div>
                      <div className="mt-2 text-3xl font-semibold">{todayCount}</div>
                    </div>
                    <div className="bg-background px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Tomorrow</div>
                      <div className="mt-2 text-3xl font-semibold">{tomorrowCount}</div>
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          {["Bucket", "Order", "Ship by", "Blocker", "Warehouse", "Status", "Action"].map((heading) => (
                            <th key={heading} className="px-4 py-3 text-left font-medium text-muted-foreground">
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {slaOrders.map((order) => (
                          <tr key={order.id} className="border-b last:border-0 hover:bg-muted/20">
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="rounded-full text-[11px]">
                                {getSlaBucket(order.minutesLeft)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-mono text-[11px] text-blue-600">{order.id.slice(0, 18)}…</div>
                              <div className="mt-1 font-medium">{order.product}</div>
                              <div className="text-muted-foreground">{order.sku} × {order.qty} · {order.value}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className={`font-medium ${order.minutesLeft < 120 ? "text-red-600" : "text-foreground"}`}>
                                {order.shipBy}
                              </div>
                              <div className="mt-1">
                                <SlaTag min={order.minutesLeft} />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{order.blocker}</td>
                            <td className="px-4 py-3 text-muted-foreground">{order.warehouse}</td>
                            <td className="px-4 py-3">
                              <StatusBadge status={order.status} />
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                size="sm"
                                className={`h-7 rounded-full px-3 text-[11px] text-white ${order.minutesLeft < 120 ? "bg-red-600 hover:bg-red-700" : "bg-foreground hover:bg-foreground/90"}`}
                              >
                                {order.action}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border bg-background">
                  <div className="border-b px-4 py-3">
                    <div className="text-sm font-semibold">Exception triage</div>
                    <div className="mt-1 text-xs text-muted-foreground">把异常分成三个工作面，而不是很多独立卡片。</div>
                  </div>
                  <div className="grid gap-px border-b bg-border lg:grid-cols-3">
                    {triageSummary.map((item) => (
                      <div key={item.title} className="bg-background px-4 py-3">
                        <div className="text-sm font-medium">{item.title}</div>
                        <div className="mt-2 flex items-end justify-between gap-3">
                          <div className="text-3xl font-semibold">{item.count}</div>
                          <div className="text-right text-[11px] text-muted-foreground">
                            <div>Oldest {item.oldest}</div>
                            <div>{item.owner}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">Blocked GMV {item.gmv}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-px bg-border xl:grid-cols-[1.15fr_0.9fr_0.95fr]">
                    <div className="bg-background p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-red-600">Orders requiring attention</div>
                          <div className="mt-1 text-xs text-muted-foreground">直接阻断收入与履约。</div>
                        </div>
                        <Link href="/orders/exception-ai" className="text-xs text-muted-foreground hover:text-foreground">
                          View all
                        </Link>
                      </div>
                      <div className="mt-4 space-y-3">
                        {tier1Exceptions.map((order) => (
                          <div key={order.id} className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0">
                            <div>
                              <div className="font-mono text-[11px] text-blue-600">{order.id}</div>
                              <div className="mt-1 font-medium">{order.customer}</div>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="border-red-300 text-[11px] text-red-600">
                                  {order.type}
                                </Badge>
                                <span className="text-[11px] text-muted-foreground">Owner {order.owner}</span>
                              </div>
                            </div>
                            <div className="text-right text-xs">
                              <div className="font-medium">{order.value}</div>
                              <div className="text-muted-foreground">{order.source}</div>
                              <div className="mt-1 text-[11px] text-muted-foreground">{order.ordered}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-background p-4">
                      <div className="text-sm font-semibold text-orange-600">Shipping reviews</div>
                      <div className="mt-1 text-xs text-muted-foreground">仓库需要人工判断的问题。</div>
                      <div className="mt-4 space-y-3">
                        {tier2Shipping.map((request) => (
                          <div key={request.id} className="border-b pb-3 text-xs last:border-0 last:pb-0">
                            <div className="font-mono text-blue-600">{request.id}</div>
                            <div className="mt-2 font-medium">{request.issue}</div>
                            <div className="mt-1 text-muted-foreground">{request.orderId} · {request.location}</div>
                            <div className="mt-2 text-[11px] text-muted-foreground">Updated {request.updated}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-background p-4">
                      <div className="text-sm font-semibold">System issues</div>
                      <div className="mt-1 text-xs text-muted-foreground">不直接卡收入，但会放大运营阻力。</div>
                      <div className="mt-4 space-y-3">
                        {tier3System.map((issue, index) => (
                          <div key={`${issue.category}-${index}`} className="border-b pb-3 text-xs last:border-0 last:pb-0">
                            <div className="font-medium">{issue.category}</div>
                            <div className="mt-2 flex items-center gap-2">
                              <Badge variant="outline" className="text-[11px]">
                                {issue.label}
                              </Badge>
                              <span className="text-muted-foreground">{issue.related}</span>
                            </div>
                            <div className="mt-2 text-[11px] text-muted-foreground">{issue.source} · {issue.created}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="space-y-6 xl:border-l xl:pl-6">
                <div>
                  <div className="text-sm font-semibold">Inventory & inbound support</div>
                  <div className="mt-1 text-xs text-muted-foreground">右侧只保留摘要支持，不再挂很多明细卡片。</div>
                </div>

                <div>
                  <MetricLine label="Blocked orders" value="6" detail="当前被库存阻塞的订单数。" danger />
                  <MetricLine label="Blocked GMV" value="$1,396" detail="由缺货和异常造成的即时损失。" />
                  <MetricLine label="Inbound cover" value="1 / 2" detail="关键阻塞 SKU 中已有在途覆盖的数量。" />
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <PackageX className="h-4 w-4" />
                    Inventory blocking
                  </div>
                  <div className="mt-3 space-y-3">
                    {inventoryBlocking.map((item) => (
                      <div key={item.orderId} className="border-b pb-3 text-xs last:border-0 last:pb-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium">{item.sku}</div>
                            <div className="mt-1 text-muted-foreground">{item.product}</div>
                          </div>
                          <div className="text-right font-medium">{item.value}</div>
                        </div>
                        <div className="mt-2 text-muted-foreground">Need {item.needed} · On hand {item.onHand} · {item.impactedOrders} orders</div>
                        <div className="mt-1 text-[11px] text-muted-foreground">{item.coverage}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <PackageSearch className="h-4 w-4" />
                    Forward stock-out risk
                  </div>
                  <div className="mt-3 space-y-3">
                    {forwardRisk.slice(0, 3).map((item) => (
                      <div key={item.sku} className="border-b pb-3 text-xs last:border-0 last:pb-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium">{item.sku}</div>
                            <div className="mt-1 text-muted-foreground">{item.name}</div>
                          </div>
                          <Badge variant="outline" className={getRiskTone(item.risk)}>
                            {item.risk}
                          </Badge>
                        </div>
                        <div className="mt-2 text-muted-foreground">Qty needed {item.qtyNeeded.toLocaleString()} · {item.daysLeft} days left</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Wallet className="h-4 w-4" />
                    Coverage snapshot
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Inbound next 7d</span>
                      <span className="font-medium text-foreground">$248K</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Late PO</span>
                      <span className="text-red-600">1</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Critical SKU covered</span>
                      <span className="text-orange-600">50%</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm">
          <CardContent className="space-y-6 p-5">
            <SectionHeader
              title="Inventory, inbound & outcome review"
              description="把下半屏收敛成一个复盘区，而不是很多散卡。"
            />

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.95fr]">
              <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl border bg-background">
                  <div className="border-b px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Warehouse className="h-4 w-4" />
                      Purchase & inbound coverage
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">缺货有没有在途兜底。</div>
                  </div>
                  <div className="grid gap-px bg-border md:grid-cols-[1.1fr_0.9fr]">
                    <div className="bg-background p-4">
                      <div className="text-sm font-medium">Purchase orders</div>
                      <div className="mt-4 space-y-3">
                        {purchaseOrders.map((po) => (
                          <div key={po.id} className="flex items-center justify-between gap-3 border-b pb-3 text-xs last:border-0 last:pb-0">
                            <div>
                              <div className="font-mono text-blue-600">PO-{po.id}</div>
                              <div className="mt-1 font-medium">{po.vendor}</div>
                              <div className="mt-1 text-muted-foreground">ETA {po.eta}</div>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant="outline"
                                className={
                                  po.status === "Delayed"
                                    ? "border-red-300 text-red-600"
                                    : po.status === "At risk"
                                      ? "border-orange-300 text-orange-600"
                                      : "border-green-300 text-green-600"
                                }
                              >
                                {po.status}
                              </Badge>
                              <div className="mt-2 font-medium">{po.total}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-background p-4">
                      <div className="text-sm font-medium">FBA inbound visibility</div>
                      <div className="mt-4 space-y-3">
                        {fbaInbound.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-3 border-b pb-3 text-xs last:border-0 last:pb-0">
                            <div>
                              <div className="font-mono text-blue-600">{item.id}</div>
                              <div className="mt-1 text-muted-foreground">{item.date}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{item.units} units</div>
                              <div className="text-muted-foreground">{item.status}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border bg-background">
                  <div className="border-b px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <PackageCheck className="h-4 w-4" />
                      Outcome trends
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">经营结果放在下半屏，作为风险处理后的结果层。</div>
                  </div>
                  <div className="grid gap-px border-b bg-border sm:grid-cols-2 lg:grid-cols-4">
                    {orderStats.map((stat) => {
                      const labels = stat.customLabels ?? ["Today", "7 Days", "30 Days", "YTD"]
                      const positive = stat.todayDelta !== null && stat.todayDelta >= 0
                      const Icon = stat.icon

                      return (
                        <div key={stat.label} className="bg-background p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-medium">{stat.label}</div>
                              <div className="mt-3 text-3xl font-semibold">{stat.today.toLocaleString()}</div>
                            </div>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          {stat.todayDelta !== null && (
                            <div className={`mt-2 flex items-center gap-1 text-xs ${positive ? "text-green-600" : "text-red-500"}`}>
                              {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                              {Math.abs(stat.todayDelta)}% vs prev
                            </div>
                          )}
                          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                            <div>
                              <div>{labels[1]}</div>
                              <div className="mt-1 text-sm font-medium text-foreground">{stat.sevenD.toLocaleString()}</div>
                            </div>
                            <div>
                              <div>{labels[2]}</div>
                              <div className="mt-1 text-sm font-medium text-foreground">{stat.thirtyD.toLocaleString()}</div>
                            </div>
                            <div>
                              <div>{labels[3]}</div>
                              <div className="mt-1 text-sm font-medium text-foreground">{stat.ytd.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={orderTrend} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
                        <defs>
                          <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#181818" stopOpacity={0.12} />
                            <stop offset="95%" stopColor="#181818" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="shippedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.14} />
                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 16, border: "1px solid hsl(var(--border))" }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                        <Area type="monotone" dataKey="orders" name="Orders" stroke="#181818" strokeWidth={2} fill="url(#ordersGradient)" dot={false} />
                        <Area type="monotone" dataKey="shipped" name="Shipped" stroke="#16a34a" strokeWidth={2} fill="url(#shippedGradient)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border bg-background">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold">Recent orders</div>
                    <div className="mt-1 text-xs text-muted-foreground">作为预览入口，不再抢主视觉。</div>
                  </div>
                  <Link href="/orders">
                    <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-xs">
                      View all
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
                <div className="grid gap-px bg-border lg:grid-cols-[minmax(0,1fr)_240px]">
                  <div className="bg-background p-4">
                    <div className="space-y-3">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0">
                          <div>
                            <div className="font-mono text-[11px] text-blue-600">{order.id}</div>
                            <div className="mt-1 font-medium">{order.customer}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{order.source}</div>
                          </div>
                          <div className="text-right">
                            <StatusBadge status={order.status} />
                            <div className="mt-2 text-sm font-medium">{order.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted/10 p-4 lg:border-l">
                    <div className="text-sm font-medium">Returns state</div>
                    <div className="mt-3 flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">No problems</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">All returns have been processed.</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
