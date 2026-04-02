"use client"

import * as React from "react"
import Link from "next/link"
import { useAiAssistant, type AiMessage } from "./ai-assistant-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sparkles, X, Send, Loader2, Bot, User,
  BarChart3, ShoppingBag, Users, Tag, Workflow, Compass,
  TrendingUp, FileDown, PackageSearch, Boxes, UserSearch,
  BadgePercent, Zap, MapPin, History, Plus, MessageSquare,
  Trash2, ChevronLeft, Search, AlertTriangle, ArrowRight,
  ExternalLink, Clock, PanelRightClose,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ═══════════════════════════════════════════════
// Suggestion data
// ═══════════════════════════════════════════════
interface SuggestionItem { icon: React.ElementType; label: string; prompt: string }
interface SuggestionCategory { emoji: string; title: string; items: SuggestionItem[] }

const SUGGESTION_CATEGORIES: SuggestionCategory[] = [
  {
    emoji: "📊", title: "数据与分析",
    items: [
      { icon: TrendingUp, label: "查看销售数据", prompt: "查看本月的销售数据和订单趋势" },
      { icon: BarChart3, label: "对比业绩表现", prompt: "对比本月和上月的业绩表现" },
      { icon: FileDown, label: "导出数据报表", prompt: "帮我导出最近一周的订单数据" },
    ],
  },
  {
    emoji: "🛍️", title: "产品与库存",
    items: [
      { icon: ShoppingBag, label: "创建/编辑产品", prompt: "如何创建一个新产品和变体？" },
      { icon: PackageSearch, label: "查询库存水平", prompt: "查询当前库存水平较低的商品" },
      { icon: Boxes, label: "管理产品集合", prompt: "如何管理产品集合和分类？" },
    ],
  },
  {
    emoji: "👥", title: "客户管理",
    items: [
      { icon: Users, label: "创建客户细分", prompt: "帮我创建一个高价值客户细分群体" },
      { icon: UserSearch, label: "查找客户信息", prompt: "如何查找特定客户的订单历史？" },
    ],
  },
  {
    emoji: "💰", title: "定价与促销",
    items: [
      { icon: Tag, label: "定价策略建议", prompt: "给我一些定价策略方面的建议" },
      { icon: BadgePercent, label: "分析促销效果", prompt: "分析最近的折扣和促销活动效果" },
    ],
  },
  {
    emoji: "🤖", title: "自动化",
    items: [
      { icon: Workflow, label: "创建工作流", prompt: "帮我创建一个订单异常自动处理的工作流" },
      { icon: Zap, label: "自动化建议", prompt: "有哪些推荐的自动化规则可以提升效率？" },
    ],
  },
  {
    emoji: "🧭", title: "导航与引导",
    items: [
      { icon: Compass, label: "快速导航", prompt: "帮我找到退货管理页面" },
      { icon: MapPin, label: "设置指导", prompt: "如何配置店铺的基本设置？" },
      { icon: History, label: "发布历史", prompt: "最近有什么新功能更新？" },
    ],
  },
]

// ═══════════════════════════════════════════════
// Pulse insight cards (simulated proactive insights)
// ═══════════════════════════════════════════════
interface PulseInsight { id: string; icon: React.ElementType; color: string; title: string; desc: string; action: string; prompt: string }

const PULSE_INSIGHTS: PulseInsight[] = [
  { id: "p1", icon: AlertTriangle, color: "text-orange-500", title: "异常率上升", desc: "今日订单异常率较昨日上升 23%", action: "查看详情", prompt: "分析今天的订单异常情况" },
  { id: "p2", icon: TrendingUp, color: "text-green-500", title: "销售增长", desc: "本周销售额环比增长 12%", action: "查看报表", prompt: "查看本周的销售数据和增长趋势" },
  { id: "p3", icon: PackageSearch, color: "text-blue-500", title: "库存预警", desc: "3 个 SKU 库存低于安全水位", action: "查看库存", prompt: "查询当前库存水平较低的商品" },
]

// ═══════════════════════════════════════════════
// Simulated responses — structured with optional links
// ═══════════════════════════════════════════════
interface AiResponseBlock {
  type: "text" | "link"
  content: string
  href?: string
}

