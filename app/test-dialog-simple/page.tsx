"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

export default function TestDialogSimplePage() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">测试 Dialog</h1>
      <Button onClick={() => setOpen(true)}>打开 Dialog</Button>
      
      <p className="mt-4">Dialog 状态: {open ? "打开" : "关闭"}</p>
    </div>
  )
}
