"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/components/i18n-provider"
import { createPurchaseSidebarItems } from "@/lib/purchase-sidebar-items"
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Send,
  Building2,
  MapPin,
  Package,
  Truck,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"

interface LineItem {
  id: string
  lineNo: number
  skuCode: string
  productName: string
  specifications: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  expectedDeliveryDate: string
  notes: string
}

interface ShippingAddress {
  contactName: string
  contactPhone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export default function FactoryDirectPOCreatePage() {
  const router = useRouter()
  const { t } = useI18n()
  const sidebarItems = React.useMemo(() => createPurchaseSidebarItems(t), [t])

  // Basic Information
  const [poNo, setPoNo] = React.useState("")
  const [supplierName, setSupplierName] = React.useState("")
  const [supplierContact, setSupplierContact] = React.useState("")
  const [supplierPhone, setSupplierPhone] = React.useState("")
  const [currency, setCurrency] = React.useState("USD")
  const [paymentTerms, setPaymentTerms] = React.useState("")
  const [notes, setNotes] = React.useState("")

  // Shipping Information
  const [shippingMethod, setShippingMethod] = React.useState("")
  const [shippingCarrier, setShippingCarrier] = React.useState("")
  const [trackingNumber, setTrackingNumber] = React.useState("")
  const [estimatedShipDate, setEstimatedShipDate] = React.useState("")
  const [estimatedArrivalDate, setEstimatedArrivalDate] = React.useState("")

  // Customer Shipping Address
  const [customerAddress, setCustomerAddress] = React.useState<ShippingAddress>({
    contactName: "",
    contactPhone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA"
  })

  // Line Items
  const [lineItems, setLineItems] = React.useState<LineItem[]>([
    {
      id: "1",
      lineNo: 1,
      skuCode: "",
      productName: "",
      specifications: "",
      quantity: 0,
      unit: "PCS",
      unitPrice: 0,
      totalPrice: 0,
      expectedDeliveryDate: "",
      notes: ""
    }
  ])

  // Calculate totals
  const subtotal = React.useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.totalPrice, 0)
  }, [lineItems])

  const totalQuantity = React.useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.quantity, 0)
  }, [lineItems])

  // Add new line item
  const handleAddLineItem = () => {
    const newLineNo = Math.max(...lineItems.map(item => item.lineNo), 0) + 1
    setLineItems([
      ...lineItems,
      {
        id: Date.now().toString(),
        lineNo: newLineNo,
        skuCode: "",
        productName: "",
        specifications: "",
        quantity: 0,
        unit: "PCS",
        unitPrice: 0,
        totalPrice: 0,
        expectedDeliveryDate: "",
        notes: ""
      }
    ])
  }

  // Remove line item
  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length === 1) {
      toast.error("至少需要保留一个商品行")
      return
    }
    setLineItems(lineItems.filter(item => item.id !== id))
  }

  // Update line item
  const handleUpdateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        // Auto-calculate total price
        if (field === 'quantity' || field === 'unitPrice') {
          updated.totalPrice = updated.quantity * updated.unitPrice
        }
        return updated
      }
      return item
    }))
  }

  // Validate form
  const validateForm = () => {
    if (!supplierName) {
      toast.error("请填写供应商名称")
      return false
    }
    if (!customerAddress.contactName || !customerAddress.address) {
      toast.error("请填写完整的客户收货地址")
      return false
    }
    if (lineItems.some(item => !item.skuCode || !item.productName || item.quantity <= 0)) {
      toast.error("请填写完整的商品信息")
      return false
    }
    return true
  }

  // Save as draft
  const handleSaveDraft = () => {
    if (!validateForm()) return
    
    console.log("Save as draft:", {
      poNo,
      supplierName,
      supplierContact,
      supplierPhone,
      currency,
      paymentTerms,
      shippingMethod,
      shippingCarrier,
      trackingNumber,
      estimatedShipDate,
      estimatedArrivalDate,
      customerAddress,
      lineItems,
      subtotal,
      notes
    })
    
    toast.success("草稿已保存")
  }

  // Submit PO
  const handleSubmit = () => {
    if (!validateForm()) return
    
    console.log("Submit PO:", {
      poNo,
      supplierName,
      supplierContact,
      supplierPhone,
      currency,
      paymentTerms,
      shippingMethod,
      shippingCarrier,
      trackingNumber,
      estimatedShipDate,
      estimatedArrivalDate,
      customerAddress,
      lineItems,
      subtotal,
      notes
    })
    
    toast.success("工厂直发PO已创建")
    router.push("/purchase/po")
  }

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">创建工厂直发PO</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Factory Direct Purchase Order - 商品直接从工厂发货到客户
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              保存草稿
            </Button>
            <Button onClick={handleSubmit}>
              <Send className="mr-2 h-4 w-4" />
              提交PO
            </Button>
          </div>
        </div>

        {/* Alert Banner */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  工厂直发模式说明
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  此PO类型用于商品直接从供应商工厂发货到最终客户地址，不经过公司仓库。请确保填写准确的客户收货地址和物流信息。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  基本信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="poNo">PO编号</Label>
                    <Input
                      id="poNo"
                      placeholder="自动生成或手动输入"
                      value={poNo}
                      onChange={(e) => setPoNo(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">币种 *</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - 美元</SelectItem>
                        <SelectItem value="CNY">CNY - 人民币</SelectItem>
                        <SelectItem value="EUR">EUR - 欧元</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    供应商信息
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="supplierName">供应商名称 *</Label>
                      <Input
                        id="supplierName"
                        placeholder="输入供应商名称"
                        value={supplierName}
                        onChange={(e) => setSupplierName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplierContact">联系人</Label>
                      <Input
                        id="supplierContact"
                        placeholder="输入联系人姓名"
                        value={supplierContact}
                        onChange={(e) => setSupplierContact(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplierPhone">联系电话</Label>
                      <Input
                        id="supplierPhone"
                        placeholder="输入联系电话"
                        value={supplierPhone}
                        onChange={(e) => setSupplierPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentTerms">付款条款</Label>
                      <Input
                        id="paymentTerms"
                        placeholder="例如: Net 30"
                        value={paymentTerms}
                        onChange={(e) => setPaymentTerms(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  客户收货地址
                  <Badge variant="outline" className="ml-2">直发地址</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">收货人 *</Label>
                    <Input
                      id="contactName"
                      placeholder="输入收货人姓名"
                      value={customerAddress.contactName}
                      onChange={(e) => setCustomerAddress({...customerAddress, contactName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">联系电话 *</Label>
                    <Input
                      id="contactPhone"
                      placeholder="输入联系电话"
                      value={customerAddress.contactPhone}
                      onChange={(e) => setCustomerAddress({...customerAddress, contactPhone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">详细地址 *</Label>
                  <Input
                    id="address"
                    placeholder="街道地址"
                    value={customerAddress.address}
                    onChange={(e) => setCustomerAddress({...customerAddress, address: e.target.value})}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">城市 *</Label>
                    <Input
                      id="city"
                      placeholder="城市"
                      value={customerAddress.city}
                      onChange={(e) => setCustomerAddress({...customerAddress, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">州/省</Label>
                    <Input
                      id="state"
                      placeholder="州/省"
                      value={customerAddress.state}
                      onChange={(e) => setCustomerAddress({...customerAddress, state: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">邮编</Label>
                    <Input
                      id="zipCode"
                      placeholder="邮编"
                      value={customerAddress.zipCode}
                      onChange={(e) => setCustomerAddress({...customerAddress, zipCode: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">国家 *</Label>
                    <Select 
                      value={customerAddress.country} 
                      onValueChange={(value) => setCustomerAddress({...customerAddress, country: value})}
                    >
                      <SelectTrigger id="country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USA">USA</SelectItem>
                        <SelectItem value="China">China</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  物流信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="shippingMethod">运输方式</Label>
                    <Select value={shippingMethod} onValueChange={setShippingMethod}>
                      <SelectTrigger id="shippingMethod">
                        <SelectValue placeholder="选择运输方式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="express">快递</SelectItem>
                        <SelectItem value="air">空运</SelectItem>
                        <SelectItem value="sea">海运</SelectItem>
                        <SelectItem value="land">陆运</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingCarrier">承运商</Label>
                    <Input
                      id="shippingCarrier"
                      placeholder="例如: FedEx, UPS"
                      value={shippingCarrier}
                      onChange={(e) => setShippingCarrier(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trackingNumber">追踪单号</Label>
                    <Input
                      id="trackingNumber"
                      placeholder="物流追踪号"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedShipDate">预计发货日期</Label>
                    <Input
                      id="estimatedShipDate"
                      type="date"
                      value={estimatedShipDate}
                      onChange={(e) => setEstimatedShipDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="estimatedArrivalDate">预计到达日期</Label>
                    <Input
                      id="estimatedArrivalDate"
                      type="date"
                      value={estimatedArrivalDate}
                      onChange={(e) => setEstimatedArrivalDate(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    商品明细
                  </CardTitle>
                  <Button size="sm" onClick={handleAddLineItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    添加商品
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {lineItems.map((item, index) => (
                  <Card key={item.id} className="border-muted">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">行 {item.lineNo}</Badge>
                          {lineItems.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveLineItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>SKU代码 *</Label>
                            <Input
                              placeholder="输入SKU代码"
                              value={item.skuCode}
                              onChange={(e) => handleUpdateLineItem(item.id, 'skuCode', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>商品名称 *</Label>
                            <Input
                              placeholder="输入商品名称"
                              value={item.productName}
                              onChange={(e) => handleUpdateLineItem(item.id, 'productName', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>规格说明</Label>
                          <Input
                            placeholder="颜色、尺寸等规格信息"
                            value={item.specifications}
                            onChange={(e) => handleUpdateLineItem(item.id, 'specifications', e.target.value)}
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-4">
                          <div className="space-y-2">
                            <Label>数量 *</Label>
                            <Input
                              type="number"
                              min="0"
                              value={item.quantity || ''}
                              onChange={(e) => handleUpdateLineItem(item.id, 'quantity', Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>单位</Label>
                            <Select 
                              value={item.unit} 
                              onValueChange={(value) => handleUpdateLineItem(item.id, 'unit', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PCS">PCS</SelectItem>
                                <SelectItem value="BOX">BOX</SelectItem>
                                <SelectItem value="CTN">CTN</SelectItem>
                                <SelectItem value="KG">KG</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>单价 *</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice || ''}
                              onChange={(e) => handleUpdateLineItem(item.id, 'unitPrice', Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>小计</Label>
                            <Input
                              value={item.totalPrice.toFixed(2)}
                              disabled
                              className="bg-muted"
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>期望交货日期</Label>
                            <Input
                              type="date"
                              value={item.expectedDeliveryDate}
                              onChange={(e) => handleUpdateLineItem(item.id, 'expectedDeliveryDate', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>备注</Label>
                            <Input
                              placeholder="商品备注"
                              value={item.notes}
                              onChange={(e) => handleUpdateLineItem(item.id, 'notes', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>备注说明</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="输入PO备注信息..."
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  订单汇总
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">商品行数</span>
                    <span className="font-medium">{lineItems.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">总数量</span>
                    <span className="font-medium">{totalQuantity}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">小计</span>
                    <span className="text-lg font-semibold">
                      {currency} {subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">配送信息</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• 配送模式: 工厂直发</p>
                    <p>• 收货人: {customerAddress.contactName || '-'}</p>
                    <p>• 收货地址: {customerAddress.city || '-'}</p>
                    {estimatedArrivalDate && (
                      <p>• 预计到达: {estimatedArrivalDate}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
