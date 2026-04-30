"use client"

import * as React from "react"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from "recharts"

// 图表配色（遵循 Design System 语义色）
const COLORS = [
  "hsl(var(--primary))",
  "#F97316",  // orange
  "#15803D",  // green
  "#3B82F6",  // blue
  "#EF4444",  // red
  "#8B5CF6",  // violet
  "#EC4899",  // pink
  "#14B8A6",  // teal
]

export interface ChartData {
  type: "bar" | "line" | "pie" | "metric" | "table"
  title?: string
  data: Array<Record<string, unknown>>
  xKey?: string
  yKey?: string
  unit?: string
}

/** 从 AI 回复中解析 :::chart ... ::: 块 */
export function parseCharts(content: string): { text: string; charts: ChartData[] } {
  const charts: ChartData[] = []
  const text = content.replace(/:::chart\s*\n?([\s\S]*?)\n?:::/g, (_, json) => {
    try {
      const parsed = JSON.parse(json.trim())
      charts.push(parsed)
      return "" // 从文本中移除图表块
    } catch {
      return json // 解析失败保留原文
    }
  })
  return { text: text.trim(), charts }
}

/** 渲染单个图表 */
export function ChatChart({ chart }: { chart: ChartData }) {
  const data = chart.data || []
  if (!data.length) return null

  // 自动检测 key
  const keys = Object.keys(data[0])
  const xKey = chart.xKey || keys.find(k => typeof data[0][k] === "string") || keys[0]
  const yKey = chart.yKey || keys.find(k => typeof data[0][k] === "number") || keys[1]

  return (
    <div className="my-2 rounded-lg border border-border/50 bg-card p-3">
      {chart.title && (
        <p className="text-xs font-medium mb-2 text-foreground">{chart.title}</p>
      )}

      {chart.type === "bar" && (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Bar dataKey={yKey} radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {chart.type === "line" && (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Line type="monotone" dataKey={yKey} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}

      {chart.type === "pie" && (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} dataKey={yKey as string} nameKey={xKey} cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      )}

      {chart.type === "metric" && (
        <div className="flex items-center gap-4 py-2">
          {data.map((item, i) => {
            const label = item[xKey] as string
            const value = item[yKey]
            return (
              <div key={i} className="flex-1 text-center">
                <p className="text-2xl font-bold text-primary">{String(value)}{chart.unit || ""}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
              </div>
            )
          })}
        </div>
      )}

      {chart.type === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                {keys.map(k => (
                  <th key={k} className="text-left px-2 py-1 font-medium text-muted-foreground">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b border-border/30">
                  {keys.map(k => (
                    <td key={k} className="px-2 py-1">{String(row[k] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
