"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function TestSelectPage() {
  const [channelSku, setChannelSku] = React.useState("")
  const [warehouseSku, setWarehouseSku] = React.useState("")
  const [customSku, setCustomSku] = React.useState("")

  const channelSkus = ["AMZ-US-12345", "AMZ-UK-67890", "SHOP-67890", "EBAY-11111"]
  const warehouseSkus = ["WH-US-W-001", "WH-US-E-002", "WH-EU-C-002", "WH-AP-003"]

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Select Test</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Testing Select component with custom input option
        </p>
      </div>

      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <label className="text-sm font-medium">Channel SKU (Dropdown Only)</label>
          <Select value={channelSku} onValueChange={setChannelSku}>
            <SelectTrigger>
              <SelectValue placeholder="Select channel SKU" />
            </SelectTrigger>
            <SelectContent>
              {channelSkus.map((sku) => (
                <SelectItem key={sku} value={sku}>{sku}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Selected: {channelSku || "None"}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Warehouse SKU (Dropdown + Custom)</label>
          <div className="flex gap-2">
            <Select value={warehouseSku} onValueChange={setWarehouseSku}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select warehouse SKU" />
              </SelectTrigger>
              <SelectContent>
                {warehouseSkus.map((sku) => (
                  <SelectItem key={sku} value={sku}>{sku}</SelectItem>
                ))}
                <SelectItem value="__custom__">Custom...</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {warehouseSku === "__custom__" && (
            <Input
              placeholder="Enter custom SKU"
              value={customSku}
              onChange={(e) => setCustomSku(e.target.value)}
            />
          )}
          <p className="text-xs text-muted-foreground">
            Selected: {warehouseSku === "__custom__" ? customSku : warehouseSku || "None"}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Or Just Use Input</label>
          <Input
            placeholder="Type any SKU"
            list="sku-suggestions"
          />
          <datalist id="sku-suggestions">
            {warehouseSkus.map((sku) => (
              <option key={sku} value={sku} />
            ))}
          </datalist>
          <p className="text-xs text-muted-foreground">
            This uses native HTML datalist for suggestions
          </p>
        </div>
      </div>
    </div>
  )
}