function getSimulatedResponse(input: string): AiResponseBlock[] {
  const lower = input.toLowerCase()

  if (lower.match(/销售|数据|趋势|报表|分析.*业绩|对比.*月|业绩/))
    return [
      { type: "text", content: "📊 我可以帮你分析数据：\n\n• 前往「仪表板」查看实时销售概览和趋势图表\n• 在「订单管理」中筛选时间范围查看订单统计\n• 使用导出功能下载 CSV/Excel 格式的详细报表" },
      { type: "link", content: "前往仪表板", href: "/dashboard" },
      { type: "text", content: "你想查看哪个时间段的数据？" },
    ]
  if (lower.match(/导出|下载|csv|excel/))
    return [
      { type: "text", content: "📥 导出数据的步骤：\n\n1. 进入对应的列表页面\n2. 使用筛选条件缩小范围\n3. 点击右上角「导出」按钮\n4. 选择格式（CSV 或 Excel）" },
      { type: "link", content: "前往订单管理", href: "/orders" },
    ]
  if (lower.match(/产品|商品|变体|创建.*产品|编辑.*产品/))
    return [
      { type: "text", content: "🛍️ 产品管理操作指引：\n\n• 创建产品：前往「商品管理」→ 点击「添加商品」\n• 编辑变体：在产品详情页的「变体」标签下操作\n• 批量操作：支持从文件导入批量创建/更新" },
      { type: "link", content: "前往商品管理", href: "/product" },
    ]
  if (lower.match(/库存|缺货|库存水平|补货/))
    return [
      { type: "text", content: "📦 你可以在「库存管理」页面查看所有 SKU 的实时库存水平。\n\n• 使用筛选器按仓库、状态筛选\n• 低库存预警会在仪表板显示\n• 支持设置自动补货规则" },
      { type: "link", content: "前往库存管理", href: "/inventory" },
    ]
  if (lower.match(/客户|细分|群体|客户.*查找|查找.*客户/))
    return [
      { type: "text", content: "👥 客户管理功能：\n\n• 客户列表：前往「客户管理」查看所有客户\n• 创建细分：基于订单金额、购买频次、地区等条件创建客户群体\n• 客户详情：点击客户可查看完整的订单历史和互动记录" },
      { type: "link", content: "前往客户管理", href: "/customer-management" },
    ]
  if (lower.match(/定价|价格|策略|促销|折扣|优惠/))
    return [{ type: "text", content: "💰 定价与促销建议：\n\n• 定价策略：可以在产品详情中设置基础价格和对比价格\n• 促销活动：前往「自动化」→「促销规则」创建折扣\n• 效果分析：在仪表板的「促销分析」模块查看转化率和 ROI\n\n常见策略：阶梯定价、捆绑销售、限时折扣、满减优惠。" }]
  if (lower.match(/自动化|工作流|自动.*处理|规则|效率/))
    return [
      { type: "text", content: "🤖 自动化功能：\n\n• 创建工作流：设置触发条件 → 定义执行动作\n• 推荐规则：订单异常自动重试、低库存自动通知、新订单自动分配仓库、发货后自动发送通知" },
      { type: "link", content: "前往自动化", href: "/automation" },
    ]
  if (lower.match(/导航|找到|页面|在哪|怎么去|前往|退货/))
    return [
      { type: "text", content: "🧭 OMS 主要模块：" },
      { type: "link", content: "仪表板", href: "/dashboard" },
      { type: "link", content: "订单管理", href: "/orders" },
      { type: "link", content: "退货管理", href: "/returns" },
      { type: "link", content: "采购管理", href: "/purchase" },
      { type: "link", content: "库存管理", href: "/inventory" },
      { type: "link", content: "商品管理", href: "/product" },
      { type: "link", content: "客户管理", href: "/customer-management" },
      { type: "link", content: "自动化", href: "/automation" },
    ]
  if (lower.match(/设置|配置|店铺设置/))
    return [{ type: "text", content: "⚙️ 店铺设置指导：\n\n点击顶部导航栏的「设置」图标，可以配置：\n\n• 基本信息：店铺名称、联系方式\n• 租户/商户：切换和管理多租户\n• 语言和时区：在用户菜单中切换\n• 主题：支持浅色/深色/跟随系统" }]
  if (lower.match(/新功能|更新|发布.*历史|what.*new/))
    return [{ type: "text", content: "🆕 最近更新：\n\n• AI 助手上线 — 支持自然语言交互\n• 异常诊断增强 — 支持 LLM 意图识别\n• 批量操作优化 — 支持多选批量处理\n• 收货确认流程 — 新增一步完成入库\n• 暗色模式 — 全面支持深色主题" }]
  if (lower.match(/订单|order|so\d+|异常/i))
    return [
      { type: "text", content: "📋 订单管理：\n\n• 查询订单：支持按订单号、状态、日期筛选\n• 异常处理：在「事件管理」中查看和处理订单异常\n• 批量操作：支持批量导出、批量更新状态\n\n请提供订单号（如 SO12345），我可以帮你查询详情。" },
      { type: "link", content: "前往订单管理", href: "/orders" },
      { type: "link", content: "前往事件管理", href: "/events" },
    ]
  return [{ type: "text", content: "你好！我是 OMS AI 助手，可以帮你：\n\n📊 查看销售数据和分析报表\n🛍️ 管理产品、变体和库存\n👥 查找客户和创建细分群体\n💰 制定定价策略、分析促销效果\n🤖 创建自动化工作流\n🧭 快速导航到任意页面\n\n有什么具体想做的事情，告诉我吧！😊" }]
}

