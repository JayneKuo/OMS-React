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
import { FileText, ShoppingCart, Truck, Package, CheckCircle, Plus, Trash2, Save, Send, ArrowLeft, ShoppingBag, Settings, Building } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ProductSelectionDialog } from "@/components/purchase/product-selection-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useI18n } from "@/components/i18n-provider"
import { useRouter } from "next/navigation"

const sidebarItems = [
  { title: "PR (Purchase Request)", href: "/purchase/pr", icon: <FileText className="h-4 w-4" /> },
  { title: "PO (Purchase Order)", href: "/purchase/po", icon: <ShoppingCart className="h-4 w-4" /> },
  { title: "ASN (Advance Ship Notice)", href: "/purchase/asn", icon: <Truck className="h-4 w-4" /> },
  { title: "Receipts", href: "/purchase/receipts", icon: <Package className="h-4 w-4" /> },
  { title: "Receipt Confirm", href: "/purchase/receipt-confirm", icon: <CheckCircle className="h-4 w-4" /> },
]

// PO Line Item Interface
interface POLineItem {
  id: string
  lineNo: number
  productId: string
  skuCode: string
  productName: string
  specifications: string
  length?: number
  width?: number
  height?: number
  volume?: number
  quantity: number
  uom: string
  currency: string
  unitPrice: number
  taxRate: number
  taxAmount: number
  lineAmount: number
  requiresSerialNumber: boolean
  requiresLotNumber: boolean
  specifiedSerialNumbers?: string[]
  specifiedLotNumbers?: string[]
  supplierName?: string
  notes: string
}

// Product Interface
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
}

// Batch Settings Dialog Component
interface BatchSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  onBatchUpdate: (field: keyof POLineItem, value: any) => void
}

