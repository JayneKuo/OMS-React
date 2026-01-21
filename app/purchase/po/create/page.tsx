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
import { FileText, ShoppingCart, Truck, Package, CheckCircle, Plus, Trash2, Save, Send, ArrowLeft, ShoppingBag, Settings, Building, Calendar, MapPin } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ProductSelectionDialog } from "@/components/purchase/product-selection-dialog"
import { SNLotManagementDialog } from "@/components/purchase/sn-lot-management-dialog"
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
  // Dimensions and volume
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
  // SN/Lot management
  requiresSerialNumber: boolean
  requiresLotNumber: boolean
  specifiedSerialNumbers?: string[]
  specifiedLotNumbers?: string[]
  // Supplier per line
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

// Factory Direct Config Interface
interface FactoryDirectConfig {
  viaFinishedGoodsWarehouse: boolean
  factoryId: string
  factoryName: string
  finishedGoodsWarehouseId?: string
  finishedGoodsWarehouseName?: string
  finalDestinationId: string
  finalDestinationType: "CUSTOMER" | "STORE" | "WAREHOUSE"
  finalDestinationName: string
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
    
    // Reset form
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

export default function CreatePOPage() {
  const { t } = useI18n()
  const router = useRouter()
  
  // Basic Information State
  const [poNumber, setPoNumber] = React.useState(`PO${new Date().getFullYear()}${String(Date.now()).slice(-8)}`)
  const [originalPoNo, setOriginalPoNo] = React.useState("")
  const [referenceNo, setReferenceNo] = React.useState("")
  const [priority, setPriority] = React.useState("NORMAL")
  const [department, setDepartment] = React.useState("")
  const [budgetProject, setBudgetProject] = React.useState("")
  const [purchaseType, setPurchaseType] = React.useState("")
  
  // Supplier & Delivery Information State
  const [supplierInfo, setSupplierInfo] = React.useState({
    supplierName: "",
    supplierCode: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
  })
  
  // Factory Direct Configuration State
  const [factoryDirectConfig, setFactoryDirectConfig] = React.useState<FactoryDirectConfig>({
    viaFinishedGoodsWarehouse: true,
    factoryId: "",
    factoryName: "",
    finishedGoodsWarehouseId: "",
    finishedGoodsWarehouseName: "",
    finalDestinationId: "",
    finalDestinationType: "CUSTOMER",
    finalDestinationName: "",
  })
  
  // Shipping Address Information (supplier contact info)
  const [shippingAddress, setShippingAddress] = React.useState({
    department: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    country: "United States",
    state: "",
    city: "",
    address1: "",
    address2: "",
    zipCode: "",
  })
  
  // Receiving Address Information (delivery contact info)
  const [receivingAddress, setReceivingAddress] = React.useState({
    department: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    country: "United States",
    state: "",
    city: "",
    address1: "",
    address2: "",
    zipCode: "",
  })
  
  const [deliveryInfo, setDeliveryInfo] = React.useState({
    warehouse: "",
    warehouseAddress: "",
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
    shippingTaxRate: 13, // Default tax rate for shipping
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
  
  // SN/LOT Management Dialog State
  const [showSNLotDialog, setShowSNLotDialog] = React.useState(false)
  const [selectedLineItemForSNLot, setSelectedLineItemForSNLot] = React.useState<string | null>(null)
  
  // Attachments State
  const [attachments, setAttachments] = React.useState<File[]>([])
  const [notes, setNotes] = React.useState("")

  // Add products from selection dialog
  const handleProductsSelected = (products: Product[]) => {
    const defaultTaxRate = 13 // Default tax rate 13%
    
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
        // Initialize dimensions
        length: 0,
        width: 0,
        height: 0,
        volume: 0,
        quantity: 1,
        uom: product.uom,
        currency: "USD", // Default currency
        unitPrice: product.unitPrice,
        taxRate: defaultTaxRate,
        taxAmount: taxAmount,
        lineAmount: lineAmount,
        // SN/Lot management from product properties
        requiresSerialNumber: false, // Will be set based on product properties
        requiresLotNumber: false,
        specifiedSerialNumbers: [],
        specifiedLotNumbers: [],
        // Supplier per line
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
        
        // Recalculate tax and line amount for price-related fields
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

  // Open SN/LOT management dialog
  const openSNLotDialog = (lineItemId: string) => {
    setSelectedLineItemForSNLot(lineItemId)
    setShowSNLotDialog(true)
  }

  // Handle SN/LOT management save
  const handleSNLotSave = (data: {
    specifiedSerialNumbers: string[]
    specifiedLotNumbers: string[]
    snLotNotes: string
  }) => {
    if (selectedLineItemForSNLot) {
      setLineItems(lineItems.map(item => {
        if (item.id === selectedLineItemForSNLot) {
          return {
            ...item,
            specifiedSerialNumbers: data.specifiedSerialNumbers,
            specifiedLotNumbers: data.specifiedLotNumbers,
            notes: data.snLotNotes
          }
        }
        return item
      }))
    }
  }

  // Update line item
  const updateLineItem = (id: string, field: keyof POLineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        
        // Recalculate tax and line amount when quantity, unit price, or tax rate changes
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
        
        // Calculate volume when dimensions change
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
  
  // Calculate totals by currency
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
  
  // Calculate grand total including costs and shipping tax
  const grandTotal = Object.values(totalsByCurrency).reduce((sum, curr) => sum + curr.totalAmount, 0) + 
                     costInfo.shippingCost + costInfo.handlingFee + costInfo.otherCharge + costInfo.shippingTaxAmount

  // Form validation
  const isFormValid = () => {
    return purchaseType &&
           supplierInfo.supplierName && 
           deliveryInfo.warehouse && 
           deliveryInfo.expectedDeliveryDate &&
           priority &&
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
    console.log("Save as draft:", {
      basic: { poNumber, originalPoNo, referenceNo, priority, department, budgetProject, purchaseType },
      supplier: supplierInfo,
      shippingAddress,
      receivingAddress,
      delivery: deliveryInfo,
      costInfo,
      lineItems,
      attachments,
      notes,
      totals: { totalItems, totalQuantity, totalsByCurrency, grandTotal }
    })
    // TODO: API call to save draft
  }

  // Handle save as created
  const handleSaveAsCreated = () => {
    if (!isFormValid()) {
      alert("请填写所有必填字段")
      return
    }
    console.log("Save as created:", {
      basic: { poNumber, originalPoNo, referenceNo, priority, department, budgetProject, purchaseType },
      supplier: supplierInfo,
      shippingAddress,
      receivingAddress,
      delivery: deliveryInfo,
      costInfo,
      lineItems,
      attachments,
      notes,
      totals: { totalItems, totalQuantity, totalsByCurrency, grandTotal }
    })
    // TODO: API call to save as created
  }

  // Handle save and send
  const handleSaveAndSend = () => {
    if (!isFormValid()) {
      alert("请填写所有必填字段")
      return
    }
    console.log("Save and send:", {
      basic: { poNumber, originalPoNo, referenceNo, priority, department, budgetProject, purchaseType },
      supplier: supplierInfo,
      shippingAddress,
      receivingAddress,
      delivery: deliveryInfo,
      costInfo,
      lineItems,
      attachments,
      notes,
      totals: { totalItems, totalQuantity, totalsByCurrency, grandTotal }
    })
    // TODO: API call to save and send
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

        {/* Navigation Tabs */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="flex gap-2 overflow-x-auto py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById('basic-info')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="whitespace-nowrap"
            >
              基本信息
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById('supplier-info')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="whitespace-nowrap"
            >
              供应商信息
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById('logistics-terms')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="whitespace-nowrap"
            >
              物流条款
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById('receiving-address')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="whitespace-nowrap"
            >
              收货地址
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById('shipping-address')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="whitespace-nowrap"
            >
              发货地址
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById('product-lines')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="whitespace-nowrap"
            >
              产品明细
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById('attachments')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="whitespace-nowrap"
            >
              附件备注
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <Card id="basic-info">
          <CardHeader>
            <CardTitle>{t('basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchaseType">
                  {t('purchaseType')} <span className="text-destructive">*</span>
                </Label>
                <Select value={purchaseType} onValueChange={setPurchaseType}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectPurchaseType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGULAR">{t('regularPurchase')}</SelectItem>
                    <SelectItem value="REPLENISHMENT">{t('stockReplenishment')}</SelectItem>
                    <SelectItem value="FACTORY_DIRECT">工厂直发</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">
                  {t('priorityField')} <span className="text-destructive">*</span>
                </Label>
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
                <Label htmlFor="department">{t('department')}</Label>
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
                <Label htmlFor="budgetProject">{t('budgetProjectCostCenter')}</Label>
                <Input
                  id="budgetProject"
                  value={budgetProject}
                  onChange={(e) => setBudgetProject(e.target.value)}
                  placeholder="Q1-Marketing"
                />
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
            </div>
          </CardContent>
        </Card>

        {/* Supplier Information (供应商信息) */}
        <Card id="supplier-info">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              供应商信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierName">
                  {t('supplierName')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="supplierName"
                  value={supplierInfo.supplierName}
                  onChange={(e) => setSupplierInfo({...supplierInfo, supplierName: e.target.value})}
                  placeholder={t('enterSupplierName')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierCode">供应商编码</Label>
                <Input
                  id="supplierCode"
                  value={supplierInfo.supplierCode || ""}
                  onChange={(e) => setSupplierInfo({...supplierInfo, supplierCode: e.target.value})}
                  placeholder="输入供应商编码"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">联系人</Label>
                <Input
                  id="contactPerson"
                  value={supplierInfo.contactPerson}
                  onChange={(e) => setSupplierInfo({...supplierInfo, contactPerson: e.target.value})}
                  placeholder={t('enterContactPerson')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">联系电话</Label>
                <Input
                  id="contactPhone"
                  value={supplierInfo.contactPhone}
                  onChange={(e) => setSupplierInfo({...supplierInfo, contactPhone: e.target.value})}
                  placeholder={t('enterContactPhone')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">联系邮箱</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={supplierInfo.contactEmail}
                  onChange={(e) => setSupplierInfo({...supplierInfo, contactEmail: e.target.value})}
                  placeholder={t('enterContactEmail')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logistics Terms (物流条款) */}
        <Card id="logistics-terms">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              物流条款
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedDeliveryDate">
                  交货期日 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="expectedDeliveryDate"
                  type="datetime-local"
                  value={deliveryInfo.expectedDeliveryDate}
                  onChange={(e) => setDeliveryInfo({...deliveryInfo, expectedDeliveryDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="latestShippingTime">
                  最晚发运时间 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="latestShippingTime"
                  type="datetime-local"
                  value={deliveryInfo.latestShippingTime}
                  onChange={(e) => setDeliveryInfo({...deliveryInfo, latestShippingTime: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingMethod">运输方式</Label>
                <Select 
                  value={deliveryInfo.shippingMethod} 
                  onValueChange={(value) => setDeliveryInfo({...deliveryInfo, shippingMethod: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectShippingMethod')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AIR">{t('airTransport')}</SelectItem>
                    <SelectItem value="OCEAN">{t('seaTransport')}</SelectItem>
                    <SelectItem value="TRUCK">{t('landTransport')}</SelectItem>
                    <SelectItem value="EXPRESS">{t('expressDelivery')}</SelectItem>
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
                    <SelectValue placeholder={t('selectFreightTerms')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COLLECT">{t('collect')}</SelectItem>
                    <SelectItem value="PREPAID">{t('prepaid')}</SelectItem>
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
                    <SelectValue placeholder={t('selectIncoterm')} />
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
          </CardContent>
        </Card>

        {/* Delivery Address (收货地址) */}
        <Card id="receiving-address">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              收货地址
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="warehouse">
                  {t('warehouse')} <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={deliveryInfo.warehouse} 
                  onValueChange={(value) => setDeliveryInfo({...deliveryInfo, warehouse: value})}
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
                <Label htmlFor="receivingContactPerson">{t('contactPerson')}</Label>
                <Input
                  id="receivingContactPerson"
                  value={receivingAddress.contactPerson}
                  onChange={(e) => setReceivingAddress({...receivingAddress, contactPerson: e.target.value})}
                  placeholder={t('enterContactPerson')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receivingDepartment">{t('department')}</Label>
                <Input
                  id="receivingDepartment"
                  value={receivingAddress.department}
                  onChange={(e) => setReceivingAddress({...receivingAddress, department: e.target.value})}
                  placeholder={t('enterDepartment')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="receivingContactPhone">{t('contactPhone')}</Label>
                <Input
                  id="receivingContactPhone"
                  value={receivingAddress.contactPhone}
                  onChange={(e) => setReceivingAddress({...receivingAddress, contactPhone: e.target.value})}
                  placeholder={t('enterContactPhone')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receivingContactEmail">{t('contactEmail')}</Label>
                <Input
                  id="receivingContactEmail"
                  type="email"
                  value={receivingAddress.contactEmail}
                  onChange={(e) => setReceivingAddress({...receivingAddress, contactEmail: e.target.value})}
                  placeholder={t('enterContactEmail')}
                />
              </div>
            </div>

            {/* Address fields in specific layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="receivingCountry">
                  {t('country')} <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={receivingAddress.country} 
                  onValueChange={(value) => setReceivingAddress({...receivingAddress, country: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectCountry')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="China">China</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="Japan">Japan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="receivingState">
                  {t('stateProvince')} <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={receivingAddress.state} 
                  onValueChange={(value) => setReceivingAddress({...receivingAddress, state: value})}
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
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="receivingCity">
                  {t('cityField')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="receivingCity"
                  value={receivingAddress.city}
                  onChange={(e) => setReceivingAddress({...receivingAddress, city: e.target.value})}
                  placeholder={t('enterCityName')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="receivingZipCode">{t('zipCodeField')}</Label>
                <Input
                  id="receivingZipCode"
                  value={receivingAddress.zipCode}
                  onChange={(e) => setReceivingAddress({...receivingAddress, zipCode: e.target.value})}
                  placeholder={t('postalCode')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receivingAddress1">
                  {t('address1Field')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="receivingAddress1"
                  value={receivingAddress.address1}
                  onChange={(e) => setReceivingAddress({...receivingAddress, address1: e.target.value})}
                  placeholder={t('streetAddress')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receivingAddress2">{t('address2Optional')}</Label>
                <Input
                  id="receivingAddress2"
                  value={receivingAddress.address2}
                  onChange={(e) => setReceivingAddress({...receivingAddress, address2: e.target.value})}
                  placeholder={t('apartmentFloorInfo')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address (发货地址) */}
        <Card id="shipping-address">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              发货地址
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Factory Direct Options - Show only when purchase type is FACTORY_DIRECT */}
            {purchaseType === "FACTORY_DIRECT" && (
              <div className="space-y-4 pb-4 border-b">
                <div className="space-y-2">
                  <Label>
                    物流路径 <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={factoryDirectConfig.viaFinishedGoodsWarehouse ? "VIA_FG" : "DIRECT"} 
                    onValueChange={(value) => setFactoryDirectConfig({
                      ...factoryDirectConfig,
                      viaFinishedGoodsWarehouse: value === "VIA_FG"
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择物流路径" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIA_FG">经成品库（先入库再出库）</SelectItem>
                      <SelectItem value="DIRECT">直接发货（工厂直发目的地）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="factorySelect">
                    工厂 <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={factoryDirectConfig.factoryId} 
                    onValueChange={(value) => {
                      const factory = [
                        { id: "FAC001", name: "深圳工厂" },
                        { id: "FAC002", name: "东莞工厂" },
                        { id: "FAC003", name: "惠州工厂" },
                      ].find(f => f.id === value)
                      if (factory) {
                        setFactoryDirectConfig({
                          ...factoryDirectConfig,
                          factoryId: factory.id,
                          factoryName: factory.name
                        })
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择工厂" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FAC001">深圳工厂</SelectItem>
                      <SelectItem value="FAC002">东莞工厂</SelectItem>
                      <SelectItem value="FAC003">惠州工厂</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {factoryDirectConfig.viaFinishedGoodsWarehouse && (
                  <div className="space-y-2">
                    <Label htmlFor="fgWarehouseSelect">
                      成品库 <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={factoryDirectConfig.finishedGoodsWarehouseId || ""} 
                      onValueChange={(value) => {
                        const warehouse = [
                          { id: "FG001", name: "深圳成品库" },
                          { id: "FG002", name: "广州成品库" },
                          { id: "FG003", name: "东莞成品库" },
                        ].find(w => w.id === value)
                        if (warehouse) {
                          setFactoryDirectConfig({
                            ...factoryDirectConfig,
                            finishedGoodsWarehouseId: warehouse.id,
                            finishedGoodsWarehouseName: warehouse.name
                          })
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择成品库" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FG001">深圳成品库</SelectItem>
                        <SelectItem value="FG002">广州成品库</SelectItem>
                        <SelectItem value="FG003">东莞成品库</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shippingContactPerson">{t('contactPerson')}</Label>
                <Input
                  id="shippingContactPerson"
                  value={shippingAddress.contactPerson}
                  onChange={(e) => setShippingAddress({...shippingAddress, contactPerson: e.target.value})}
                  placeholder={t('enterContactPerson')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingDepartment">{t('department')}</Label>
                <Input
                  id="shippingDepartment"
                  value={shippingAddress.department}
                  onChange={(e) => setShippingAddress({...shippingAddress, department: e.target.value})}
                  placeholder={t('enterDepartment')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shippingContactPhone">{t('contactPhone')}</Label>
                <Input
                  id="shippingContactPhone"
                  value={shippingAddress.contactPhone}
                  onChange={(e) => setShippingAddress({...shippingAddress, contactPhone: e.target.value})}
                  placeholder={t('enterContactPhone')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingContactEmail">{t('contactEmail')}</Label>
                <Input
                  id="shippingContactEmail"
                  type="email"
                  value={shippingAddress.contactEmail}
                  onChange={(e) => setShippingAddress({...shippingAddress, contactEmail: e.target.value})}
                  placeholder={t('enterContactEmail')}
                />
              </div>
            </div>

            {/* Address fields in specific layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shippingCountry">
                  {t('country')} <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={shippingAddress.country} 
                  onValueChange={(value) => setShippingAddress({...shippingAddress, country: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectCountry')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="China">China</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="Japan">Japan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shippingState">
                  {t('stateProvince')} <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={shippingAddress.state} 
                  onValueChange={(value) => setShippingAddress({...shippingAddress, state: value})}
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
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shippingCity">
                  {t('cityField')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="shippingCity"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                  placeholder={t('enterCityName')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shippingZipCode">{t('zipCodeField')}</Label>
                <Input
                  id="shippingZipCode"
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                  placeholder={t('postalCode')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shippingAddress1">
                  {t('address1Field')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="shippingAddress1"
                  value={shippingAddress.address1}
                  onChange={(e) => setShippingAddress({...shippingAddress, address1: e.target.value})}
                  placeholder={t('streetAddress')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingAddress2">{t('address2Optional')}</Label>
                <Input
                  id="shippingAddress2"
                  value={shippingAddress.address2}
                  onChange={(e) => setShippingAddress({...shippingAddress, address2: e.target.value})}
                  placeholder={t('apartmentFloorInfo')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Lines */}
        <Card id="product-lines">
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
                      <TableHead className="w-[80px]">{t('length')}</TableHead>
                      <TableHead className="w-[80px]">{t('width')}</TableHead>
                      <TableHead className="w-[80px]">{t('height')}</TableHead>
                      <TableHead className="w-[100px]">{t('volume')}</TableHead>
                      <TableHead className="w-[100px]">{t('quantityField')}</TableHead>
                      <TableHead className="w-[80px]">{t('unit')}</TableHead>
                      <TableHead className="w-[80px]">{t('currency')}</TableHead>
                      <TableHead className="w-[120px]">{t('unitPrice')}</TableHead>
                      <TableHead className="w-[100px]">{t('taxRate')}</TableHead>
                      <TableHead className="w-[120px]">{t('taxAmount')}</TableHead>
                      <TableHead className="w-[120px]">{t('lineAmount')}</TableHead>
                      <TableHead className="min-w-[150px]">{t('supplierPerLine')}</TableHead>
                      <TableHead className="w-[100px]">{t('snManagement')}</TableHead>
                      <TableHead className="w-[100px]">{t('lotManagement')}</TableHead>
                      <TableHead className="w-[120px]">{t('snList')}</TableHead>
                      <TableHead className="w-[120px]">{t('lotList')}</TableHead>
                      <TableHead className="min-w-[120px]">{t('notes')}</TableHead>
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
                            min="0"
                            step="0.01"
                            value={item.length || ''}
                            onChange={(e) => updateLineItem(item.id, "length", parseFloat(e.target.value) || 0)}
                            className="w-full text-sm h-8"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.width || ''}
                            onChange={(e) => updateLineItem(item.id, "width", parseFloat(e.target.value) || 0)}
                            className="w-full text-sm h-8"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.height || ''}
                            onChange={(e) => updateLineItem(item.id, "height", parseFloat(e.target.value) || 0)}
                            className="w-full text-sm h-8"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-center py-1 px-2 bg-muted rounded">
                            {(item.volume || 0).toFixed(3)}
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
                          <div className="text-sm text-right py-1 px-2 bg-orange-50 rounded">
                            {item.currency} {(item.taxAmount || 0).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-right py-1 px-2 bg-blue-50 rounded">
                            {item.currency} {(item.lineAmount || 0).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.supplierName || ''}
                            onChange={(e) => updateLineItem(item.id, "supplierName", e.target.value)}
                            className="w-full text-sm h-8"
                            placeholder={t('enterSupplierName')}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {item.requiresSerialNumber ? (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                {t('requiresSN')}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                {t('noSNRequired')}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {item.requiresLotNumber ? (
                              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                                {t('requiresLot')}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                {t('noLotRequired')}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {item.specifiedSerialNumbers && item.specifiedSerialNumbers.length > 0 ? (
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">
                                  {item.specifiedSerialNumbers.length} SN(s)
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => openSNLotDialog(item.id)}
                                >
                                  {t('view')}
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-muted-foreground"
                                onClick={() => openSNLotDialog(item.id)}
                              >
                                {t('add')}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {item.specifiedLotNumbers && item.specifiedLotNumbers.length > 0 ? (
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">
                                  {item.specifiedLotNumbers.length} LOT(s)
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => openSNLotDialog(item.id)}
                                >
                                  {t('view')}
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-muted-foreground"
                                onClick={() => openSNLotDialog(item.id)}
                              >
                                {t('add')}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.notes}
                            onChange={(e) => updateLineItem(item.id, "notes", e.target.value)}
                            className="w-full text-sm h-8"
                            placeholder={t('enterNotes')}
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
                  
                  {/* Summary and Cost Rows */}
                  <tfoot className="bg-muted/50 border-t-2">
                    {/* 商品汇总行 */}
                    <tr>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3 font-medium text-sm">商品汇总</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium">{totalItems} 种商品</div>
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
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
                    </tr>
                    
                    {/* 运费行 */}
                    <tr className="border-t">
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3 font-medium text-sm">运费</td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3">USD</td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={costInfo.shippingCost}
                          onChange={(e) => setCostInfo({...costInfo, shippingCost: parseFloat(e.target.value) || 0})}
                          className="w-full text-sm h-8"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={costInfo.isShippingTaxable ? costInfo.shippingTaxRate : 0}
                          onChange={(e) => setCostInfo({...costInfo, shippingTaxRate: parseFloat(e.target.value) || 0})}
                          className="w-full text-sm h-8"
                          placeholder="0"
                          disabled={!costInfo.isShippingTaxable}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm text-orange-600">
                          USD {costInfo.isShippingTaxable ? costInfo.shippingTaxAmount.toFixed(2) : '0.00'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-medium text-blue-600">
                          USD {(costInfo.shippingCost + (costInfo.isShippingTaxable ? costInfo.shippingTaxAmount : 0)).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3">
                        <Label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={costInfo.isShippingTaxable}
                            onChange={(e) => setCostInfo({...costInfo, isShippingTaxable: e.target.checked})}
                            className="rounded"
                          />
                          {t('isShippingTaxable')}
                        </Label>
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                    </tr>
                    
                    {/* 手续费行 */}
                    <tr className="border-t">
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3 font-medium text-sm">手续费</td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3">USD</td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={costInfo.handlingFee}
                          onChange={(e) => setCostInfo({...costInfo, handlingFee: parseFloat(e.target.value) || 0})}
                          className="w-full text-sm h-8"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-3">0</td>
                      <td className="px-4 py-3 text-right">USD 0.00</td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-medium text-blue-600">
                          USD {costInfo.handlingFee.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                    </tr>
                    
                    {/* 其他费用行 */}
                    <tr className="border-t">
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3 font-medium text-sm">其他费用</td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3">USD</td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={costInfo.otherCharge}
                          onChange={(e) => setCostInfo({...costInfo, otherCharge: parseFloat(e.target.value) || 0})}
                          className="w-full text-sm h-8"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-3">0</td>
                      <td className="px-4 py-3 text-right">USD 0.00</td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-medium text-blue-600">
                          USD {costInfo.otherCharge.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                    </tr>
                    
                    {/* 总计行 */}
                    <tr className="border-t-2 border-green-300 bg-green-50">
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3 font-bold text-lg">总计</td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-xl font-bold text-green-600">
                          USD {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
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



        {/* Attachments */}
        <Card id="attachments">
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

        {/* SN/LOT Management Dialog */}
        {selectedLineItemForSNLot && (
          <SNLotManagementDialog
            open={showSNLotDialog}
            onOpenChange={setShowSNLotDialog}
            productName={lineItems.find(item => item.id === selectedLineItemForSNLot)?.productName || ''}
            skuCode={lineItems.find(item => item.id === selectedLineItemForSNLot)?.skuCode || ''}
            quantity={lineItems.find(item => item.id === selectedLineItemForSNLot)?.quantity || 0}
            requiresSerialNumber={lineItems.find(item => item.id === selectedLineItemForSNLot)?.requiresSerialNumber || false}
            requiresLotNumber={lineItems.find(item => item.id === selectedLineItemForSNLot)?.requiresLotNumber || false}
            specifiedSerialNumbers={lineItems.find(item => item.id === selectedLineItemForSNLot)?.specifiedSerialNumbers || []}
            specifiedLotNumbers={lineItems.find(item => item.id === selectedLineItemForSNLot)?.specifiedLotNumbers || []}
            snLotNotes={lineItems.find(item => item.id === selectedLineItemForSNLot)?.notes || ''}
            onSave={handleSNLotSave}
          />
        )}
      </div>
    </MainLayout>
  )
}