"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Package, Truck, CreditCard, FileText, MapPin, Calendar } from "lucide-react"

interface LineItem {
  id: string
  lineNo: number
  skuCode: string
  skuName: string
  specifications: string
  quantity: number
  unit: string
  estimatedUnitPrice: number
  supplier?: string
  supplierCode?: string
  targetWarehouse?: string
  expectedDeliveryDate?: string
  businessPurpose?: string
  projectNo?: string
  notes?: string
}

interface POGenerationData {
  selectedItems: string[]
  supplierInfo: {
    name: string
    code: string
    contact: string
    phone: string
    email: string
  }
  shippingAddress: {
    country: string
    state: string
    city: string
    address1: string
    address2: string
    zipCode: string
    contact: string
    phone: string
  }
  paymentMethod: string
  shippingMethod: string
  tradeTerms: string
  buyerNotes: string
  latestShipDate: string
}

interface POGenerationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lineItems: LineItem[]
  prNo: string
  onConfirm: (data: POGenerationData) => void
}

export function POGenerationDialog({
  open,
  onOpenChange,
  lineItems,
  prNo,
  onConfirm,
}: POGenerationDialogProps) {
  const [selectedItems, setSelectedItems] = React.useState<string[]>([])
  const [supplierInfo, setSupplierInfo] = React.useState({
    name: "",
    code: "",
    contact: "",
    phone: "",
    email: "",
  })
  const [shippingAddress, setShippingAddress] = React.useState({
    country: "United States",
    state: "",
    city: "",
    address1: "",
    address2: "",
    zipCode: "",
    contact: "",
    phone: "",
  })
  const [paymentMethod, setPaymentMethod] = React.useState("")
  const [shippingMethod, setShippingMethod] = React.useState("")
  const [tradeTerms, setTradeTerms] = React.useState("")
  const [buyerNotes, setBuyerNotes] = React.useState("")
  const [latestShipDate, setLatestShipDate] = React.useState("")

  // 按供应商分组商品行
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, LineItem[]> = {}
    lineItems.forEach(item => {
      const supplier = item.supplier || "未指定供应商"
      if (!groups[supplier]) {
        groups[supplier] = []
      }
      groups[supplier].push(item)
    })
    return groups
  }, [lineItems])

  // 检查是否所有必填信息都已填写
  const isFormValid = () => {
    return (
      selectedItems.length > 0 &&
      supplierInfo.name &&
      supplierInfo.contact &&
      shippingAddress.state &&
      shippingAddress.city &&
      shippingAddress.address1 &&
      shippingAddress.contact &&
      paymentMethod &&
      shippingMethod &&
      tradeTerms &&
      latestShipDate
    )
  }

  const handleConfirm = () => {
    if (!isFormValid()) return

    onConfirm({
      selectedItems,
      supplierInfo,
      shippingAddress,
      paymentMethod,
      shippingMethod,
      tradeTerms,
      buyerNotes,
      latestShipDate,
    })
    onOpenChange(false)
  }

  const handleSelectAll = (supplier: string) => {
    const supplierItems = groupedItems[supplier]
    const supplierItemIds = supplierItems.map(item => item.id)
    const allSelected = supplierItemIds.every(id => selectedItems.includes(id))
    
    if (allSelected) {
      setSelectedItems(prev => prev.filter(id => !supplierItemIds.includes(id)))
    } else {
      setSelectedItems(prev => [...new Set([...prev, ...supplierItemIds])])
    }
  }

  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            生成采购订单 (PO)
          </DialogTitle>
          <DialogDescription>
            PR编号: {prNo} - 请选择商品行并补充必要信息
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 商品行选择 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">选择商品行</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(groupedItems).map(([supplier, items]) => (
                <div key={supplier} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{supplier}</Badge>
                      <span className="text-sm text-muted-foreground">
                        ({items.length} 个商品)
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectAll(supplier)}
                    >
                      {items.every(item => selectedItems.includes(item.id)) ? "取消全选" : "全选"}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center space-x-3 p-2 border rounded">
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => handleItemSelect(item.id)}
                        />
                        <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="font-medium">{item.skuCode}</div>
                            <div className="text-muted-foreground">{item.skuName}</div>
                          </div>
                          <div>{item.specifications}</div>
                          <div>{item.quantity} {item.unit}</div>
                          <div>${item.estimatedUnitPrice.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 供应商信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                供应商信息 *
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierName">供应商名称 *</Label>
                <Input
                  id="supplierName"
                  value={supplierInfo.name}
                  onChange={(e) => setSupplierInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="输入供应商名称"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierCode">供应商代码</Label>
                <Input
                  id="supplierCode"
                  value={supplierInfo.code}
                  onChange={(e) => setSupplierInfo(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="输入供应商代码"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierContact">联系人 *</Label>
                <Input
                  id="supplierContact"
                  value={supplierInfo.contact}
                  onChange={(e) => setSupplierInfo(prev => ({ ...prev, contact: e.target.value }))}
                  placeholder="输入联系人姓名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierPhone">联系电话</Label>
                <Input
                  id="supplierPhone"
                  value={supplierInfo.phone}
                  onChange={(e) => setSupplierInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="输入联系电话"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="supplierEmail">邮箱</Label>
                <Input
                  id="supplierEmail"
                  type="email"
                  value={supplierInfo.email}
                  onChange={(e) => setSupplierInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="输入邮箱地址"
                />
              </div>
            </CardContent>
          </Card>

          {/* 发货地址 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                发货地址 *
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">国家</Label>
                <Select value={shippingAddress.country} onValueChange={(value) => setShippingAddress(prev => ({ ...prev, country: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="China">China</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">州/省 *</Label>
                <Input
                  id="state"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="输入州/省"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">城市 *</Label>
                <Input
                  id="city"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="输入城市"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">邮编</Label>
                <Input
                  id="zipCode"
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="输入邮编"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address1">地址1 *</Label>
                <Input
                  id="address1"
                  value={shippingAddress.address1}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, address1: e.target.value }))}
                  placeholder="输入详细地址"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address2">地址2</Label>
                <Input
                  id="address2"
                  value={shippingAddress.address2}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, address2: e.target.value }))}
                  placeholder="输入补充地址信息（可选）"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingContact">收货联系人 *</Label>
                <Input
                  id="shippingContact"
                  value={shippingAddress.contact}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, contact: e.target.value }))}
                  placeholder="输入收货联系人"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingPhone">联系电话</Label>
                <Input
                  id="shippingPhone"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="输入联系电话"
                />
              </div>
            </CardContent>
          </Card>

          {/* 交易条款 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">交易条款 *</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">付款方式 *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择付款方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T/T">电汇 (T/T)</SelectItem>
                    <SelectItem value="L/C">信用证 (L/C)</SelectItem>
                    <SelectItem value="D/P">付款交单 (D/P)</SelectItem>
                    <SelectItem value="D/A">承兑交单 (D/A)</SelectItem>
                    <SelectItem value="Cash">现金</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingMethod">运输方式 *</Label>
                <Select value={shippingMethod} onValueChange={setShippingMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择运输方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sea">海运</SelectItem>
                    <SelectItem value="Air">空运</SelectItem>
                    <SelectItem value="Express">快递</SelectItem>
                    <SelectItem value="Land">陆运</SelectItem>
                    <SelectItem value="Multimodal">多式联运</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tradeTerms">贸易条款 *</Label>
                <Select value={tradeTerms} onValueChange={setTradeTerms}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择贸易条款" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FOB">FOB (Free On Board)</SelectItem>
                    <SelectItem value="CIF">CIF (Cost, Insurance & Freight)</SelectItem>
                    <SelectItem value="CFR">CFR (Cost & Freight)</SelectItem>
                    <SelectItem value="EXW">EXW (Ex Works)</SelectItem>
                    <SelectItem value="DDP">DDP (Delivered Duty Paid)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="latestShipDate">最晚发货日期 *</Label>
                <Input
                  id="latestShipDate"
                  type="date"
                  value={latestShipDate}
                  onChange={(e) => setLatestShipDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 买方备注 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">买方备注</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={buyerNotes}
                onChange={(e) => setBuyerNotes(e.target.value)}
                placeholder="输入特殊要求或备注信息..."
                className="min-h-[80px]"
              />
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!isFormValid()}>
            生成PO ({selectedItems.length} 个商品)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}