function BatchSettingsDialog({ open, onOpenChange, selectedCount, onBatchUpdate }: BatchSettingsDialogProps) {
  const { t } = useI18n()
  const [batchData, setBatchData] = React.useState({
    quantity: '',
    currency: '',
    unitPrice: '',
    taxRate: '',
    notes: '',
    requiresSerialNumber: false,
    requiresLotNumber: false,
  })

  const handleApply = () => {
    if (batchData.quantity) onBatchUpdate('quantity', parseInt(batchData.quantity))
    if (batchData.currency) onBatchUpdate('currency', batchData.currency)
    if (batchData.unitPrice) onBatchUpdate('unitPrice', parseFloat(batchData.unitPrice))
    if (batchData.taxRate) onBatchUpdate('taxRate', parseFloat(batchData.taxRate))
    if (batchData.notes) onBatchUpdate('notes', batchData.notes)
    onBatchUpdate('requiresSerialNumber', batchData.requiresSerialNumber)
    onBatchUpdate('requiresLotNumber', batchData.requiresLotNumber)
    
    setBatchData({
      quantity: '',
      currency: '',
      unitPrice: '',
      taxRate: '',
      notes: '',
      requiresSerialNumber: false,
      requiresLotNumber: false,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('batchSettings')} ({selectedCount} {t('items')})</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="batchQuantity">{t('quantity')}</Label>
            <Input
              id="batchQuantity"
              type="number"
              min="1"
              value={batchData.quantity}
              onChange={(e) => setBatchData({...batchData, quantity: e.target.value})}
              placeholder={t('enterQuantity')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchCurrency">{t('currency')}</Label>
            <Select value={batchData.currency} onValueChange={(value) => setBatchData({...batchData, currency: value})}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectCurrency')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="CNY">CNY</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchUnitPrice">{t('unitPrice')}</Label>
            <Input
              id="batchUnitPrice"
              type="number"
              min="0"
              step="0.01"
              value={batchData.unitPrice}
              onChange={(e) => setBatchData({...batchData, unitPrice: e.target.value})}
              placeholder={t('enterUnitPrice')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchTaxRate">{t('taxRate')} (%)</Label>
            <Input
              id="batchTaxRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={batchData.taxRate}
              onChange={(e) => setBatchData({...batchData, taxRate: e.target.value})}
              placeholder="13"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchNotes">{t('notes')}</Label>
            <Input
              id="batchNotes"
              value={batchData.notes}
              onChange={(e) => setBatchData({...batchData, notes: e.target.value})}
              placeholder={t('enterNotes')}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={batchData.requiresSerialNumber}
                onChange={(e) => setBatchData({...batchData, requiresSerialNumber: e.target.checked})}
                className="rounded"
              />
              {t('requiresSN')}
            </Label>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={batchData.requiresLotNumber}
                onChange={(e) => setBatchData({...batchData, requiresLotNumber: e.target.checked})}
                className="rounded"
              />
              {t('requiresLot')}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleApply}>
            {t('apply')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function OptimizedCreatePOPage() {
  const { t } = useI18n()
  const router = useRouter()
  
  // Basic Information State
  const [poNumber] = React.useState(`PO${new Date().getFullYear()}${String(Date.now()).slice(-8)}`)
  const [originalPoNo, setOriginalPoNo] = React.useState("")
  const [referenceNo, setReferenceNo] = React.useState("")
  const [priority, setPriority] = React.useState("NORMAL")
  const [department, setDepartment] = React.useState("")
  const [budgetProject, setBudgetProject] = React.useState("")
  const [purchaseType, setPurchaseType] = React.useState("")
  
  // Supplier Information State
  const [supplierInfo, setSupplierInfo] = React.useState({
    supplierName: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
  })
  
  // Shipping Address Information
  const [shippingAddress, setShippingAddress] = React.useState({
    country: "United States",
    state: "",
    city: "",
    address1: "",
    address2: "",
    zipCode: "",
  })
  
  // Receiving Address Information
  const [receivingAddress, setReceivingAddress] = React.useState({
    country: "United States",
    state: "",
    city: "",
    address1: "",
    address2: "",
    zipCode: "",
  })
  
  // Delivery Information State
  const [deliveryInfo, setDeliveryInfo] = React.useState({
    warehouse: "",
    expectedDeliveryDate: "",
    latestShippingTime: "",
    shippingMethod: "",
    freightTerms: "",
    incoterm: "",
  })
  
  // Cost Information
  const [costInfo, setCostInfo] = React.useState({
    shippingCost: 0,
    handlingFee: 0,
    otherCharge: 0,
    isShippingTaxable: false,
    shippingTaxRate: 13,
    shippingTaxAmount: 0,
  })

  // Calculate shipping tax amount when shipping cost or tax rate changes
  React.useEffect(() => {
    if (costInfo.isShippingTaxable) {
      const taxAmount = costInfo.shippingCost * (costInfo.shippingTaxRate / 100)
      setCostInfo(prev => ({ ...prev, shippingTaxAmount: taxAmount }))
    } else {
      setCostInfo(prev => ({ ...prev, shippingTaxAmount: 0 }))
    }
  }, [costInfo.shippingCost, costInfo.shippingTaxRate, costInfo.isShippingTaxable])
  
  // Line Items State
  const [lineItems, setLineItems] = React.useState<POLineItem[]>([])
  const [nextLineNo, setNextLineNo] = React.useState(1)
  
  // Product Selection Dialog State
  const [showProductDialog, setShowProductDialog] = React.useState(false)
  
  // Batch Settings Dialog State
  const [showBatchSettingsDialog, setShowBatchSettingsDialog] = React.useState(false)
  
  // Attachments State
  const [attachments, setAttachments] = React.useState<File[]>([])
  const [notes, setNotes] = React.useState("")

  // Add products from selection dialog
  const handleProductsSelected = (products: Product[]) => {
    const defaultTaxRate = 13
    
    const newItems: POLineItem[] = products.map(product => {
      const taxAmount = product.unitPrice * (defaultTaxRate / 100)
      const lineAmount = product.unitPrice + taxAmount
      
      return {
        id: `line-${Date.now()}-${product.id}`,
        lineNo: nextLineNo + lineItems.length + products.indexOf(product),
        productId: product.id,
        skuCode: product.sku,
        productName: product.productName,
        specifications: product.specifications,
        length: 0,
        width: 0,
        height: 0,
        volume: 0,
        quantity: 1,
        uom: product.uom,
        currency: "USD",
        unitPrice: product.unitPrice,
        taxRate: defaultTaxRate,
        taxAmount: taxAmount,
        lineAmount: lineAmount,
        requiresSerialNumber: false,
        requiresLotNumber: false,
        specifiedSerialNumbers: [],
        specifiedLotNumbers: [],
        supplierName: "",
        notes: "",
      }
    })
    
    setLineItems([...lineItems, ...newItems])
    setNextLineNo(nextLineNo + newItems.length)
  }

  // Remove line item
  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id))
  }

  // Batch operations for line items
  const [selectedLineItems, setSelectedLineItems] = React.useState<string[]>([])
  
  // Select all line items
  const selectAllLineItems = () => {
    setSelectedLineItems(lineItems.map(item => item.id))
  }
  
  // Deselect all line items
  const deselectAllLineItems = () => {
    setSelectedLineItems([])
  }
  
  // Toggle line item selection
  const toggleLineItemSelection = (id: string) => {
    setSelectedLineItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    )
  }
  
  // Batch remove selected line items
  const batchRemoveLineItems = () => {
    setLineItems(lineItems.filter(item => !selectedLineItems.includes(item.id)))
    setSelectedLineItems([])
  }
  
  // Batch update selected line items
  const batchUpdateLineItems = (field: keyof POLineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (selectedLineItems.includes(item.id)) {
        const updatedItem = { ...item, [field]: value }
        
        if (field === 'unitPrice' || field === 'taxRate') {
          const unitPrice = field === 'unitPrice' ? value : updatedItem.unitPrice
          const taxRate = field === 'taxRate' ? value : updatedItem.taxRate
          
          const subtotal = updatedItem.quantity * unitPrice
          const taxAmount = subtotal * (taxRate / 100)
          const lineAmount = subtotal + taxAmount
          
          updatedItem.taxAmount = taxAmount
          updatedItem.lineAmount = lineAmount
        }
        
        return updatedItem
      }
      return item
    }))
  }

  // Update line item
  const updateLineItem = (id: string, field: keyof POLineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        
        if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
          const quantity = field === 'quantity' ? value : updatedItem.quantity
          const unitPrice = field === 'unitPrice' ? value : updatedItem.unitPrice
          const taxRate = field === 'taxRate' ? value : updatedItem.taxRate
          
          const subtotal = quantity * unitPrice
          const taxAmount = subtotal * (taxRate / 100)
          const lineAmount = subtotal + taxAmount
          
          updatedItem.taxAmount = taxAmount
          updatedItem.lineAmount = lineAmount
        }
        
        if (field === 'length' || field === 'width' || field === 'height') {
          const length = field === 'length' ? value : updatedItem.length || 0
          const width = field === 'width' ? value : updatedItem.width || 0
          const height = field === 'height' ? value : updatedItem.height || 0
          updatedItem.volume = length * width * height
        }
        
        return updatedItem
      }
      return item
    }))
  }

  // Calculate totals by currency including cost information
  const totalItems = lineItems.length
  const totalQuantity = lineItems.reduce((sum, item) => sum + item.quantity, 0)
  
  const totalsByCurrency = lineItems.reduce((acc, item) => {
    const currency = item.currency
    if (!acc[currency]) {
      acc[currency] = {
        subtotal: 0,
        taxAmount: 0,
        totalAmount: 0
      }
    }
    const subtotal = item.quantity * item.unitPrice
    acc[currency].subtotal += subtotal
    acc[currency].taxAmount += subtotal * (item.taxRate / 100)
    acc[currency].totalAmount += item.lineAmount
    return acc
  }, {} as Record<string, { subtotal: number; taxAmount: number; totalAmount: number }>)
  
  const grandTotal = Object.values(totalsByCurrency).reduce((sum, curr) => sum + curr.totalAmount, 0) + 
                     costInfo.shippingCost + costInfo.handlingFee + costInfo.otherCharge + costInfo.shippingTaxAmount

  // Form validation
  const isFormValid = () => {
    return supplierInfo.supplierName && 
           deliveryInfo.warehouse && 
           deliveryInfo.expectedDeliveryDate &&
           priority &&
           department &&
           lineItems.length > 0 &&
           lineItems.every(item => item.skuCode && item.quantity > 0 && item.unitPrice > 0)
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setAttachments([...attachments, ...Array.from(files)])
    }
  }

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  // Handle save as draft
  const handleSaveDraft = () => {
    console.log("Save as draft")
  }

  // Handle save as created
  const handleSaveAsCreated = () => {
    if (!isFormValid()) {
      alert("请填写所有必填字段")
      return
    }
    console.log("Save as created")
  }

  // Handle save and send
  const handleSaveAndSend = () => {
    if (!isFormValid()) {
      alert("请填写所有必填字段")
      return
    }
    console.log("Save and send")
  }

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('createPurchaseOrder')}</h1>
              <p className="text-muted-foreground">{t('createNewPurchaseOrder')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              {t('saveDraft')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveAsCreated} disabled={!isFormValid()}>
              <Save className="mr-2 h-4 w-4" />
              {t('saveAsCreated')}
            </Button>
            <Button size="sm" onClick={handleSaveAndSend} disabled={!isFormValid()}>
              <Send className="mr-2 h-4 w-4" />
              {t('saveAndSend')}
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="poNumber">{t('poNo')}</Label>
                <Input
                  id="poNumber"
                  value={poNumber}
                  disabled
                  className="bg-muted"
                />
                <div className="text-xs text-muted-foreground">{t('systemGenerated')}</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalPoNo">{t('originalPoNo')}</Label>
                <Input
                  id="originalPoNo"
                  value={originalPoNo}
                  onChange={(e) => setOriginalPoNo(e.target.value)}
                  placeholder={t('enterOriginalPoNo')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceNo">{t('referenceNo')}</Label>
                <Input
                  id="referenceNo"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder={t('enterReferenceNo')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">{t('priorityField')} *</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectPriority')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">{t('normal')}</SelectItem>
                    <SelectItem value="HIGH">{t('HIGH')}</SelectItem>
                    <SelectItem value="URGENT">{t('urgent')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">{t('department')} *</Label>
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
                <Label htmlFor="budgetProject">{t('budgetProjectCostCenter')} *</Label>
                <Input
                  id="budgetProject"
                  value={budgetProject}
                  onChange={(e) => setBudgetProject(e.target.value)}
                  placeholder="Q1-Marketing"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseType">{t('purchaseType')}</Label>
                <Select value={purchaseType} onValueChange={setPurchaseType}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectPurchaseType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGULAR">{t('regularPurchase')}</SelectItem>
                    <SelectItem value="REPLENISHMENT">{t('stockReplenishment')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optimized Delivery Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              {t('deliveryInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 页面日期，发运日期展示在一行 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedDeliveryDate">页面日期 *</Label>
                <Input
                  id="expectedDeliveryDate"
                  type="date"
                  value={deliveryInfo.expectedDeliveryDate}
                  onChange={(e) => setDeliveryInfo({...deliveryInfo, expectedDeliveryDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="latestShippingTime">发运日期</Label>
                <Input
                  id="latestShippingTime"
                  type="date"
                  value={deliveryInfo.latestShippingTime}
                  onChange={(e) => setDeliveryInfo({...deliveryInfo, latestShippingTime: e.target.value})}
                />
              </div>
            </div>

            {/* 运输方式，运费条款，贸易条款展示在一行 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shippingMethod">运输方式</Label>
                <Select 
                  value={deliveryInfo.shippingMethod} 
                  onValueChange={(value) => setDeliveryInfo({...deliveryInfo, shippingMethod: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择运输方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AIR">空运</SelectItem>
                    <SelectItem value="OCEAN">海运</SelectItem>
                    <SelectItem value="TRUCK">陆运</SelectItem>
                    <SelectItem value="EXPRESS">快递</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="freightTerms">运费条款</Label>
                <Select 
                  value={deliveryInfo.freightTerms} 
                  onValueChange={(value) => setDeliveryInfo({...deliveryInfo, freightTerms: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择运费条款" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COLLECT">到付</SelectItem>
                    <SelectItem value="PREPAID">预付</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="incoterm">贸易条款</Label>
                <Select 
                  value={deliveryInfo.incoterm} 
                  onValueChange={(value) => setDeliveryInfo({...deliveryInfo, incoterm: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择贸易条款" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FOB">FOB</SelectItem>
                    <SelectItem value="CIF">CIF</SelectItem>
                    <SelectItem value="EXW">EXW</SelectItem>
                    <SelectItem value="DDP">DDP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="warehouse">目标仓库 *</Label>
              <Select 
                value={deliveryInfo.warehouse} 
                onValueChange={(value) => setDeliveryInfo({...deliveryInfo, warehouse: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择目标仓库" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WH001">主仓库 - 洛杉矶</SelectItem>
                  <SelectItem value="WH002">东部配送中心 - 纽约</SelectItem>
                  <SelectItem value="WH003">西部履约中心 - 西雅图</SelectItem>
                  <SelectItem value="WH004">中部仓库 - 芝加哥</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 两个地址展示在一行 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">发货地址</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="shippingCountry">国家</Label>
                      <Select 
                        value={shippingAddress.country} 
                        onValueChange={(value) => setShippingAddress({...shippingAddress, country: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择国家" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="United States">美国</SelectItem>
                          <SelectItem value="China">中国</SelectItem>
                          <SelectItem value="Canada">加拿大</SelectItem>
                          <SelectItem value="United Kingdom">英国</SelectItem>
                          <SelectItem value="Germany">德国</SelectItem>
                          <SelectItem value="Japan">日本</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="shippingState">省/州</Label>
                      <Select 
                        value={shippingAddress.state} 
                        onValueChange={(value) => setShippingAddress({...shippingAddress, state: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择省/州" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CA">加利福尼亚</SelectItem>
                          <SelectItem value="NY">纽约</SelectItem>
                          <SelectItem value="TX">德克萨斯</SelectItem>
                          <SelectItem value="FL">佛罗里达</SelectItem>
                          <SelectItem value="IL">伊利诺伊</SelectItem>
                          <SelectItem value="WA">华盛顿</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="shippingCity">城市</Label>
                      <Input
                        id="shippingCity"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        placeholder="输入城市名称"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="shippingZipCode">邮编</Label>
                      <Input
                        id="shippingZipCode"
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                        placeholder="邮政编码"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress1">详细地址</Label>
                    <Input
                      id="shippingAddress1"
                      value={shippingAddress.address1}
                      onChange={(e) => setShippingAddress({...shippingAddress, address1: e.target.value})}
                      placeholder="街道地址"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress2">地址补充</Label>
                    <Input
                      id="shippingAddress2"
                      value={shippingAddress.address2}
                      onChange={(e) => setShippingAddress({...shippingAddress, address2: e.target.value})}
                      placeholder="公寓、楼层等补充信息"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">收货地址</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="receivingCountry">国家</Label>
                      <Select 
                        value={receivingAddress.country} 
                        onValueChange={(value) => setReceivingAddress({...receivingAddress, country: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择国家" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="United States">美国</SelectItem>
                          <SelectItem value="China">中国</SelectItem>
                          <SelectItem value="Canada">加拿大</SelectItem>
                          <SelectItem value="United Kingdom">英国</SelectItem>
                          <SelectItem value="Germany">德国</SelectItem>
                          <SelectItem value="Japan">日本</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="receivingState">省/州</Label>
                      <Select 
                        value={receivingAddress.state} 
                        onValueChange={(value) => setReceivingAddress({...receivingAddress, state: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择省/州" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CA">加利福尼亚</SelectItem>
                          <SelectItem value="NY">纽约</SelectItem>
                          <SelectItem value="TX">德克萨斯</SelectItem>
                          <SelectItem value="FL">佛罗里达</SelectItem>
                          <SelectItem value="IL">伊利诺伊</SelectItem>
                          <SelectItem value="WA">华盛顿</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="receivingCity">城市</Label>
                      <Input
                        id="receivingCity"
                        value={receivingAddress.city}
                        onChange={(e) => setReceivingAddress({...receivingAddress, city: e.target.value})}
                        placeholder="输入城市名称"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="receivingZipCode">邮编</Label>
                      <Input
                        id="receivingZipCode"
                        value={receivingAddress.zipCode}
                        onChange={(e) => setReceivingAddress({...receivingAddress, zipCode: e.target.value})}
                        placeholder="邮政编码"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="receivingAddress1">详细地址</Label>
                    <Input
                      id="receivingAddress1"
                      value={receivingAddress.address1}
                      onChange={(e) => setReceivingAddress({...receivingAddress, address1: e.target.value})}
                      placeholder="街道地址"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receivingAddress2">地址补充</Label>
                    <Input
                      id="receivingAddress2"
                      value={receivingAddress.address2}
                      onChange={(e) => setReceivingAddress({...receivingAddress, address2: e.target.value})}
                      placeholder="公寓、楼层等补充信息"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="warehouse">目标仓库 *</Label>
              <Select 
                value={deliveryInfo.warehouse} 
                onValueChange={(value) => setDeliveryInfo({...deliveryInfo, warehouse: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择目标仓库" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WH001">主仓库 - 洛杉矶</SelectItem>
                  <SelectItem value="WH002">东部配送中心 - 纽约</SelectItem>
                  <SelectItem value="WH003">西部履约中心 - 西雅图</SelectItem>
                  <SelectItem value="WH004">中部仓库 - 芝加哥</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 供应商信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              供应商信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 供应商名称单独一行 */}
            <div className="space-y-2">
              <Label htmlFor="supplierName">供应商名称 *</Label>
              <Input
                id="supplierName"
                value={supplierInfo.supplierName}
                onChange={(e) => setSupplierInfo({...supplierInfo, supplierName: e.target.value})}
                placeholder="输入供应商名称"
                className="max-w-md"
              />
            </div>

            {/* 联系人，电话，邮箱展示在一行 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">联系人</Label>
                <Input
                  id="contactPerson"
                  value={supplierInfo.contactPerson}
                  onChange={(e) => setSupplierInfo({...supplierInfo, contactPerson: e.target.value})}
                  placeholder="输入联系人姓名"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPhone">联系电话</Label>
                <Input
                  id="contactPhone"
                  value={supplierInfo.contactPhone}
                  onChange={(e) => setSupplierInfo({...supplierInfo, contactPhone: e.target.value})}
                  placeholder="输入联系电话"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">联系邮箱</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={supplierInfo.contactEmail}
                  onChange={(e) => setSupplierInfo({...supplierInfo, contactEmail: e.target.value})}
                  placeholder="输入邮箱地址"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Lines */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('productLines')}</CardTitle>
              <div className="flex gap-2">
                {selectedLineItems.length > 0 && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={batchRemoveLineItems}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('batchDelete')} ({selectedLineItems.length})
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowBatchSettingsDialog(true)}>
                      <Settings className="mr-2 h-4 w-4" />
                      {t('batchSettings')} ({selectedLineItems.length})
                    </Button>
                  </div>
                )}
                <Button onClick={() => setShowProductDialog(true)}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {t('addProduct')}
                </Button>
              </div>
            </div>
            {lineItems.length > 0 && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Button variant="ghost" size="sm" onClick={selectAllLineItems}>
                  {t('selectAll')}
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAllLineItems}>
                  {t('deselectAll')}
                </Button>
                <span>{selectedLineItems.length} / {lineItems.length} {t('selected')}</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {lineItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>{t('noProductLines')}</p>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <input
                          type="checkbox"
                          checked={selectedLineItems.length === lineItems.length && lineItems.length > 0}
                          onChange={(e) => e.target.checked ? selectAllLineItems() : deselectAllLineItems()}
                          className="rounded"
                        />
                      </TableHead>
                      <TableHead className="w-[60px]">{t('lineNo')}</TableHead>
                      <TableHead className="min-w-[200px]">{t('productInfo')}</TableHead>
                      <TableHead className="w-[100px]">{t('quantityField')}</TableHead>
                      <TableHead className="w-[80px]">{t('unit')}</TableHead>
                      <TableHead className="w-[80px]">{t('currency')}</TableHead>
                      <TableHead className="w-[120px]">{t('unitPrice')}</TableHead>
                      <TableHead className="w-[100px]">{t('taxRate')}</TableHead>
                      <TableHead className="w-[120px]">{t('lineAmount')}</TableHead>
                      <TableHead className="w-[60px]">{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedLineItems.includes(item.id)}
                            onChange={() => toggleLineItemSelection(item.id)}
                            className="rounded"
                          />
                        </TableCell>
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
                          <div className="text-sm font-medium text-right py-1 px-2 bg-blue-50 rounded">
                            {item.currency} {(item.lineAmount || 0).toFixed(2)}
                          </div>
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
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Summary & Costs */}
        {lineItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('productSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('totalItems')}</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('totalQuantity')}</span>
                  <span className="font-medium">{totalQuantity.toLocaleString()}</span>
                </div>
                
                {Object.entries(totalsByCurrency).map(([currency, totals]) => (
                  <div key={currency} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t('subtotal')} ({currency})</span>
                      <span className="font-medium">{currency} {totals.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t('taxAmount')}</span>
                      <span className="font-medium text-orange-600">{currency} {totals.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-medium">{t('productTotal')}</span>
                      <span className="font-bold text-green-600">{currency} {totals.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Additional Costs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('additionalCosts')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="shippingCost">{t('shippingCost')}</Label>
                    <Input
                      id="shippingCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={costInfo.shippingCost}
                      onChange={(e) => setCostInfo({...costInfo, shippingCost: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="handlingFee">{t('handlingFee')}</Label>
                    <Input
                      id="handlingFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={costInfo.handlingFee}
                      onChange={(e) => setCostInfo({...costInfo, handlingFee: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="otherCharge">{t('otherCharge')}</Label>
                    <Input
                      id="otherCharge"
                      type="number"
                      min="0"
                      step="0.01"
                      value={costInfo.otherCharge}
                      onChange={(e) => setCostInfo({...costInfo, otherCharge: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Total */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('orderTotal')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(totalsByCurrency).map(([currency, totals]) => (
                  <div key={currency} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t('productTotal')} ({currency})</span>
                      <span className="font-medium">{currency} {totals.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                ))}
                
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('shippingCost')}</span>
                    <span className="font-medium">USD {costInfo.shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('handlingFee')}</span>
                    <span className="font-medium">USD {costInfo.handlingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('otherCharge')}</span>
                    <span className="font-medium">USD {costInfo.otherCharge.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">{t('grandTotal')}</span>
                    <span className="text-xl font-bold text-green-600">USD {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 text-center">
                    {t('includesAllCostsAndTaxes')}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attachments */}
        <Card>
          <CardHeader>
            <CardTitle>{t('attachments')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <div className="text-gray-500">{t('dragFilesHere')}</div>
                  <Button variant="outline" size="sm">
                    {t('selectFiles')}
                  </Button>
                </div>
              </label>
            </div>
            
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>{t('notes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('enterAdditionalNotes')}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            {t('cancel')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveDraft}>
            <Save className="mr-2 h-4 w-4" />
            {t('saveDraft')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveAsCreated} disabled={!isFormValid()}>
            <Save className="mr-2 h-4 w-4" />
            {t('saveAsCreated')}
          </Button>
          <Button size="sm" onClick={handleSaveAndSend} disabled={!isFormValid()}>
            <Send className="mr-2 h-4 w-4" />
            {t('saveAndSend')}
          </Button>
        </div>

        {/* Product Selection Dialog */}
        <ProductSelectionDialog
          open={showProductDialog}
          onOpenChange={setShowProductDialog}
          onProductsSelected={handleProductsSelected}
        />

        {/* Batch Settings Dialog */}
        <BatchSettingsDialog
          open={showBatchSettingsDialog}
          onOpenChange={setShowBatchSettingsDialog}
          selectedCount={selectedLineItems.length}
          onBatchUpdate={batchUpdateLineItems}
        />
      </div>
    </MainLayout>
  )
}