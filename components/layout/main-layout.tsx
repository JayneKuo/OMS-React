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

export function MainLayout({ children, sidebarItems, moduleName }: MainLayoutProps) {
  const { isOpen } = useAiAssistant()

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
        {/* AI Assistant — inline right panel */}
        <div
          className={`shrink-0 overflow-hidden border-l bg-background transition-[width] duration-300 ease-in-out ${
            isOpen ? "w-[400px]" : "w-0 border-l-0"
          }`}
        >
          <div className="h-full w-[400px]">
            <AiAssistantPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
