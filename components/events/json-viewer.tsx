"use client"

import * as React from "react"
import { Copy, Check, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface JsonViewerProps {
  data: Record<string, unknown> | unknown
  maxHeight?: string
  className?: string
}

function colorizeJson(json: string): React.ReactNode[] {
  const lines = json.split('\n')
  return lines.map((line, i) => {
    const colored = line
      .replace(/"([^"]+)"(?=\s*:)/g, '<span class="text-blue-500 dark:text-blue-400">"$1"</span>')
      .replace(/:\s*"([^"]*)"/g, ': <span class="text-green-600 dark:text-green-400">"$1"</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-amber-600 dark:text-amber-400">$1</span>')
      .replace(/:\s*(true|false)/g, ': <span class="text-purple-600 dark:text-purple-400">$1</span>')
      .replace(/:\s*(null)/g, ': <span class="text-gray-400">$1</span>')
    return (
      <div
        key={i}
        dangerouslySetInnerHTML={{ __html: colored }}
        className="leading-6"
      />
    )
  })
}

export function JsonViewer({ data, maxHeight = '320px', className }: JsonViewerProps) {
  const [copied, setCopied] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState(false)

  const jsonString = React.useMemo(
    () => JSON.stringify(data, null, 2),
    [data]
  )

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('rounded-md border bg-muted/30', className)}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/50">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed
            ? <ChevronRight className="h-3 w-3" />
            : <ChevronDown className="h-3 w-3" />
          }
          {collapsed ? 'Show JSON' : 'Hide JSON'}
        </button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={handleCopy}
        >
          {copied
            ? <><Check className="h-3 w-3 mr-1 text-green-500" />Copied</>
            : <><Copy className="h-3 w-3 mr-1" />Copy</>
          }
        </Button>
      </div>
      {!collapsed && (
        <ScrollArea style={{ maxHeight }} className="w-full">
          <pre
            className="p-3 text-xs font-mono whitespace-pre leading-relaxed overflow-x-auto"
          >
            {colorizeJson(jsonString)}
          </pre>
        </ScrollArea>
      )}
    </div>
  )
}