/** Flatten response blocks to plain text for storage */
function blocksToText(blocks: AiResponseBlock[]): string {
  return blocks.map((b) => b.type === "link" ? `[${b.content}](${b.href})` : b.content).join("\n")
}

// ═══════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════
function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "刚刚"
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} 天前`
  return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" })
}

// ═══════════════════════════════════════════════
// AI message bubble — renders structured blocks
// ═══════════════════════════════════════════════
function AiBubble({ content }: { content: string }) {
  // Parse markdown-style links [text](href) into blocks
  const parts = React.useMemo(() => {
    const result: AiResponseBlock[] = []
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        result.push({ type: "text", content: content.slice(lastIndex, match.index).trim() })
      }
      result.push({ type: "link", content: match[1], href: match[2] })
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < content.length) {
      const remaining = content.slice(lastIndex).trim()
      if (remaining) result.push({ type: "text", content: remaining })
    }
    return result
  }, [content])

  const hasLinks = parts.some((p) => p.type === "link")

  return (
    <div className="space-y-2">
      {parts.map((block, i) => {
        if (block.type === "link" && block.href) {
          return (
            <Link
              key={i}
              href={block.href}
              className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 hover:border-primary/30 w-fit"
            >
              <ExternalLink className="h-3 w-3" />
              {block.content}
              <ArrowRight className="h-3 w-3" />
            </Link>
          )
        }
        return (
          <p key={i} className="text-sm whitespace-pre-wrap leading-relaxed">{block.content}</p>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════
// History view
// ═══════════════════════════════════════════════
function HistoryView() {
  const { conversations, activeConversationId, selectConversation, deleteConversation, createConversation, setShowHistory } = useAiAssistant()
  const [search, setSearch] = React.useState("")

  const filtered = React.useMemo(() => {
    if (!search.trim()) return conversations
    const q = search.toLowerCase()
    return conversations.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      c.messages.some((m) => m.content.toLowerCase().includes(q))
    )
  }, [conversations, search])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowHistory(false)} aria-label="返回">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold">对话历史</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{conversations.length}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={createConversation} aria-label="新建对话">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      {conversations.length > 0 && (
        <div className="px-3 py-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="搜索对话..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60 mb-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">{search ? "未找到匹配的对话" : "暂无对话记录"}</p>
            {!search && (
              <>
                <p className="text-xs text-muted-foreground mb-4">开始一个新对话吧</p>
                <Button size="sm" onClick={createConversation} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />新建对话
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="p-1.5 space-y-0.5">
            {filtered.map((conv) => {
              const isActive = conv.id === activeConversationId
              const msgCount = conv.messages.filter((m) => !m.isLoading).length
              const lastMsg = conv.messages.filter((m) => !m.isLoading).at(-1)
              return (
                <div
                  key={conv.id}
                  className={cn(
                    "group flex items-start gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer transition-colors",
                    isActive ? "bg-primary/10" : "hover:bg-muted/60"
                  )}
                  onClick={() => selectConversation(conv.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") selectConversation(conv.id) }}
                >
                  <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md mt-0.5", isActive ? "bg-primary/15" : "bg-muted/80")}>
                    <MessageSquare className={cn("h-3 w-3", isActive ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("text-xs font-medium truncate", isActive && "text-primary")}>{conv.title}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{relativeTime(conv.updatedAt)}</span>
                    </div>
                    {lastMsg && (
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {lastMsg.role === "user" ? "你: " : "AI: "}{lastMsg.content.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").slice(0, 40)}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{msgCount} 条消息</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost" size="icon"
                    className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id) }}
                    aria-label="删除对话"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

// ═══════════════════════════════════════════════
// Main panel
// ═══════════════════════════════════════════════
export function AiAssistantPanel() {
  const {
    isOpen, close,
    activeConversation, activeConversationId,
    createConversation, addMessage, updateMessages,
    showHistory, setShowHistory, conversations,
  } = useAiAssistant()

  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [dismissedPulse, setDismissedPulse] = React.useState<Set<string>>(new Set())
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const messages = activeConversation?.messages ?? []
  const hasMessages = messages.length > 0
  const visiblePulse = PULSE_INSIGHTS.filter((p) => !dismissedPulse.has(p.id))

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  React.useEffect(() => {
    if (isOpen && !showHistory) setTimeout(() => textareaRef.current?.focus(), 300)
  }, [isOpen, showHistory, activeConversationId])

  React.useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [input])

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) close() }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [isOpen, close])

  const ensureConversation = React.useCallback((): string => {
    if (activeConversationId) return activeConversationId
    return createConversation()
  }, [activeConversationId, createConversation])

  const handleSend = React.useCallback(
    async (text?: string) => {
      const content = (text || input).trim()
      if (!content || isLoading) return
      ensureConversation()

      addMessage({ id: `user-${Date.now()}`, role: "user", content, timestamp: new Date() })
      setInput("")
      setIsLoading(true)
      addMessage({ id: `loading-${Date.now()}`, role: "ai", content: "", timestamp: new Date(), isLoading: true })

      await new Promise((r) => setTimeout(r, 1200))

      const blocks = getSimulatedResponse(content)
      const aiText = blocksToText(blocks)
      updateMessages((prev) => prev.filter((m) => !m.isLoading).concat({ id: `ai-${Date.now()}`, role: "ai", content: aiText, timestamp: new Date() }))
      setIsLoading(false)
    },
    [input, isLoading, ensureConversation, addMessage, updateMessages]
  )

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }, [handleSend])

  const handleNewChat = React.useCallback(() => { createConversation(); setInput("") }, [createConversation])

  return (
    <div className="flex h-full flex-col" role="complementary" aria-label="AI 助手">
      {showHistory ? (
        <HistoryView />
      ) : (
        <>
          {/* ── Header ── */}
          <div className="flex items-center justify-between border-b px-3 py-2.5 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              {hasMessages && activeConversation ? (
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{activeConversation.title}</p>
                  <p className="text-[10px] text-muted-foreground">{messages.filter(m => !m.isLoading).length} 条消息</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold">OMS AI 助手</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 gap-0.5 border-primary/30 text-primary">Beta</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">智能问答 · 操作执行 · 主动洞察</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={handleNewChat} aria-label="新建对话">
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost" size="icon"
                className={cn("h-7 w-7 text-muted-foreground hover:text-primary relative", conversations.length > 0 && "after:absolute after:top-1 after:right-1 after:h-1.5 after:w-1.5 after:rounded-full after:bg-primary")}
                onClick={() => setShowHistory(true)}
                aria-label="对话历史"
              >
                <History className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={close} aria-label="关闭">
                <PanelRightClose className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* ── Content area ── */}
          <ScrollArea className="flex-1">
            <div className="p-3">
              {!hasMessages ? (
                <div className="pb-2">
                  {/* Pulse insights */}
                  {visiblePulse.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-1.5 mb-2 px-0.5">
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span className="text-[11px] font-medium text-muted-foreground">智能洞察</span>
                      </div>
                      <div className="space-y-1.5">
                        {visiblePulse.map((insight) => (
                          <div key={insight.id} className="group relative flex items-start gap-2.5 rounded-lg border border-border/50 bg-card p-2.5 transition-colors hover:border-primary/20">
                            <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/60", insight.color)}>
                              <insight.icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium">{insight.title}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{insight.desc}</p>
                              <button
                                onClick={() => handleSend(insight.prompt)}
                                className="text-[11px] text-primary font-medium mt-1 flex items-center gap-1 hover:underline"
                              >
                                {insight.action}
                                <ArrowRight className="h-2.5 w-2.5" />
                              </button>
                            </div>
                            <button
                              onClick={() => setDismissedPulse((prev) => new Set(prev).add(insight.id))}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                              aria-label="关闭"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  )}

                  {/* Welcome */}
                  <div className="flex flex-col items-center pt-4 pb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 mb-2.5">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-sm font-semibold mb-0.5">有什么可以帮你？</h2>
                    <p className="text-[11px] text-muted-foreground text-center max-w-[260px]">
                      我可以帮你查数据、管理订单、操作产品库存、创建自动化工作流。
                    </p>
                  </div>

                  {/* Suggestion categories */}
                  <div className="space-y-3">
                    {SUGGESTION_CATEGORIES.map((cat) => (
                      <div key={cat.title}>
                        <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
                          <span className="text-xs">{cat.emoji}</span>
                          <span className="text-[11px] font-medium text-muted-foreground">{cat.title}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {cat.items.map((s) => (
                            <button
                              key={s.label}
                              onClick={() => handleSend(s.prompt)}
                              className="flex items-center gap-1.5 rounded-md border border-border/40 bg-card px-2 py-1.5 text-left text-[11px] transition-colors hover:bg-primary/5 hover:border-primary/25 hover:text-primary group"
                            >
                              <s.icon className="h-3 w-3 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                              <span className="truncate">{s.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* ── Chat messages ── */
                <div className="space-y-3">
                  {messages.map((msg) => {
                    if (msg.isLoading) {
                      return (
                        <div key={msg.id} className="flex gap-2.5">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Bot className="h-3 w-3 text-primary" />
                          </div>
                          <div className="rounded-xl rounded-tl-sm bg-muted/60 px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin text-primary" />
                              <span className="text-xs text-muted-foreground">思考中...</span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    const isAi = msg.role === "ai"
                    return (
                      <div key={msg.id} className={cn("flex gap-2.5", !isAi && "flex-row-reverse")}>
                        <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", isAi ? "bg-primary/10" : "bg-muted")}>
                          {isAi ? <Bot className="h-3 w-3 text-primary" /> : <User className="h-3 w-3 text-muted-foreground" />}
                        </div>
                        <div className={cn("max-w-[88%] rounded-xl px-3 py-2.5", isAi ? "rounded-tl-sm bg-muted/60" : "rounded-tr-sm bg-primary text-primary-foreground")}>
                          {isAi ? (
                            <AiBubble content={msg.content} />
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          )}
                          <p className={cn("text-[10px] mt-1", isAi ? "text-muted-foreground" : "text-primary-foreground/60")}>
                            {msg.timestamp.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>
          </ScrollArea>

          {/* ── Input ── */}
          <div className="border-t bg-background p-2.5 shrink-0">
            <div className="flex items-end gap-1.5">
              <Textarea
                ref={textareaRef}
                placeholder="问我任何问题，或输入 / 查看快捷指令..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={1}
                className="min-h-[36px] max-h-[100px] resize-none flex-1 text-xs px-3 py-2"
              />
              <Button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="h-9 w-9 shrink-0"
                aria-label="发送"
              >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1.5 text-center">
              Enter 发送 · Shift+Enter 换行 · Esc 关闭
            </p>
          </div>
        </>
      )}
    </div>
  )
}
