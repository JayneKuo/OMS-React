"use client"

import * as React from "react"
import { Sidebar } from "./sidebar"
import { HeaderSimple } from "./header-simple"
import { AiAssistantPanel } from "@/components/ai-assistant/ai-assistant-panel"
import { useAiAssistant } from "@/components/ai-assistant/ai-assistant-context"

interface MainLayoutProps {
  children: React.ReactNode
  sidebarItems?: Array<{
    title: string
    href: string
    icon?: React.ReactNode
    children?: Array<{
      title: string
      href: string
      icon?: React.ReactNode
    }>
  }>
  moduleName?: string
}

const MIN_PANEL_WIDTH = 320
const MAX_PANEL_WIDTH = 700
const DEFAULT_PANEL_WIDTH = 400

export function MainLayout({ children, sidebarItems, moduleName }: MainLayoutProps) {
  const { isOpen } = useAiAssistant()
  const [panelWidth, setPanelWidth] = React.useState(DEFAULT_PANEL_WIDTH)
  const isDragging = React.useRef(false)
  const startX = React.useRef(0)
  const startWidth = React.useRef(DEFAULT_PANEL_WIDTH)

  const panel = React.useMemo(() => <AiAssistantPanel />, [])

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    startX.current = e.clientX
    startWidth.current = panelWidth
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
    e.preventDefault()
  }, [panelWidth])

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      // 向左拖 = 面板变宽（因为面板在右侧）
      const delta = startX.current - e.clientX
      const newWidth = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, startWidth.current + delta))
      setPanelWidth(newWidth)
    }

    const handleMouseUp = () => {
      if (!isDragging.current) return
      isDragging.current = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <HeaderSimple />
      <div className="flex flex-1 overflow-hidden">
        {sidebarItems && sidebarItems.length > 0 && (
          <Sidebar items={sidebarItems} moduleName={moduleName} />
        )}
        <main className="flex-1 overflow-y-auto bg-background p-6 transition-all duration-300">
          {children}
        </main>
        {/* AI Assistant — resizable right panel */}
        <div
          className={`shrink-0 overflow-visible border-l bg-background transition-[width] duration-300 ease-in-out relative ${
            isOpen ? "" : "w-0 border-l-0"
          }`}
          style={isOpen ? { width: panelWidth } : undefined}
        >
          {/* Drag handle — 6px wide hit area on the left edge */}
          {isOpen && (
            <div
              onMouseDown={handleMouseDown}
              className="absolute left-0 top-0 bottom-0 w-[6px] -ml-[3px] cursor-col-resize z-20 group"
            >
              <div className="absolute left-[2px] top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-primary/30 group-active:bg-primary/50 transition-colors" />
            </div>
          )}
          <div className="h-full overflow-hidden" style={{ width: panelWidth }}>
            {panel}
          </div>
        </div>
      </div>
    </div>
  )
}
