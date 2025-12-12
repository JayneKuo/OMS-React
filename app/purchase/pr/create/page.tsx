"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, ShoppingCart, Truck, Package, CheckCircle, Plus, Trash2, Save, Send, ArrowLeft, ShoppingBag, Settings, Building } from "lucide-react"
import { ProductSelectionDialog } from "@/components/purchase/product-selection-dialog"
import { SNLotManagementDialog } from "@/components/purchase/sn-lot-management-dialog"
import { SupplierQuoteDialog } from "@/components/purchase/supplier-quote-dialog"
import { SupplierInfoCard } from "@/components/purchase/supplier-info-card"
import { QuoteFileManager } from "@/components/purchase/quote-file-manager"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useI18n } from "@/components/i18n-provider"

const sidebarItems = [
  { title: "PR (Purchase Request)", href: "/purchase/pr", icon: <FileText className="h-4 w-4" /> },
  { title: "PO (Purchase Order)", href: "/purchase/po", icon: <ShoppingCart className="h-4 w-4" /> },
  { title: "ASN (Advance Ship Notice)", href: "/purchase/asn", icon: <Truck className="h-4 w-4" /> },
  { title: "Receipts", href: "/purchase/receipts", icon: <Package className="h-4 w-4" /> },
  { title: "Receipt Confirm", href: "/purchase/receipt-confirm", icon: <CheckCircle className="h-4 w-4" /> },
]

// PR Line Item Interface - 优化后的字段
interface PRLineItem {
  id: string
  lineNo: number
  productId: string // 商品ID
  skuCode: string
  productName: string // 商品名称
  specifications: string
  quantity: number
  uom: string // 单位 (Unit of Measure)
  currency: string // 币种
  unitPrice: number // 单价
  costPrice: number // 成本价
  taxRate: number // 税率 (%)
  taxAmount: number // 税额
  totalAmount: number // 含税总额
  businessPurpose: string
  notes: string
  // 供应商信息
  preferredSupplier?: string // 供应商
  supplierQuotePrice?: number // 供应商报价
  quoteValidDate?: string // 报价有效期
  quoteAttachment?: string // 询价文件附件
  // SN/批次管理字段
  requiresSerialNumber: boolean // 是否需要序列号管理
  requiresLotNumber: boolean // 是否需要批次号管理
  specifiedSerialNumbers?: string[] // 指定的序列号列表
  specifiedLotNumbers?: string[] // 指定的批次号列表
  snLotNotes?: string // SN/批次备注说明
  // 供应商详细信息
  supplierInfo?: {
    supplierId?: string
    supplierName?: string
    supplierCode?: string
    contactPerson?: string
    contactPhone?: string
    contactEmail?: string
    address?: string
    expectedDeliveryDate?: string
    shippingDate?: string
    targetWarehouse?: string
    warehouseName?: string
    warehouseAddress?: string
    deliveryTerms?: string
    paymentTerms?: string
    notes?: string
  }
}

// 商品数据接口
interface Product {
  id: string
  sku: string
  productName: string
  specifications: string
  uom: string
  unitPrice: number
  costPrice: number
  category: string
  brand: string
  inStock: boolean
  // 追溯管理标识
  requiresSerialNumber: boolean // 是否需要序列号管理
  requiresLotNumber: boolean // 是否需要批次号管理
  shelfLife?: number // 保质期（天数）
}

