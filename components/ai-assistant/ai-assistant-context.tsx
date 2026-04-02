"use client"

import * as React from "react"

// ─── Types ───
export interface AiMessage {
  id: string
  role: "ai" | "user"
  content: string
  timestamp: Date
  isLoading?: boolean
}

export interface Conversation {
  id: string
  title: string
  messages: AiMessage[]
  createdAt: Date
  updatedAt: Date
}

interface AiAssistantContextType {
  // Panel open/close
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  // Conversations
  conversations: Conversation[]
  activeConversationId: string | null
  activeConversation: Conversation | null
  createConversation: () => string
  selectConversation: (id: string) => void
  deleteConversation: (id: string) => void
  addMessage: (msg: AiMessage) => void
  updateMessages: (updater: (prev: AiMessage[]) => AiMessage[]) => void
  // History view
  showHistory: boolean
  setShowHistory: (v: boolean) => void
}

const AiAssistantContext = React.createContext<AiAssistantContextType | undefined>(undefined)

/** Generate a title from the first user message */
function deriveTitle(messages: AiMessage[]): string {
  const first = messages.find((m) => m.role === "user")
  if (!first) return "新对话"
  const text = first.content.slice(0, 30)
  return text.length < first.content.length ? text + "..." : text
}

const STORAGE_KEY = "oms-ai-conversations"

function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Conversation[]
    return parsed.map((c) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      messages: c.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })),
    }))
  } catch {
    return []
  }
}

function saveConversations(convos: Conversation[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convos))
  } catch { /* quota exceeded — silently ignore */ }
}

export function AiAssistantProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [conversations, setConversations] = React.useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null)
  const [showHistory, setShowHistory] = React.useState(false)
  const [hydrated, setHydrated] = React.useState(false)

  // Hydrate from localStorage on mount
  React.useEffect(() => {
    const loaded = loadConversations()
    setConversations(loaded)
    setHydrated(true)
  }, [])

  // Persist to localStorage on change (after hydration)
  React.useEffect(() => {
    if (hydrated) saveConversations(conversations)
  }, [conversations, hydrated])

  const open = React.useCallback(() => setIsOpen(true), [])
  const close = React.useCallback(() => setIsOpen(false), [])
  const toggle = React.useCallback(() => setIsOpen((p) => !p), [])

  const activeConversation = React.useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  )

  const createConversation = React.useCallback(() => {
    const id = `conv-${Date.now()}`
    const now = new Date()
    const conv: Conversation = { id, title: "新对话", messages: [], createdAt: now, updatedAt: now }
    setConversations((prev) => [conv, ...prev])
    setActiveConversationId(id)
    setShowHistory(false)
    return id
  }, [])

  const selectConversation = React.useCallback((id: string) => {
    setActiveConversationId(id)
    setShowHistory(false)
  }, [])

  const deleteConversation = React.useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (activeConversationId === id) setActiveConversationId(null)
    },
    [activeConversationId]
  )

  const addMessage = React.useCallback(
    (msg: AiMessage) => {
      if (!activeConversationId) return
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConversationId) return c
          const updated = { ...c, messages: [...c.messages, msg], updatedAt: new Date() }
          updated.title = deriveTitle(updated.messages)
          return updated
        })
      )
    },
    [activeConversationId]
  )

  const updateMessages = React.useCallback(
    (updater: (prev: AiMessage[]) => AiMessage[]) => {
      if (!activeConversationId) return
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConversationId) return c
          const newMsgs = updater(c.messages)
          const updated = { ...c, messages: newMsgs, updatedAt: new Date() }
          updated.title = deriveTitle(updated.messages)
          return updated
        })
      )
    },
    [activeConversationId]
  )

  const value = React.useMemo<AiAssistantContextType>(
    () => ({
      isOpen, open, close, toggle,
      conversations, activeConversationId, activeConversation,
      createConversation, selectConversation, deleteConversation,
      addMessage, updateMessages,
      showHistory, setShowHistory,
    }),
    [
      isOpen, open, close, toggle,
      conversations, activeConversationId, activeConversation,
      createConversation, selectConversation, deleteConversation,
      addMessage, updateMessages,
      showHistory,
    ]
  )

  return (
    <AiAssistantContext.Provider value={value}>
      {children}
    </AiAssistantContext.Provider>
  )
}

export function useAiAssistant() {
  const context = React.useContext(AiAssistantContext)
  if (!context) throw new Error("useAiAssistant must be used within AiAssistantProvider")
  return context
}