export default function CreatePRPage() {
  const { t } = useI18n()
  // Header form state
  const [prNumber, setPrNumber] = React.useState(`PR${new Date().getFullYear()}${String(Date.now()).slice(-8)}`) // 自动生成PR编号
  const [department, setDepartment] = React.useState("")
  const [requester, setRequester] = React.useState("张三") // Default to current user
  const [prType, setPrType] = React.useState("")
  const [priority, setPriority] = React.useState("NORMAL")
  const [budgetProject, setBudgetProject] = React.useState("")
  const [notes, setNotes] = React.useState("")
  
  // 交付要求信息
  const [deliveryRequirements, setDeliveryRequirements] = React.useState({
    targetWarehouse: "",
    expectedDeliveryDate: "",
    latestShipDate: "", // 最晚发货日期
    country: "United States",
    state: "",
    city: "",
    address1: "",
    address2: "",
    zipCode: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    deliveryNotes: "",
  })

  // Line items state
  const [lineItems, setLineItems] = React.useState<PRLineItem[]>([])
  const [nextLineNo, setNextLineNo] = React.useState(1)
  
  // Product selection dialog state
  const [showProductDialog, setShowProductDialog] = React.useState(false)
  
  // SN/Lot management dialog state
  const [showSNLotDialog, setShowSNLotDialog] = React.useState(false)
  const [currentSNLotItem, setCurrentSNLotItem] = React.useState<PRLineItem | null>(null)
  
  // Supplier quote dialog state
  const [showSupplierDialog, setShowSupplierDialog] = React.useState(false)
  const [currentSupplierItem, setCurrentSupplierItem] = React.useState<PRLineItem | null>(null)
  
  // 批量设置状态
  const [showBatchSettings, setShowBatchSettings] = React.useState(false)
  const [batchSettings, setBatchSettings] = React.useState({
    currency: "",
    taxRate: "",
    preferredSupplier: "",
  })

  // Quote file management state
  const [quoteFiles, setQuoteFiles] = React.useState<any[]>([
    {
      id: "1",
      fileName: "Apple_Quote_2024.pdf",
      fileSize: "2.3 MB",
      uploadDate: "2024-01-15",
      supplierName: "Apple Inc.",
      fileType: "PDF",
      description: "iPhone 15 Pro 报价单",
      status: "APPROVED"
    },
    {
      id: "2", 
      fileName: "Samsung_Quote_2024.xlsx",
      fileSize: "1.8 MB",
      uploadDate: "2024-01-12",
      supplierName: "Samsung Electronics",
      fileType: "Excel",
      description: "批量采购报价",
      status: "PENDING"
    }
  ])
  
  const [quoteRequests, setQuoteRequests] = React.useState<any[]>([
    {
      id: "1",
      supplierName: "Dell Technologies",
      requestDate: "2024-01-10",
      dueDate: "2024-01-20",
      status: "SENT",
      notes: "笔记本电脑批量采购询价"
    },
    {
      id: "2",
      supplierName: "Sony Corporation", 
      requestDate: "2024-01-08",
      dueDate: "2024-01-18",
      status: "RECEIVED",
      notes: "音响设备询价"
    }
  ])

  // 从商品选择对话框添加商品
  const handleProductsSelected = (products: Product[]) => {
    const defaultTaxRate = 13 // 默认税率13%（可根据业务需求调整）
    
    const newItems: PRLineItem[] = products.map(product => {
      const taxAmount = product.unitPrice * (defaultTaxRate / 100)
      const totalAmount = product.unitPrice + taxAmount
      
      return {
        id: `line-${Date.now()}-${product.id}`,
        lineNo: nextLineNo + lineItems.length + products.indexOf(product),
        productId: product.id,
        skuCode: product.sku,
        productName: product.productName,
        specifications: product.specifications,
        quantity: 1,
        uom: product.uom,
        currency: "USD", // 默认币种
        unitPrice: product.unitPrice,
        costPrice: product.costPrice,
        taxRate: defaultTaxRate,
        taxAmount: taxAmount,
        totalAmount: totalAmount,
        businessPurpose: "",
        notes: "",
        // 供应商信息（PR级别管理，商品行不再单独管理）
        preferredSupplier: "",
        supplierQuotePrice: 0,
        quoteValidDate: "",
        quoteAttachment: "",
        // 从商品属性继承SN/批次管理要求
        requiresSerialNumber: product.requiresSerialNumber,
        requiresLotNumber: product.requiresLotNumber,
        specifiedSerialNumbers: [],
        specifiedLotNumbers: [],
        snLotNotes: "",
        // 初始化供应商信息
        supplierInfo: {
          supplierId: "",
          supplierName: "",
          supplierCode: "",
          contactPerson: "",
          contactPhone: "",
          contactEmail: "",
          address: "",
          expectedDeliveryDate: "",
          shippingDate: "",
          targetWarehouse: "",
          warehouseName: "",
          warehouseAddress: "",
          deliveryTerms: "",
          paymentTerms: "",
          notes: "",
        },
      }
    })
    
    setLineItems([...lineItems, ...newItems])
    setNextLineNo(nextLineNo + newItems.length)
  }

  // Remove line item
  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id))
  }

  // 打开SN/批次管理对话框
  const openSNLotDialog = (item: PRLineItem) => {
    setCurrentSNLotItem(item)
    setShowSNLotDialog(true)
  }

  // 保存SN/批次设置
  const handleSNLotSave = (data: {
    specifiedSerialNumbers: string[]
    specifiedLotNumbers: string[]
    snLotNotes: string
  }) => {
    if (currentSNLotItem) {
      updateLineItem(currentSNLotItem.id, "specifiedSerialNumbers", data.specifiedSerialNumbers)
      updateLineItem(currentSNLotItem.id, "specifiedLotNumbers", data.specifiedLotNumbers)
      updateLineItem(currentSNLotItem.id, "snLotNotes", data.snLotNotes)
    }
  }

  // 打开供应商询价对话框
  const openSupplierDialog = (item: PRLineItem) => {
    setCurrentSupplierItem(item)
    setShowSupplierDialog(true)
  }

  // 保存供应商询价设置
  const handleSupplierSave = (data: {
    preferredSupplier: string
    supplierQuotePrice: number
    quoteValidDate: string
    quoteAttachment: string
  }) => {
    if (currentSupplierItem) {
      updateLineItem(currentSupplierItem.id, "preferredSupplier", data.preferredSupplier)
      updateLineItem(currentSupplierItem.id, "supplierQuotePrice", data.supplierQuotePrice)
      updateLineItem(currentSupplierItem.id, "quoteValidDate", data.quoteValidDate)
      updateLineItem(currentSupplierItem.id, "quoteAttachment", data.quoteAttachment)
    }
  }



  // 批量应用设置
  const applyBatchSettings = () => {
    lineItems.forEach(item => {
      if (batchSettings.currency) {
        updateLineItem(item.id, "currency", batchSettings.currency)
      }
      if (batchSettings.taxRate) {
        updateLineItem(item.id, "taxRate", parseFloat(batchSettings.taxRate))
      }
      if (batchSettings.preferredSupplier) {
        updateLineItem(item.id, "preferredSupplier", batchSettings.preferredSupplier)
      }
    })
    setShowBatchSettings(false)
    setBatchSettings({ currency: "", taxRate: "", preferredSupplier: "" })
  }

  // 处理文件上传
  const handleFileUpload = (files: FileList) => {
    Array.from(files).forEach(file => {
      const newFile = {
        id: Date.now().toString(),
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        supplierName: "待指定",
        fileType: file.name.split('.').pop()?.toUpperCase() || "UNKNOWN",
        description: "",
        status: "PENDING"
      }
      setQuoteFiles(prev => [...prev, newFile])
    })
  }

  // 删除文件
  const handleFileDelete = (fileId: string) => {
    setQuoteFiles(prev => prev.filter(f => f.id !== fileId))
  }

  // 添加询价请求
  const handleQuoteRequestAdd = (request: any) => {
    const newRequest = {
      ...request,
      id: Date.now().toString()
    }
    setQuoteRequests(prev => [...prev, newRequest])
  }

  // 更新询价请求
  const handleQuoteRequestUpdate = (requestId: string, updates: any) => {
    setQuoteRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, ...updates } : req
    ))
  }

  // 计算税额和总额的辅助函数
  const calculateTaxAndTotal = (item: PRLineItem, quantity: number, unitPrice: number, taxRate: number) => {
    const subtotal = quantity * unitPrice
    const taxAmount = subtotal * (taxRate / 100)
    const totalAmount = subtotal + taxAmount
    
    return {
      taxAmount: taxAmount,
      totalAmount: totalAmount
    }
  }

  // Update line item
  const updateLineItem = (id: string, field: keyof PRLineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        
        // 当数量、单价或税率变化时，重新计算税额和总额
        if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
          const { taxAmount, totalAmount } = calculateTaxAndTotal(
            updatedItem,
            field === 'quantity' ? value : updatedItem.quantity,
            field === 'unitPrice' ? value : updatedItem.unitPrice,
            field === 'taxRate' ? value : updatedItem.taxRate
          )
          
          updatedItem.taxAmount = taxAmount
          updatedItem.totalAmount = totalAmount
        }
        
        return updatedItem
      }
      return item
    }))
  }

  // Calculate totals by currency
  const totalItems = lineItems.length
  const totalQuantity = lineItems.reduce((sum, item) => sum + item.quantity, 0)
  
  // 按币种分组计算总额
  const totalsByCurrency = lineItems.reduce((acc, item) => {
    const currency = item.currency
    if (!acc[currency]) {
      acc[currency] = {
        subtotal: 0,
        taxAmount: 0,
        totalAmount: 0
      }
    }
    acc[currency].subtotal += item.quantity * item.unitPrice
    acc[currency].taxAmount += item.quantity * item.taxAmount
    acc[currency].totalAmount += item.quantity * item.totalAmount
    return acc
  }, {} as Record<string, { subtotal: number; taxAmount: number; totalAmount: number }>)

  // Form validation
  const isFormValid = () => {
    return department && requester && lineItems.length > 0 &&
           lineItems.every(item => item.skuCode && item.quantity > 0)
  }

  // Handle save as draft
  const handleSaveDraft = () => {
    console.log("Save as draft:", {
      header: { prNumber, department, requester, prType, priority, budgetProject, notes, deliveryRequirements },
      lineItems,
      totals: { totalItems, totalQuantity, totalsByCurrency }
    })
    // TODO: API call to save draft
  }

  // Handle submit for approval
  const handleSubmit = () => {
    if (!isFormValid()) {
      alert("请填写所有必填字段")
      return
    }
    console.log("Submit for approval:", {
      header: { prNumber, department, requester, prType, priority, budgetProject, notes, deliveryRequirements },
      lineItems,
      totals: { totalItems, totalQuantity, totalsByCurrency }
    })
    // TODO: API call to submit
  }

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('createPurchaseRequest')}</h1>
              <p className="text-muted-foreground">{t('createNewPurchaseRequest')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSaveDraft} className="min-w-[80px]">
              <Save className="mr-2 h-4 w-4" />
              {t('saveDraft')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => console.log("Save")} className="min-w-[60px]">
              <Save className="mr-2 h-4 w-4" />
              {t('save')}
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={!isFormValid()} className="min-w-[90px]">
              <Send className="mr-2 h-4 w-4" />
              {t('saveAndSubmit')}
            </Button>
          </div>
        </div>

        {/* Header Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prNumber">{t('requestNumber')}</Label>
                <Input
                  id="prNumber"
                  value={prNumber}
                  disabled
                  className="bg-muted"
                />
                <div className="text-xs text-muted-foreground">{t('systemGenerated')}</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">{t('departmentBusinessUnit')} *</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectDepartment')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ECOM Dept">ECOM Dept</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Product Team">Product Team</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requester">{t('requesterName')} *</Label>
                <Input
                  id="requester"
                  value={requester}
                  onChange={(e) => setRequester(e.target.value)}
                  placeholder={t('enterRequesterName')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prType">{t('prTypeField')}</Label>
                <Select value={prType} onValueChange={setPrType}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectPRType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="常规采购">{t('regularPurchase')}</SelectItem>
                    <SelectItem value="备货">{t('stockReplenishment')}</SelectItem>
                    <SelectItem value="项目采购">{t('projectPurchase')}</SelectItem>
                    <SelectItem value="内部调拨">{t('internalTransfer')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">{t('priorityField')}</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">{t('normal')}</SelectItem>
                    <SelectItem value="URGENT">{t('urgent')}</SelectItem>
                    <SelectItem value="VERY_URGENT">{t('veryUrgent')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>



              <div className="space-y-2">
                <Label htmlFor="budgetProject">{t('budgetProjectCostCenter')}</Label>
                <Input
                  id="budgetProject"
                  value={budgetProject}
                  onChange={(e) => setBudgetProject(e.target.value)}
                  placeholder="Q1-Marketing"
                />
              </div>
            </div>



            <div className="space-y-2">
              <Label htmlFor="notes">{t('notesField')}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('purchaseBackgroundUsage')}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              {t('deliveryRequirements')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 基本交付信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetWarehouse">{t('targetWarehouse')} *</Label>
                  <Select 
                    value={deliveryRequirements.targetWarehouse} 
                    onValueChange={(value) => setDeliveryRequirements({...deliveryRequirements, targetWarehouse: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectTargetWarehouse')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WH001">Main Warehouse - Los Angeles</SelectItem>
                      <SelectItem value="WH002">East Distribution Center - New York</SelectItem>
                      <SelectItem value="WH003">West Fulfillment Center - Seattle</SelectItem>
                      <SelectItem value="WH004">Central Warehouse - Chicago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expectedDeliveryDate">{t('expectedDeliveryTime')} *</Label>
                  <Input
                    id="expectedDeliveryDate"
                    type="date"
                    value={deliveryRequirements.expectedDeliveryDate}
                    onChange={(e) => setDeliveryRequirements({...deliveryRequirements, expectedDeliveryDate: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="latestShipDate">{t('latestShipDate')} *</Label>
                  <Input
                    id="latestShipDate"
                    type="date"
                    value={deliveryRequirements.latestShipDate}
                    onChange={(e) => setDeliveryRequirements({...deliveryRequirements, latestShipDate: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">{t('shippingContactPerson')} *</Label>
                  <Input
                    id="contactPerson"
                    value={deliveryRequirements.contactPerson}
                    onChange={(e) => setDeliveryRequirements({...deliveryRequirements, contactPerson: e.target.value})}
                    placeholder={t('contactPersonName')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">{t('contactPhone')}</Label>
                  <Input
                    id="contactPhone"
                    value={deliveryRequirements.contactPhone}
                    onChange={(e) => setDeliveryRequirements({...deliveryRequirements, contactPhone: e.target.value})}
                    placeholder={t('contactPhone')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">{t('contactEmail')}</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={deliveryRequirements.contactEmail}
                    onChange={(e) => setDeliveryRequirements({...deliveryRequirements, contactEmail: e.target.value})}
                    placeholder={t('contactEmail')}
                  />
                </div>
              </div>

              {/* 收货地址 - 美国格式 */}
              <div className="space-y-4">
                <Label className="text-base font-medium">{t('shippingAddressField')} *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">{t('countryField')}</Label>
                    <Select 
                      value={deliveryRequirements.country} 
                      onValueChange={(value) => setDeliveryRequirements({...deliveryRequirements, country: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Mexico">Mexico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">{t('stateProvince')} *</Label>
                    <Select 
                      value={deliveryRequirements.state} 
                      onValueChange={(value) => setDeliveryRequirements({...deliveryRequirements, state: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectState')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                        <SelectItem value="IL">Illinois</SelectItem>
                        <SelectItem value="WA">Washington</SelectItem>
                        <SelectItem value="PA">Pennsylvania</SelectItem>
                        <SelectItem value="OH">Ohio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">{t('cityField')} *</Label>
                    <Input
                      id="city"
                      value={deliveryRequirements.city}
                      onChange={(e) => setDeliveryRequirements({...deliveryRequirements, city: e.target.value})}
                      placeholder={t('enterCityName')}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address1">{t('address1Field')} *</Label>
                    <Input
                      id="address1"
                      value={deliveryRequirements.address1}
                      onChange={(e) => setDeliveryRequirements({...deliveryRequirements, address1: e.target.value})}
                      placeholder={t('streetAddress')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">{t('zipCodeField')} *</Label>
                    <Input
                      id="zipCode"
                      value={deliveryRequirements.zipCode}
                      onChange={(e) => setDeliveryRequirements({...deliveryRequirements, zipCode: e.target.value})}
                      placeholder={t('postalCode')}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-3">
                    <Label htmlFor="address2">{t('address2Optional')}</Label>
                    <Input
                      id="address2"
                      value={deliveryRequirements.address2}
                      onChange={(e) => setDeliveryRequirements({...deliveryRequirements, address2: e.target.value})}
                      placeholder={t('apartmentFloorInfo')}
                    />
                  </div>
                </div>
              </div>

              {/* 交付备注 */}
              <div className="space-y-2">
                <Label htmlFor="deliveryNotes">{t('deliveryNotesField')}</Label>
                <Textarea
                  id="deliveryNotes"
                  value={deliveryRequirements.deliveryNotes}
                  onChange={(e) => setDeliveryRequirements({...deliveryRequirements, deliveryNotes: e.target.value})}
                  placeholder={t('specialDeliveryRequirements')}
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('productDetails')}</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowBatchSettings(!showBatchSettings)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {t('batchSettings')}
                </Button>
                <Button onClick={() => setShowProductDialog(true)}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {t('addProduct')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* 批量设置面板 */}
            {showBatchSettings && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-blue-800">批量设置</h4>
                  <Button variant="ghost" size="sm" onClick={() => setShowBatchSettings(false)}>
                    ×
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t('batchSetCurrencyLabel')}</Label>
                    <Select 
                      value={batchSettings.currency} 
                      onValueChange={(value) => setBatchSettings({...batchSettings, currency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectCurrencyPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="CNY">CNY</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="JPY">JPY</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="HKD">HKD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('batchSetTaxRateLabel')}</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={batchSettings.taxRate}
                      onChange={(e) => setBatchSettings({...batchSettings, taxRate: e.target.value})}
                      placeholder={t('taxRateExample')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('batchSetSupplierLabel')}</Label>
                    <Input
                      value={batchSettings.preferredSupplier}
                      onChange={(e) => setBatchSettings({...batchSettings, preferredSupplier: e.target.value})}
                      placeholder={t('enterSupplierNamePlaceholder')}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={applyBatchSettings} size="sm">
                    {t('applyToAllProductsButton')}
                  </Button>
                </div>
              </div>
            )}
            
            {lineItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>{t('noProductDetails')}</p>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">{t('lineNumber')}</TableHead>
                      <TableHead className="min-w-[200px]">{t('productInfo')}</TableHead>
                      <TableHead className="w-[80px]">{t('quantityField')}</TableHead>
                      <TableHead className="w-[60px]">{t('unitField')}</TableHead>
                      <TableHead className="w-[80px]">{t('currencyField')}</TableHead>
                      <TableHead className="w-[100px]">{t('unitPriceField')}</TableHead>
                      <TableHead className="w-[80px]">{t('taxRateField')}</TableHead>
                      <TableHead className="w-[100px]">{t('taxAmountField')}</TableHead>
                      <TableHead className="w-[120px]">{t('taxInclusiveSubtotal')}</TableHead>
                      <TableHead className="min-w-[150px]">{t('supplierField')}</TableHead>
                      <TableHead className="min-w-[120px]">{t('snManagement')}</TableHead>
                      <TableHead className="min-w-[120px]">{t('lotManagement')}</TableHead>
                      <TableHead className="min-w-[120px]">{t('businessPurpose')}</TableHead>
                      <TableHead className="min-w-[120px]">{t('notesFieldTable')}</TableHead>
                      <TableHead className="w-[60px]">{t('actionsField')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {item.lineNo}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{item.productName}</div>
                            <div className="text-xs text-muted-foreground">SKU: {item.skuCode}</div>
                            <div className="text-xs text-muted-foreground">{item.specifications}</div>
                            <div className="flex gap-1 mt-1">
                              {/* 这里可以根据商品属性显示SN/Lot标识 */}
                              <Badge variant="outline" className="text-xs">
                                需SN管理
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                            className="w-full text-sm h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={item.uom} 
                            onValueChange={(value) => updateLineItem(item.id, "uom", value)}
                          >
                            <SelectTrigger className="w-full h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PCS">PCS</SelectItem>
                              <SelectItem value="SET">SET</SelectItem>
                              <SelectItem value="BOX">BOX</SelectItem>
                              <SelectItem value="PACK">PACK</SelectItem>
                              <SelectItem value="KG">KG</SelectItem>
                              <SelectItem value="G">G</SelectItem>
                              <SelectItem value="L">L</SelectItem>
                              <SelectItem value="ML">ML</SelectItem>
                              <SelectItem value="M">M</SelectItem>
                              <SelectItem value="CM">CM</SelectItem>
                              <SelectItem value="M²">M²</SelectItem>
                              <SelectItem value="M³">M³</SelectItem>
                              <SelectItem value="PAIR">PAIR</SelectItem>
                              <SelectItem value="DOZEN">DOZEN</SelectItem>
                              <SelectItem value="CASE">CASE</SelectItem>
                              <SelectItem value="ROLL">ROLL</SelectItem>
                              <SelectItem value="SHEET">SHEET</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={item.currency} 
                            onValueChange={(value) => updateLineItem(item.id, "currency", value)}
                          >
                            <SelectTrigger className="w-full h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="CNY">CNY</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="JPY">JPY</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                              <SelectItem value="HKD">HKD</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                            className="w-full text-sm h-8"
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={item.taxRate}
                            onChange={(e) => updateLineItem(item.id, "taxRate", parseFloat(e.target.value) || 0)}
                            className="w-full text-sm h-8"
                            placeholder="13"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-right py-1 px-2 bg-muted rounded text-muted-foreground">
                            {item.currency} {(item.quantity * item.taxAmount).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-right py-1 px-2 bg-blue-50 rounded">
                            {item.currency} {(item.quantity * item.totalAmount).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Input
                              value={item.preferredSupplier || ''}
                              onChange={(e) => updateLineItem(item.id, "preferredSupplier", e.target.value)}
                              className="w-full text-sm h-8"
                              placeholder={t('selectOrEnterSupplierPlaceholder')}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openSupplierDialog(item)}
                              className="w-full h-6 text-xs"
                            >
                              <Settings className="h-3 w-3 mr-1" />
                              {t('quoteManagementButton')}
                            </Button>
                            {(item.supplierQuotePrice || 0) > 0 && (
                              <div className="text-xs text-green-600">
                                {t('quoteLabel')}: {item.currency} {(item.supplierQuotePrice || 0).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        {/* SN管理列 */}
                        <TableCell>
                          <div className="space-y-1">
                            {item.requiresSerialNumber ? (
                              <>
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                  {t('requiresSNLabel')}
                                </Badge>
                                <Input
                                  value={item.specifiedSerialNumbers?.join(', ') || ''}
                                  onChange={(e) => {
                                    const sns = e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                    updateLineItem(item.id, "specifiedSerialNumbers", sns)
                                  }}
                                  className="w-full text-xs h-6"
                                  placeholder={t('specifySNPlaceholder')}
                                />
                                {(item.specifiedSerialNumbers?.length || 0) > 0 && (
                                  <div className="text-xs text-green-600">
                                    {t('alreadySetLabel')}: {item.specifiedSerialNumbers?.length || 0}{t('itemsCount')}
                                  </div>
                                )}
                              </>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                {t('noSNRequiredLabel')}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        
                        {/* 批次管理列 */}
                        <TableCell>
                          <div className="space-y-1">
                            {item.requiresLotNumber ? (
                              <>
                                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                                  {t('requiresLotLabel')}
                                </Badge>
                                <Input
                                  value={item.specifiedLotNumbers?.join(', ') || ''}
                                  onChange={(e) => {
                                    const lots = e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                    updateLineItem(item.id, "specifiedLotNumbers", lots)
                                  }}
                                  className="w-full text-xs h-6"
                                  placeholder={t('specifyLotPlaceholder')}
                                />
                                {(item.specifiedLotNumbers?.length || 0) > 0 && (
                                  <div className="text-xs text-green-600">
                                    {t('alreadySetLabel')}: {item.specifiedLotNumbers?.length || 0}{t('itemsCount')}
                                  </div>
                                )}
                              </>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                {t('noLotRequiredLabel')}
                              </Badge>
                            )}
                            
                            {/* 统一管理按钮 */}
                            {(item.requiresSerialNumber || item.requiresLotNumber) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openSNLotDialog(item)}
                                className="w-full h-6 text-xs mt-1"
                              >
                                <Settings className="h-3 w-3 mr-1" />
                                {t('advancedManagementButton')}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.businessPurpose}
                            onChange={(e) => updateLineItem(item.id, "businessPurpose", e.target.value)}
                            className="w-full text-sm h-8"
                            placeholder={t('businessPurposePlaceholder')}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.notes}
                            onChange={(e) => updateLineItem(item.id, "notes", e.target.value)}
                            className="w-full text-sm h-8"
                            placeholder={t('notesPlaceholder')}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(item.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  
                  {/* 汇总行 */}
                  <tfoot className="bg-muted/50 border-t-2">
                    <tr>
                      <td className="px-4 py-3 font-medium text-sm">{t('summary')}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium">{totalItems} {t('products')}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="font-bold text-blue-600">{totalQuantity.toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3 text-right">
                        {Object.entries(totalsByCurrency).map(([currency, totals]) => (
                          <div key={currency} className="font-medium text-sm">
                            {currency} {totals.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3 text-right">
                        {Object.entries(totalsByCurrency).map(([currency, totals]) => (
                          <div key={currency} className="font-medium text-orange-600 text-sm">
                            {currency} {totals.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {Object.entries(totalsByCurrency).map(([currency, totals]) => (
                          <div key={currency} className="font-bold text-green-600">
                            {currency} {totals.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            )}


          </CardContent>
        </Card>





        {/* Quote File Management */}
        {lineItems.length > 0 && (
          <QuoteFileManager
            quoteFiles={quoteFiles}
            quoteRequests={quoteRequests}
            onFileUpload={handleFileUpload}
            onFileDelete={handleFileDelete}
            onQuoteRequestAdd={handleQuoteRequestAdd}
            onQuoteRequestUpdate={handleQuoteRequestUpdate}
          />
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pb-6">
          <Button variant="outline" size="sm" onClick={() => window.history.back()} className="min-w-[60px]">
            {t('cancel')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveDraft} className="min-w-[80px]">
            <Save className="mr-2 h-4 w-4" />
            {t('saveDraft')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => console.log("Save")} className="min-w-[60px]">
            <Save className="mr-2 h-4 w-4" />
            {t('save')}
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!isFormValid()} className="min-w-[90px]">
            <Send className="mr-2 h-4 w-4" />
            {t('saveAndSubmit')}
          </Button>
        </div>

        {/* Product Selection Dialog */}
        <ProductSelectionDialog
          open={showProductDialog}
          onOpenChange={setShowProductDialog}
          onProductsSelected={handleProductsSelected}
        />

        {/* SN/Lot Management Dialog */}
        {currentSNLotItem && (
          <SNLotManagementDialog
            open={showSNLotDialog}
            onOpenChange={setShowSNLotDialog}
            productName={currentSNLotItem.productName}
            skuCode={currentSNLotItem.skuCode}
            quantity={currentSNLotItem.quantity}
            requiresSerialNumber={currentSNLotItem.requiresSerialNumber}
            requiresLotNumber={currentSNLotItem.requiresLotNumber}
            specifiedSerialNumbers={currentSNLotItem.specifiedSerialNumbers || []}
            specifiedLotNumbers={currentSNLotItem.specifiedLotNumbers || []}
            snLotNotes={currentSNLotItem.snLotNotes || ''}
            onSave={handleSNLotSave}
          />
        )}

        {/* Supplier Quote Dialog */}
        {currentSupplierItem && (
          <SupplierQuoteDialog
            open={showSupplierDialog}
            onOpenChange={setShowSupplierDialog}
            productName={currentSupplierItem.productName}
            skuCode={currentSupplierItem.skuCode}
            quantity={currentSupplierItem.quantity}
            currentSupplier={currentSupplierItem.preferredSupplier}
            currentQuotePrice={currentSupplierItem.supplierQuotePrice}
            onSave={handleSupplierSave}
          />
        )}
      </div>
    </MainLayout>
  )
}