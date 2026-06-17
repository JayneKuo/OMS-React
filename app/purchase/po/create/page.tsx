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
import { FileText, ShoppingCart, Truck, Package, CheckCircle, Plus, Trash2, Save, Send, ArrowLeft, ShoppingBag, Settings, Building, Calendar, MapPin, Download, Upload, AlertCircle, X, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ProductSelectionDialog } from "@/components/purchase/product-selection-dialog"
import { SNLotManagementDialog } from "@/components/purchase/sn-lot-management-dialog"
import { LeaveConfirmDialog } from "@/components/ui/leave-confirm-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useI18n } from "@/components/i18n-provider"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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
  sourceAddressMode: "SUPPLIER_DEFAULT" | "MANUAL_OVERRIDE"
  factoryId: string
  factoryName: string
  finishedGoodsWarehouseId?: string
  finishedGoodsWarehouseName?: string
  finalDestinationId: string
  finalDestinationType: "US_WAREHOUSE" | "CUSTOMER" | "STORE" | "WAREHOUSE"
  finalDestinationName: string
  autoCreateMasterReceipt: boolean
  autoCreateVendorPO: boolean
  autoCreateVendorSO: boolean
}

interface FactoryVendorAssignment {
  id: string
  supplierId: string
  supplierCode: string
  supplierName: string
  contactPerson: string
  contactPhone: string
  contactEmail: string
  address: typeof factorySupplierOptions[number]["address"]
  shipFromWarehouseId: string
  shipFromWarehouseName: string
  shipFromAddress: typeof factorySupplierOptions[number]["address"]
  useFinishedGoodsWarehouse: boolean
  finishedGoodsWarehouseId: string
  finishedGoodsWarehouseName: string
  targetWarehouseId: string
  targetWarehouseName: string
  lineAllocations: FactoryVendorLineAllocation[]
}

interface FactoryVendorLineAllocation {
  lineItemId: string
  quantity: number
}

const factorySupplierOptions = [
  {
    id: "FAC-SUP-001",
    code: "FAC001",
    name: "Shenzhen Smart Factory",
    contactPerson: "Linda Chen",
    contactPhone: "+86 755 8888 0001",
    contactEmail: "ops@sz-smart.example",
    address: {
      department: "Outbound Dock",
      contactPerson: "Linda Chen",
      contactPhone: "+86 755 8888 0001",
      contactEmail: "ops@sz-smart.example",
      country: "China",
      state: "Guangdong",
      city: "Shenzhen",
      address1: "No. 18 Bao'an Industrial Road",
      address2: "Dock A",
      zipCode: "518000",
    },
  },
  {
    id: "FAC-SUP-002",
    code: "FAC002",
    name: "Dongguan Precision Works",
    contactPerson: "Kevin Wu",
    contactPhone: "+86 769 6666 1200",
    contactEmail: "shipping@dg-precision.example",
    address: {
      department: "Shipping Office",
      contactPerson: "Kevin Wu",
      contactPhone: "+86 769 6666 1200",
      contactEmail: "shipping@dg-precision.example",
      country: "China",
      state: "Guangdong",
      city: "Dongguan",
      address1: "88 Chang'an Manufacturing Ave",
      address2: "Gate 3",
      zipCode: "523000",
    },
  },
  {
    id: "FAC-SUP-003",
    code: "FAC003",
    name: "Vietnam Assembly Partner",
    contactPerson: "Minh Tran",
    contactPhone: "+84 28 7000 2211",
    contactEmail: "fulfillment@vn-assembly.example",
    address: {
      department: "Export Warehouse",
      contactPerson: "Minh Tran",
      contactPhone: "+84 28 7000 2211",
      contactEmail: "fulfillment@vn-assembly.example",
      country: "Vietnam",
      state: "Binh Duong",
      city: "Thu Dau Mot",
      address1: "Lot B7, VSIP Industrial Park",
      address2: "",
      zipCode: "820000",
    },
  },
]

const vendorShipFromWarehouseOptions = [
  { vendorId: "FAC-SUP-001", id: "FAC001-SHIP-01", name: "Shenzhen Factory Dock A", address: factorySupplierOptions[0].address },
  {
    vendorId: "FAC-SUP-001",
    id: "FAC001-SHIP-02",
    name: "Shenzhen Factory Dock B",
    address: { ...factorySupplierOptions[0].address, department: "Outbound Dock B", address2: "Dock B" },
  },
  { vendorId: "FAC-SUP-002", id: "FAC002-SHIP-01", name: "Dongguan Main Shipping Dock", address: factorySupplierOptions[1].address },
  {
    vendorId: "FAC-SUP-002",
    id: "FAC002-SHIP-02",
    name: "Dongguan Finished Goods Gate",
    address: { ...factorySupplierOptions[1].address, department: "Finished Goods Gate", address2: "Gate 5" },
  },
  { vendorId: "FAC-SUP-003", id: "FAC003-SHIP-01", name: "Vietnam Export Warehouse", address: factorySupplierOptions[2].address },
]

const vendorFinishedGoodsWarehouseOptions = [
  { vendorId: "FAC-SUP-001", id: "FAC001-FG-01", name: "Shenzhen Vendor FG Warehouse" },
  { vendorId: "FAC-SUP-001", id: "FAC001-FG-02", name: "Bao'an Vendor FG Buffer" },
  { vendorId: "FAC-SUP-002", id: "FAC002-FG-01", name: "Dongguan Vendor FG Warehouse" },
  { vendorId: "FAC-SUP-003", id: "FAC003-FG-01", name: "Vietnam Vendor FG Warehouse" },
]

const targetWarehouseOptions = [
  {
    id: "WH001",
    name: "Main Warehouse - Los Angeles",
    department: "Inbound Receiving",
    contactPerson: "LA Receiving Team",
    contactPhone: "+1 213 555 0100",
    contactEmail: "receiving.la@example.com",
    country: "United States",
    state: "CA",
    city: "Los Angeles",
    address1: "1234 Warehouse Street",
    address2: "Dock 8",
    zipCode: "90001",
  },
  {
    id: "WH002",
    name: "East Distribution Center - New York",
    department: "Inbound Receiving",
    contactPerson: "NY Receiving Team",
    contactPhone: "+1 718 555 0188",
    contactEmail: "receiving.ny@example.com",
    country: "United States",
    state: "NY",
    city: "New York",
    address1: "450 Distribution Avenue",
    address2: "Gate B",
    zipCode: "11201",
  },
  {
    id: "WH003",
    name: "West Fulfillment Center - Seattle",
    department: "Fulfillment Inbound",
    contactPerson: "Seattle Receiving Team",
    contactPhone: "+1 206 555 0144",
    contactEmail: "receiving.seattle@example.com",
    country: "United States",
    state: "WA",
    city: "Seattle",
    address1: "7800 Fulfillment Way",
    address2: "Door 12",
    zipCode: "98108",
  },
  {
    id: "WH004",
    name: "Central Warehouse - Chicago",
    department: "Central Inbound",
    contactPerson: "Chicago Receiving Team",
    contactPhone: "+1 312 555 0199",
    contactEmail: "receiving.chicago@example.com",
    country: "United States",
    state: "IL",
    city: "Chicago",
    address1: "2100 Central Warehouse Road",
    address2: "Receiving Office",
    zipCode: "60632",
  },
]

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
  })

  const handleApply = () => {
    if (batchData.quantity) onBatchUpdate('quantity', parseInt(batchData.quantity))
    if (batchData.currency) onBatchUpdate('currency', batchData.currency)
    if (batchData.unitPrice) onBatchUpdate('unitPrice', parseFloat(batchData.unitPrice))
    if (batchData.taxRate) onBatchUpdate('taxRate', parseFloat(batchData.taxRate))
    if (batchData.notes) onBatchUpdate('notes', batchData.notes)
    onBatchUpdate('requiresSerialNumber', batchData.requiresSerialNumber)

    // Reset form
    setBatchData({
      quantity: '',
      currency: '',
      unitPrice: '',
      taxRate: '',
      notes: '',
      requiresSerialNumber: false,
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
              onChange={(e) => setBatchData({ ...batchData, quantity: e.target.value })}
              placeholder={t('enterQuantity')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchCurrency">{t('currency')}</Label>
            <Select value={batchData.currency} onValueChange={(value) => setBatchData({ ...batchData, currency: value })}>
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
              onChange={(e) => setBatchData({ ...batchData, unitPrice: e.target.value })}
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
              onChange={(e) => setBatchData({ ...batchData, taxRate: e.target.value })}
              placeholder="13"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchNotes">{t('notes')}</Label>
            <Input
              id="batchNotes"
              value={batchData.notes}
              onChange={(e) => setBatchData({ ...batchData, notes: e.target.value })}
              placeholder={t('enterNotes')}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={batchData.requiresSerialNumber}
                onChange={(e) => setBatchData({ ...batchData, requiresSerialNumber: e.target.checked })}
                className="rounded"
              />
              {t('requiresSN')}
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
  const { t, language } = useI18n()
  const router = useRouter()
  const tf = React.useCallback((en: string, zh: string) => language === "zh" ? zh : en, [language])

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
    supplierId: "",
    supplierName: "",
    supplierCode: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
  })

  // Factory Direct Configuration State
  const [factoryDirectConfig, setFactoryDirectConfig] = React.useState<FactoryDirectConfig>({
    viaFinishedGoodsWarehouse: true,
    sourceAddressMode: "SUPPLIER_DEFAULT",
    factoryId: "",
    factoryName: "",
    finishedGoodsWarehouseId: "",
    finishedGoodsWarehouseName: "",
    finalDestinationId: "",
    finalDestinationType: "US_WAREHOUSE",
    finalDestinationName: "",
    autoCreateMasterReceipt: true,
    autoCreateVendorPO: true,
    autoCreateVendorSO: true,
  })
  const [factoryVendors, setFactoryVendors] = React.useState<FactoryVendorAssignment[]>([])

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
  const [showFactoryFulfillmentDialog, setShowFactoryFulfillmentDialog] = React.useState(false)
  const [factoryDirectPOSaved, setFactoryDirectPOSaved] = React.useState(false)
  const [vendorPOGrouping, setVendorPOGrouping] = React.useState("PER_VENDOR")
  const [vendorSendMode, setVendorSendMode] = React.useState("DRAFT_REVIEW")
  const [activeVendorItemDialogId, setActiveVendorItemDialogId] = React.useState<string | null>(null)
  const [vendorItemDraftAllocations, setVendorItemDraftAllocations] = React.useState<Record<string, number>>({})

  // SN/LOT Management Dialog State
  const [showSNLotDialog, setShowSNLotDialog] = React.useState(false)
  const [selectedLineItemForSNLot, setSelectedLineItemForSNLot] = React.useState<string | null>(null)

  const [attachments, setAttachments] = React.useState<File[]>([])
  const [notes, setNotes] = React.useState("")

  // ─── Unsaved Changes Confirmation ──────────────────────────────────────────
  const [showLeaveConfirm, setShowLeaveConfirm] = React.useState(false)
  const [isDirty, setIsDirty] = React.useState(false)
  const isFirstMount = React.useRef(true)

  // Track changes to mark form as dirty
  React.useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    setIsDirty(true)
  }, [
    lineItems,
    supplierInfo,
    purchaseType,
    originalPoNo,
    referenceNo,
    notes,
    attachments,
    deliveryInfo,
    receivingAddress,
    shippingAddress,
    factoryDirectConfig,
    factoryVendors,
    priority,
    department,
    budgetProject
  ])

  const buildFactoryVendorAssignment = (supplierId: string): FactoryVendorAssignment | null => {
    const supplier = factorySupplierOptions.find(item => item.id === supplierId)
    if (!supplier) return null
    const defaultShipFrom = vendorShipFromWarehouseOptions.find(item => item.vendorId === supplierId)
    const defaultTargetWarehouse = targetWarehouseOptions.find(item => item.id === deliveryInfo.warehouse)

    return {
      id: `${supplier.id}-${Date.now()}`,
      supplierId: supplier.id,
      supplierCode: supplier.code,
      supplierName: supplier.name,
      contactPerson: supplier.contactPerson,
      contactPhone: supplier.contactPhone,
      contactEmail: supplier.contactEmail,
      address: supplier.address,
      shipFromWarehouseId: defaultShipFrom?.id || "",
      shipFromWarehouseName: defaultShipFrom?.name || supplier.name,
      shipFromAddress: defaultShipFrom?.address || supplier.address,
      useFinishedGoodsWarehouse: false,
      finishedGoodsWarehouseId: "",
      finishedGoodsWarehouseName: "",
      targetWarehouseId: defaultTargetWarehouse?.id || deliveryInfo.warehouse,
      targetWarehouseName: defaultTargetWarehouse?.name || factoryDirectConfig.finalDestinationName || deliveryInfo.warehouse,
      lineAllocations: [],
    }
  }

  const syncPrimaryFactoryVendor = (vendor: FactoryVendorAssignment) => {
    setSupplierInfo({
      supplierId: vendor.supplierId,
      supplierName: vendor.supplierName,
      supplierCode: vendor.supplierCode,
      contactPerson: vendor.contactPerson,
      contactPhone: vendor.contactPhone,
      contactEmail: vendor.contactEmail,
    })
    setFactoryDirectConfig(prev => ({
      ...prev,
      factoryId: vendor.supplierId,
      factoryName: vendor.supplierName,
      sourceAddressMode: "SUPPLIER_DEFAULT",
    }))
    setShippingAddress(vendor.address)
  }

  const handleFactorySupplierSelect = (supplierId: string) => {
    const vendor = buildFactoryVendorAssignment(supplierId)
    if (!vendor) return

    setFactoryVendors([vendor])
    syncPrimaryFactoryVendor(vendor)
  }

  const handleAddFactoryVendor = () => {
    const nextSupplier = factorySupplierOptions.find(
      supplier => !factoryVendors.some(vendor => vendor.supplierId === supplier.id)
    )

    if (!nextSupplier) {
      toast.error("可添加的供应商 / 工厂已全部添加")
      return
    }

    const vendor = buildFactoryVendorAssignment(nextSupplier.id)
    if (!vendor) return

    setFactoryVendors(prev => {
      const next = [...prev, vendor]
      if (prev.length === 0) syncPrimaryFactoryVendor(vendor)
      return next
    })
  }

  const handleFactoryVendorChange = (assignmentId: string, supplierId: string) => {
    const vendor = buildFactoryVendorAssignment(supplierId)
    if (!vendor) return

    setFactoryVendors(prev => {
      const next = prev.map(item => item.id === assignmentId ? {
        ...vendor,
        id: assignmentId,
        shipFromWarehouseId: vendor.shipFromWarehouseId,
        shipFromWarehouseName: vendor.shipFromWarehouseName,
        shipFromAddress: vendor.shipFromAddress,
        useFinishedGoodsWarehouse: item.useFinishedGoodsWarehouse,
        finishedGoodsWarehouseId: "",
        finishedGoodsWarehouseName: "",
        targetWarehouseId: item.targetWarehouseId,
        targetWarehouseName: item.targetWarehouseName,
        lineAllocations: item.lineAllocations,
      } : item)
      const primaryVendor = next[0]
      if (primaryVendor) syncPrimaryFactoryVendor(primaryVendor)
      return next
    })
  }

  const updateFactoryVendor = (assignmentId: string, updates: Partial<FactoryVendorAssignment>) => {
    setFactoryVendors(prev => prev.map(vendor =>
      vendor.id === assignmentId ? { ...vendor, ...updates } : vendor
    ))
  }

  const getVendorLineAllocatedQty = (vendor: FactoryVendorAssignment, lineItemId: string) =>
    vendor.lineAllocations.find(allocation => allocation.lineItemId === lineItemId)?.quantity || 0

  const getLineAllocatedQty = (lineItemId: string, excludingVendorId?: string) =>
    factoryVendors.reduce((sum, vendor) => {
      if (excludingVendorId && vendor.id === excludingVendorId) return sum
      return sum + getVendorLineAllocatedQty(vendor, lineItemId)
    }, 0)

  const getLineRemainingQty = (lineItem: POLineItem, excludingVendorId?: string) =>
    Math.max(0, lineItem.quantity - getLineAllocatedQty(lineItem.id, excludingVendorId))

  const updateVendorLineAllocation = (vendorId: string, lineItemId: string, quantity: number) => {
    const lineItem = lineItems.find(item => item.id === lineItemId)
    if (!lineItem) return

    const maxQty = getLineRemainingQty(lineItem, vendorId)
    const nextQty = Math.min(Math.max(0, Number.isFinite(quantity) ? quantity : 0), maxQty)

    setFactoryVendors(prev => prev.map(vendor => {
      if (vendor.id !== vendorId) return vendor

      const otherAllocations = vendor.lineAllocations.filter(allocation => allocation.lineItemId !== lineItemId)
      return {
        ...vendor,
        lineAllocations: nextQty > 0
          ? [...otherAllocations, { lineItemId, quantity: nextQty }]
          : otherAllocations,
      }
    }))
  }

  const openVendorItemDialog = (vendorId: string) => {
    const vendor = factoryVendors.find(item => item.id === vendorId)
    if (!vendor) return

    setVendorItemDraftAllocations(
      Object.fromEntries(vendor.lineAllocations.map(allocation => [allocation.lineItemId, allocation.quantity]))
    )
    setActiveVendorItemDialogId(vendorId)
  }

  const closeVendorItemDialog = () => {
    setActiveVendorItemDialogId(null)
    setVendorItemDraftAllocations({})
  }

  const updateVendorItemDraftQty = (lineItemId: string, quantity: number) => {
    if (!activeVendorItemDialogId) return

    const lineItem = lineItems.find(item => item.id === lineItemId)
    if (!lineItem) return

    const maxQty = getLineRemainingQty(lineItem, activeVendorItemDialogId)
    const nextQty = Math.min(Math.max(0, Number.isFinite(quantity) ? quantity : 0), maxQty)

    setVendorItemDraftAllocations(prev => {
      const next = { ...prev }
      if (nextQty > 0) {
        next[lineItemId] = nextQty
      } else {
        delete next[lineItemId]
      }
      return next
    })
  }

  const confirmVendorItemDialog = () => {
    if (!activeVendorItemDialogId) return

    setFactoryVendors(prev => prev.map(vendor => {
      if (vendor.id !== activeVendorItemDialogId) return vendor
      return {
        ...vendor,
        lineAllocations: Object.entries(vendorItemDraftAllocations)
          .map(([lineItemId, quantity]) => ({ lineItemId, quantity }))
          .filter(allocation => allocation.quantity > 0),
      }
    }))
    closeVendorItemDialog()
  }

  const handleVendorShipFromWarehouseChange = (assignmentId: string, warehouseId: string) => {
    const vendor = factoryVendors.find(item => item.id === assignmentId)
    const warehouse = vendorShipFromWarehouseOptions.find(item => item.vendorId === vendor?.supplierId && item.id === warehouseId)
    if (!warehouse) return

    updateFactoryVendor(assignmentId, {
      shipFromWarehouseId: warehouse.id,
      shipFromWarehouseName: warehouse.name,
      shipFromAddress: warehouse.address,
    })
  }

  const handleVendorFinishedGoodsWarehouseChange = (assignmentId: string, warehouseId: string) => {
    const vendor = factoryVendors.find(item => item.id === assignmentId)
    const warehouse = vendorFinishedGoodsWarehouseOptions.find(item => item.vendorId === vendor?.supplierId && item.id === warehouseId)
    if (!warehouse) return

    updateFactoryVendor(assignmentId, {
      finishedGoodsWarehouseId: warehouse.id,
      finishedGoodsWarehouseName: warehouse.name,
    })
  }

  const handleVendorTargetWarehouseChange = (assignmentId: string, warehouseId: string) => {
    const warehouse = targetWarehouseOptions.find(item => item.id === warehouseId)
    updateFactoryVendor(assignmentId, {
      targetWarehouseId: warehouseId,
      targetWarehouseName: warehouse?.name || warehouseId,
    })
  }

  const handleRemoveFactoryVendor = (assignmentId: string) => {
    setFactoryVendors(prev => {
      const next = prev.filter(item => item.id !== assignmentId)
      setLineItems(current => current.map(item => {
        const removedVendor = prev.find(vendor => vendor.id === assignmentId)
        return removedVendor && item.supplierName === removedVendor.supplierName
          ? { ...item, supplierName: "" }
          : item
      }))

      if (next[0]) {
        syncPrimaryFactoryVendor(next[0])
      } else {
        setSupplierInfo({
          supplierId: "",
          supplierName: "",
          supplierCode: "",
          contactPerson: "",
          contactPhone: "",
          contactEmail: "",
        })
        setFactoryDirectConfig(prevConfig => ({
          ...prevConfig,
          factoryId: "",
          factoryName: "",
        }))
      }

      return next
    })
  }

  const handleFactoryDestinationWarehouseChange = (warehouseId: string) => {
    const warehouse = targetWarehouseOptions.find(item => item.id === warehouseId)
    const warehouseAddress = warehouse
      ? `${warehouse.address1}, ${warehouse.city}, ${warehouse.state} ${warehouse.zipCode}`
      : ""

    setDeliveryInfo(prev => ({
      ...prev,
      warehouse: warehouseId,
      warehouseAddress,
    }))

    if (warehouse) {
      setReceivingAddress({
        department: warehouse.department,
        contactPerson: warehouse.contactPerson,
        contactPhone: warehouse.contactPhone,
        contactEmail: warehouse.contactEmail,
        country: warehouse.country,
        state: warehouse.state,
        city: warehouse.city,
        address1: warehouse.address1,
        address2: warehouse.address2,
        zipCode: warehouse.zipCode,
      })
    }

    if (purchaseType === "FACTORY_DIRECT") {
      setFactoryDirectConfig(prev => ({
        ...prev,
        finalDestinationType: "US_WAREHOUSE",
        finalDestinationId: warehouseId,
        finalDestinationName: warehouse?.name || warehouseId,
      }))
      setFactoryVendors(prev => prev.map(vendor => ({
        ...vendor,
        targetWarehouseId: warehouseId,
        targetWarehouseName: warehouse?.name || warehouseId,
      })))
    }
  }


  // Handle navigation back/cancel (trigger custom dialog)
  const handleNavigationBack = () => {
    if (isDirty) {
      setShowLeaveConfirm(true)
    } else {
      router.back()
    }
  }

  const confirmLeave = () => {
    setShowLeaveConfirm(false)
    router.back()
  }

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
    const isFactoryDirect = purchaseType === "FACTORY_DIRECT"
    const baseValid = purchaseType &&
      (isFactoryDirect ? true : supplierInfo.supplierName) &&
      deliveryInfo.warehouse &&
      deliveryInfo.expectedDeliveryDate &&
      deliveryInfo.latestShippingTime &&
      priority &&
      lineItems.length > 0 &&
      lineItems.every(item =>
        item.skuCode &&
        item.quantity > 0 &&
        item.unitPrice > 0
      )

    return Boolean(baseValid)
  }

  const goToCreatedPODetail = React.useCallback(() => {
    router.push("/purchase/po/1")
  }, [router])

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
      status: "DRAFT",
      basic: { poNumber, originalPoNo, referenceNo, priority, department, budgetProject, purchaseType },
      supplier: supplierInfo,
      factoryDirect: purchaseType === "FACTORY_DIRECT" ? factoryDirectConfig : undefined,
      shippingAddress,
      receivingAddress,
      delivery: deliveryInfo,
      costInfo,
      lineItems,
      attachments,
      notes,
      totals: { totalItems, totalQuantity, totalsByCurrency, grandTotal }
    })

    // Simulate successful save
    toast.success(t('draftSavedSuccess' as any), {
      description: `PO ${poNumber} saved as draft`
    })

    setIsDirty(false) // Clear dirty flag after saving

    // Redirect to list page after delay
    setTimeout(() => {
      router.push('/purchase/po')
    }, 1000)
  }

  // Handle submit PO
  const handleSubmitPO = () => {
    if (!isFormValid()) {
      toast.error(t('formValidationFailed' as any), {
        description: t('pleaseFillRequiredFields')
      })
      return
    }

    const payload = {
      status: purchaseType === "FACTORY_DIRECT" ? "PENDING_VENDOR_ALLOCATION" : "NEW",
      basic: { poNumber, originalPoNo, referenceNo, priority, department, budgetProject, purchaseType },
      supplier: supplierInfo,
      factoryDirect: purchaseType === "FACTORY_DIRECT" ? factoryDirectConfig : undefined,
      shippingAddress,
      receivingAddress,
      delivery: deliveryInfo,
      costInfo,
      lineItems,
      attachments,
      notes,
      totals: { totalItems, totalQuantity, totalsByCurrency, grandTotal }
    }

    console.log("Submit PO:", payload)

    // Simulate successful submit
    setIsDirty(false) // Clear dirty flag after submitting

    if (purchaseType === "FACTORY_DIRECT") {
      setFactoryDirectPOSaved(true)
      toast.success(tf("Master PO saved", "主 PO 已保存"), {
        description: tf(
          `PO ${poNumber} is ready for factory fulfillment setup`,
          `PO ${poNumber} 已保存，可以配置工厂履约`
        )
      })
      setShowFactoryFulfillmentDialog(true)
      return
    }

    toast.success(t('poSubmittedSuccess' as any), {
      description: `PO ${poNumber} successfully submitted`
    })

    setTimeout(() => {
      router.push('/purchase/po')
    }, 1000)
  }

  const vendorPOPreviews = React.useMemo(() => {
    if (purchaseType !== "FACTORY_DIRECT") return []

    return factoryVendors
      .map(vendor => {
        const lines = vendor.lineAllocations
          .map(allocation => {
            const lineItem = lineItems.find(item => item.id === allocation.lineItemId)
            if (!lineItem || allocation.quantity <= 0) return null
            const subtotal = allocation.quantity * lineItem.unitPrice
            return {
              ...lineItem,
              quantity: allocation.quantity,
              lineAmount: subtotal + (subtotal * (lineItem.taxRate / 100)),
              sourceQuantity: lineItem.quantity,
            }
          })
          .filter((line): line is POLineItem & { sourceQuantity: number } => Boolean(line))
        return {
          vendor,
          vendorPoNo: `${poNumber}-${String(factoryVendors.indexOf(vendor) + 1).padStart(2, "0")}`,
          lines,
          totalQty: lines.reduce((sum, item) => sum + item.quantity, 0),
          totalAmount: lines.reduce((sum, item) => sum + item.lineAmount, 0),
        }
      })
      .filter(preview => preview.lines.length > 0)
  }, [factoryVendors, lineItems, poNumber, purchaseType])

  const unassignedFactoryLines = React.useMemo(() => {
    if (purchaseType !== "FACTORY_DIRECT") return []
    return lineItems
      .map(item => {
        const allocatedQuantity = factoryVendors.reduce((sum, vendor) =>
          sum + (vendor.lineAllocations.find(allocation => allocation.lineItemId === item.id)?.quantity || 0), 0)
        return {
          ...item,
          allocatedQuantity,
          remainingQuantity: Math.max(0, item.quantity - allocatedQuantity),
        }
      })
      .filter(item => item.remainingQuantity > 0)
  }, [factoryVendors, lineItems, purchaseType])

  const handleCreateVendorPOs = () => {
    if (factoryVendors.length === 0) {
      toast.error(tf("Add at least one vendor before generating vendor POs", "生成 vendor PO 前请至少添加一个 vendor"))
      return
    }

    if (unassignedFactoryLines.length > 0) {
      toast.error(tf("Assign every item line to a vendor first", "请先为每个商品行分配 vendor"))
      return
    }

    const invalidVendor = vendorPOPreviews.find(({ vendor }) =>
      !vendor.shipFromWarehouseId ||
      !vendor.targetWarehouseId ||
      (vendor.useFinishedGoodsWarehouse && !vendor.finishedGoodsWarehouseId)
    )

    if (invalidVendor) {
      toast.error(tf("Complete vendor fulfillment settings first", "请先补全 vendor 履约设置"), {
        description: tf(
          `${invalidVendor.vendor.supplierName} is missing fulfillment settings.`,
          `${invalidVendor.vendor.supplierName} 缺少发货仓、成品仓或目标入库配置。`
        )
      })
      return
    }

    console.log("Create Vendor POs:", {
      sourcePoNo: poNumber,
      factoryDirect: factoryDirectConfig,
      vendorPOGrouping,
      vendorSendMode,
      masterReceipt: {
        autoCreate: true,
        warehouseId: factoryDirectConfig.finalDestinationId || deliveryInfo.warehouse,
        warehouseName: factoryDirectConfig.finalDestinationName,
      },
      vendorPOs: vendorPOPreviews,
    })

    toast.success(tf("Vendor POs prepared", "Vendor PO 已生成"), {
      description: tf(
        `${vendorPOPreviews.length} vendor PO(s) generated as ${vendorSendMode === "SEND_NOW" ? "ready to send" : "drafts"}`,
        `已生成 ${vendorPOPreviews.length} 张 vendor PO，状态为${vendorSendMode === "SEND_NOW" ? "待发送" : "草稿"}`
      )
    })
    setShowFactoryFulfillmentDialog(false)
    goToCreatedPODetail()
  }

  // ─── Import Feature State ───────────────────────────────────────────────────
  const [showImportDialog, setShowImportDialog] = React.useState(false)
  const [importPreviewRows, setImportPreviewRows] = React.useState<Array<{
    row: Partial<POLineItem> & { _errors: string[]; _lineNo: number }
  }>>([])
  const [importLoading, setImportLoading] = React.useState(false)
  const importFileInputRef = React.useRef<HTMLInputElement>(null)

  // Download CSV template
  const handleDownloadTemplate = () => {
    const headers = [
      'SKU Code',
      'Product Name',
      'Specifications',
      'Quantity',
      'UOM',
      'Currency',
      'Unit Price',
      'Tax Rate (%)',
      'Notes',
    ]
    const exampleRows = [
      ['SKU-001', 'Sample Product A', 'Color: Red / Size: M', '100', 'PCS', 'USD', '25.00', '13', 'First batch'],
      ['SKU-002', 'Sample Product B', 'Color: Blue / Size: L', '50', 'SET', 'USD', '89.90', '13', ''],
    ]
    const csvContent = [
      headers.join(','),
      ...exampleRows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'po_line_items_template.csv'
    link.click()
    URL.revokeObjectURL(url)
    toast.success('模板下载成功', { description: '请按模板格式填写产品明细后导入' })
  }

  // Parse CSV file and open preview dialog
  const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!event.target.files) return
    // reset input so same file can be re-selected
    event.target.value = ''
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('格式不支持', { description: '请上传 .csv 格式的文件' })
      return
    }

    setImportLoading(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = (e.target?.result as string) || ''
        // Remove BOM if present
        const cleaned = text.replace(/^\uFEFF/, '')
        const lines = cleaned.split(/\r?\n/).filter(l => l.trim())

        if (lines.length < 2) {
          toast.error('文件内容为空', { description: '模板至少需要 1 行数据（不含表头）' })
          setImportLoading(false)
          return
        }

        // Parse CSV respecting quoted fields
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = []
          let current = ''
          let inQuotes = false
          for (let i = 0; i < line.length; i++) {
            const char = line[i]
            if (char === '"') {
              inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim())
              current = ''
            } else {
              current += char
            }
          }
          result.push(current.trim())
          return result
        }

        // Skip header row
        const dataLines = lines.slice(1)
        const defaultTaxRate = 13

        const parsedRows = dataLines.map((line, idx) => {
          const cols = parseCSVLine(line)
          const errors: string[] = []

          const skuCode = cols[0] || ''
          const productName = cols[1] || ''
          const specifications = cols[2] || ''
          const quantityRaw = cols[3] || ''
          const uom = cols[4] || 'PCS'
          const currency = cols[5] || 'USD'
          const unitPriceRaw = cols[6] || ''
          const taxRateRaw = cols[7] || String(defaultTaxRate)
          const notes = cols[8] || ''

          if (!skuCode) errors.push('SKU Code 不能为空')
          if (!productName) errors.push('Product Name 不能为空')
          const quantity = parseInt(quantityRaw, 10)
          if (isNaN(quantity) || quantity <= 0) errors.push('数量必须为正整数')
          const unitPrice = parseFloat(unitPriceRaw)
          if (isNaN(unitPrice) || unitPrice < 0) errors.push('单价必须为有效数字')
          const taxRate = parseFloat(taxRateRaw)
          const effectiveTaxRate = isNaN(taxRate) ? defaultTaxRate : taxRate

          const qty = isNaN(quantity) ? 1 : quantity
          const price = isNaN(unitPrice) ? 0 : unitPrice
          const subtotal = qty * price
          const taxAmount = subtotal * (effectiveTaxRate / 100)
          const lineAmount = subtotal + taxAmount

          const row: Partial<POLineItem> & { _errors: string[]; _lineNo: number } = {
            _lineNo: idx + 2, // 1-based, + header row
            _errors: errors,
            id: `import-${Date.now()}-${idx}`,
            lineNo: lineItems.length + idx + 1,
            productId: `import-${skuCode}-${idx}`,
            skuCode,
            productName,
            specifications,
            quantity: qty,
            uom,
            currency,
            unitPrice: price,
            taxRate: effectiveTaxRate,
            taxAmount,
            lineAmount,
            requiresSerialNumber: false,
            requiresLotNumber: false,
            specifiedSerialNumbers: [],
            specifiedLotNumbers: [],
            notes,
          }
          return { row }
        })

        setImportPreviewRows(parsedRows)
        setShowImportDialog(true)
      } catch (err) {
        toast.error('解析失败', { description: '文件格式有误，请使用下载的模板' })
      } finally {
        setImportLoading(false)
      }
    }
    reader.onerror = () => {
      toast.error('读取失败', { description: '文件读取出错，请重试' })
      setImportLoading(false)
    }
    reader.readAsText(file, 'UTF-8')
  }

  // Confirm import: append valid rows to line items
  const handleConfirmImport = () => {
    const validRows = importPreviewRows
      .filter(({ row }) => row._errors.length === 0)
      .map(({ row }) => ({
        ...row,
        id: `import-${Date.now()}-${Math.random()}`,
        lineNo: lineItems.length + importPreviewRows.filter(({ row: r }) => r._errors.length === 0).indexOf(
          importPreviewRows.find(({ row: r }) => r.skuCode === row.skuCode && r._lineNo === row._lineNo)!
        ) + 1,
      } as POLineItem))

    // Re-assign lineNo sequentially
    const baseNo = lineItems.length
    const finalRows = validRows.map((row, idx) => ({ ...row, lineNo: baseNo + idx + 1 }))

    setLineItems([...lineItems, ...finalRows])
    setNextLineNo(lineItems.length + finalRows.length + 1)
    setShowImportDialog(false)
    setImportPreviewRows([])

    const errorCount = importPreviewRows.length - validRows.length
    if (errorCount > 0) {
      toast.warning(`导入完成（跳过 ${errorCount} 行错误数据）`, {
        description: `成功导入 ${finalRows.length} 行产品明细`
      })
    } else {
      toast.success(`导入成功`, { description: `已添加 ${finalRows.length} 行产品明细` })
    }
  }

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleNavigationBack}>
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
            <Button size="sm" onClick={handleSubmitPO} disabled={!isFormValid()}>
              <Send className="mr-2 h-4 w-4" />
              {purchaseType === "FACTORY_DIRECT" ? tf("Create PO", "创建 PO") : t('submitPO' as any)}
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
              {purchaseType === "FACTORY_DIRECT" ? tf("Factory Direct", "工厂直发") : t('supplierInfo')}
            </Button>
            {purchaseType !== "FACTORY_DIRECT" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => document.getElementById('shipping-address')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="whitespace-nowrap"
              >
                {tf("Ship-from Address", "发货地址")}
              </Button>
            )}
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

              <div className="space-y-2">
                <Label htmlFor="expectedDeliveryDate">
                  交货日期 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="expectedDeliveryDate"
                  type="datetime-local"
                  value={deliveryInfo.expectedDeliveryDate}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, expectedDeliveryDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="latestShippingTime">
                  最晚发运日期 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="latestShippingTime"
                  type="datetime-local"
                  value={deliveryInfo.latestShippingTime}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, latestShippingTime: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Information / Factory Direct Setup Notice */}
        {purchaseType === "FACTORY_DIRECT" ? (
          <Card id="supplier-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {tf("Factory Direct", "工厂直发")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-100">
                {tf(
                  "This step only saves the master PO demand. Ship-from address, vendors, routing strategy, vendor PO grouping, and release mode will be configured in the next step.",
                  "当前步骤只保存主 PO 采购需求。发货地址、vendor、入库路径、vendor PO 生成方式和发送方式将在下一步配置。"
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card id="supplier-info">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {tf("Supplier Information", "供应商信息")}
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
                      onChange={(e) => setSupplierInfo({ ...supplierInfo, supplierName: e.target.value })}
                      placeholder={t('enterSupplierName')}
                    />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="supplierCode">{tf("Supplier Code", "供应商编码")}</Label>
                    <Input
                      id="supplierCode"
                      value={supplierInfo.supplierCode || ""}
                      onChange={(e) => setSupplierInfo({ ...supplierInfo, supplierCode: e.target.value })}
                    placeholder={tf("Enter supplier code", "输入供应商编码")}
                    />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="contactPerson">{tf("Contact", "联系人")}</Label>
                    <Input
                      id="contactPerson"
                      value={supplierInfo.contactPerson}
                      onChange={(e) => setSupplierInfo({ ...supplierInfo, contactPerson: e.target.value })}
                      placeholder={t('enterContactPerson')}
                    />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="contactPhone">{tf("Phone", "联系电话")}</Label>
                    <Input
                      id="contactPhone"
                      value={supplierInfo.contactPhone}
                      onChange={(e) => setSupplierInfo({ ...supplierInfo, contactPhone: e.target.value })}
                      placeholder={t('enterContactPhone')}
                    />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="contactEmail">{tf("Email", "联系邮箱")}</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={supplierInfo.contactEmail}
                      onChange={(e) => setSupplierInfo({ ...supplierInfo, contactEmail: e.target.value })}
                      placeholder={t('enterContactEmail')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="shipping-address">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {tf("Ship-from Address", "发货地址")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shippingContactPerson">{t('contactPerson')}</Label>
                    <Input id="shippingContactPerson" value={shippingAddress.contactPerson} onChange={(e) => setShippingAddress({ ...shippingAddress, contactPerson: e.target.value })} placeholder={t('enterContactPerson')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingDepartment">{t('department')}</Label>
                    <Input id="shippingDepartment" value={shippingAddress.department} onChange={(e) => setShippingAddress({ ...shippingAddress, department: e.target.value })} placeholder={t('enterDepartment')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingContactPhone">{t('contactPhone')}</Label>
                    <Input id="shippingContactPhone" value={shippingAddress.contactPhone} onChange={(e) => setShippingAddress({ ...shippingAddress, contactPhone: e.target.value })} placeholder={t('enterContactPhone')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingContactEmail">{t('contactEmail')}</Label>
                    <Input id="shippingContactEmail" type="email" value={shippingAddress.contactEmail} onChange={(e) => setShippingAddress({ ...shippingAddress, contactEmail: e.target.value })} placeholder={t('enterContactEmail')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shippingCountry">{t('country')} <span className="text-destructive">*</span></Label>
                    <Select value={shippingAddress.country} onValueChange={(value) => setShippingAddress({ ...shippingAddress, country: value })}>
                      <SelectTrigger><SelectValue placeholder={t('selectCountry')} /></SelectTrigger>
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
                    <Label htmlFor="shippingState">{t('stateProvince')} <span className="text-destructive">*</span></Label>
                    <Select value={shippingAddress.state} onValueChange={(value) => setShippingAddress({ ...shippingAddress, state: value })}>
                      <SelectTrigger><SelectValue placeholder={t('selectState')} /></SelectTrigger>
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
                    <Label htmlFor="shippingCity">{t('cityField')} <span className="text-destructive">*</span></Label>
                    <Input id="shippingCity" value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} placeholder={t('enterCityName')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingZipCode">{t('zipCodeField')}</Label>
                    <Input id="shippingZipCode" value={shippingAddress.zipCode} onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })} placeholder={t('postalCode')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress1">{t('address1Field')} <span className="text-destructive">*</span></Label>
                    <Input id="shippingAddress1" value={shippingAddress.address1} onChange={(e) => setShippingAddress({ ...shippingAddress, address1: e.target.value })} placeholder={t('streetAddress')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress2">{t('address2Optional')}</Label>
                    <Input id="shippingAddress2" value={shippingAddress.address2} onChange={(e) => setShippingAddress({ ...shippingAddress, address2: e.target.value })} placeholder={t('apartmentFloorInfo')} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

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
                  onValueChange={handleFactoryDestinationWarehouseChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectTargetWarehouse')} />
                  </SelectTrigger>
                  <SelectContent>
                    {targetWarehouseOptions.map(warehouse => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receivingContactPerson">{t('contactPerson')}</Label>
                <Input
                  id="receivingContactPerson"
                  value={receivingAddress.contactPerson}
                  onChange={(e) => setReceivingAddress({ ...receivingAddress, contactPerson: e.target.value })}
                  placeholder={t('enterContactPerson')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receivingDepartment">{t('department')}</Label>
                <Input
                  id="receivingDepartment"
                  value={receivingAddress.department}
                  onChange={(e) => setReceivingAddress({ ...receivingAddress, department: e.target.value })}
                  placeholder={t('enterDepartment')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receivingContactPhone">{t('contactPhone')}</Label>
                <Input
                  id="receivingContactPhone"
                  value={receivingAddress.contactPhone}
                  onChange={(e) => setReceivingAddress({ ...receivingAddress, contactPhone: e.target.value })}
                  placeholder={t('enterContactPhone')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receivingContactEmail">{t('contactEmail')}</Label>
                <Input
                  id="receivingContactEmail"
                  type="email"
                  value={receivingAddress.contactEmail}
                  onChange={(e) => setReceivingAddress({ ...receivingAddress, contactEmail: e.target.value })}
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
                  onValueChange={(value) => setReceivingAddress({ ...receivingAddress, country: value })}
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
                  onValueChange={(value) => setReceivingAddress({ ...receivingAddress, state: value })}
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
                  onChange={(e) => setReceivingAddress({ ...receivingAddress, city: e.target.value })}
                  placeholder={t('enterCityName')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receivingZipCode">{t('zipCodeField')}</Label>
                <Input
                  id="receivingZipCode"
                  value={receivingAddress.zipCode}
                  onChange={(e) => setReceivingAddress({ ...receivingAddress, zipCode: e.target.value })}
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
                  onChange={(e) => setReceivingAddress({ ...receivingAddress, address1: e.target.value })}
                  placeholder={t('streetAddress')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receivingAddress2">{t('address2Optional')}</Label>
                <Input
                  id="receivingAddress2"
                  value={receivingAddress.address2}
                  onChange={(e) => setReceivingAddress({ ...receivingAddress, address2: e.target.value })}
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
              <CardTitle>
                {t('productLines')} <span className="text-destructive">*</span>
              </CardTitle>
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
                {/* Import Template Buttons */}
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  下载模板
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => importFileInputRef.current?.click()}
                  disabled={importLoading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {importLoading ? '解析中...' : '导入'}
                </Button>
                <input
                  ref={importFileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImportFileChange}
                />
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
                <p className="mt-1 text-xs">
                  {tf("At least one item line is required before submitting the PO.", "提交 PO 前至少需要添加一条商品明细。")}
                </p>
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
                      <TableHead className="w-[100px]">{t('snManagement')}</TableHead>
                      <TableHead className="w-[120px]">{t('snList')}</TableHead>
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
                          onChange={(e) => setCostInfo({ ...costInfo, shippingCost: parseFloat(e.target.value) || 0 })}
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
                          onChange={(e) => setCostInfo({ ...costInfo, shippingTaxRate: parseFloat(e.target.value) || 0 })}
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
                      <td className="px-4 py-3">
                        <Label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={costInfo.isShippingTaxable}
                            onChange={(e) => setCostInfo({ ...costInfo, isShippingTaxable: e.target.checked })}
                            className="rounded"
                          />
                          {t('isShippingTaxable')}
                        </Label>
                      </td>
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
                          onChange={(e) => setCostInfo({ ...costInfo, handlingFee: parseFloat(e.target.value) || 0 })}
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
                          onChange={(e) => setCostInfo({ ...costInfo, otherCharge: parseFloat(e.target.value) || 0 })}
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
          <Button variant="outline" size="sm" onClick={handleNavigationBack}>
            {t('cancel')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveDraft}>
            <Save className="mr-2 h-4 w-4" />
            {t('saveDraft')}
          </Button>
          <Button size="sm" onClick={handleSubmitPO} disabled={!isFormValid()}>
            <Send className="mr-2 h-4 w-4" />
            {purchaseType === "FACTORY_DIRECT" ? tf("Create PO", "创建 PO") : t('submitPO' as any)}
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

        {/* Import Preview Dialog */}
        <Dialog open={showImportDialog} onOpenChange={(open) => {
          if (!open) { setShowImportDialog(false); setImportPreviewRows([]) }
        }}>
          <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <Upload className="h-5 w-5 text-primary" />
                导入预览
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                共解析 <span className="font-medium text-foreground">{importPreviewRows.length}</span> 行，
                其中{' '}
                <span className="font-medium text-emerald-600">{importPreviewRows.filter(r => r.row._errors.length === 0).length} 行有效</span>
                {importPreviewRows.some(r => r.row._errors.length > 0) && (
                  <>
                    ，<span className="font-medium text-destructive">{importPreviewRows.filter(r => r.row._errors.length > 0).length} 行有误（将跳过）</span>
                  </>
                )}
              </p>
            </DialogHeader>

            <div className="overflow-auto flex-1 px-6 py-4">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[60px] font-semibold">行号</TableHead>
                      <TableHead className="w-[50px] font-semibold">状态</TableHead>
                      <TableHead className="font-semibold">SKU Code</TableHead>
                      <TableHead className="font-semibold">产品名称</TableHead>
                      <TableHead className="font-semibold">规格</TableHead>
                      <TableHead className="w-[80px] font-semibold">数量</TableHead>
                      <TableHead className="w-[70px] font-semibold">单位</TableHead>
                      <TableHead className="w-[80px] font-semibold">币种</TableHead>
                      <TableHead className="w-[100px] font-semibold">单价</TableHead>
                      <TableHead className="w-[90px] font-semibold">税率(%)</TableHead>
                      <TableHead className="font-semibold">备注</TableHead>
                      <TableHead className="font-semibold">错误信息</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importPreviewRows.map(({ row }, idx) => {
                      const hasError = row._errors.length > 0
                      return (
                        <TableRow
                          key={idx}
                          className={hasError ? 'bg-destructive/5 hover:bg-destructive/10' : 'hover:bg-muted/30'}
                        >
                          <TableCell className="text-muted-foreground text-xs">{row._lineNo}</TableCell>
                          <TableCell>
                            {hasError ? (
                              <div className="flex items-center justify-center">
                                <div className="h-5 w-5 rounded-full bg-destructive/15 flex items-center justify-center">
                                  <X className="h-3 w-3 text-destructive" />
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className={`font-mono text-sm ${!row.skuCode ? 'text-destructive' : ''}`}>
                            {row.skuCode || <span className="italic text-muted-foreground">（空）</span>}
                          </TableCell>
                          <TableCell className={`text-sm ${!row.productName ? 'text-destructive' : ''}`}>
                            {row.productName || <span className="italic text-muted-foreground">（空）</span>}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{row.specifications || '—'}</TableCell>
                          <TableCell className="text-sm text-right">{row.quantity}</TableCell>
                          <TableCell className="text-sm">{row.uom}</TableCell>
                          <TableCell className="text-sm">{row.currency}</TableCell>
                          <TableCell className="text-sm text-right font-medium">{row.unitPrice?.toFixed(2)}</TableCell>
                          <TableCell className="text-sm text-right">{row.taxRate}%</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{row.notes || '—'}</TableCell>
                          <TableCell>
                            {hasError && (
                              <div className="space-y-1">
                                {row._errors.map((err, i) => (
                                  <div key={i} className="flex items-center gap-1 text-xs text-destructive">
                                    <AlertCircle className="h-3 w-3 shrink-0" />
                                    {err}
                                  </div>
                                ))}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t bg-muted/30 shrink-0 flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                {importPreviewRows.some(r => r.row._errors.length > 0) && (
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-amber-500" />
                    错误行将自动跳过，仅导入有效数据
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => { setShowImportDialog(false); setImportPreviewRows([]) }}
                >
                  取消
                </Button>
                <Button
                  onClick={handleConfirmImport}
                  disabled={importPreviewRows.filter(r => r.row._errors.length === 0).length === 0}
                  className="min-w-[120px]"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  确认导入 ({importPreviewRows.filter(r => r.row._errors.length === 0).length} 行)
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showFactoryFulfillmentDialog} onOpenChange={(open) => {
          setShowFactoryFulfillmentDialog(open)
          if (!open && factoryDirectPOSaved) {
            goToCreatedPODetail()
          }
        }}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                {tf("Factory Fulfillment Setup", "工厂履约配置")}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {tf(
                  `Master PO ${poNumber} is saved. Configure each vendor's ship-from warehouse, inbound route, target warehouse, and assigned item lines.`,
                  `主 PO ${poNumber} 已保存。请按 vendor 配置发货仓、入库路径、目标入库仓，并选择该 vendor 承接的商品。`
                )}
              </p>
            </DialogHeader>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{tf("Master PO", "主 PO")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">{tf("PO No.", "PO 编号")}</span>
                    <span className="font-mono">{poNumber}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">{tf("Lines", "行数")}</span>
                    <span>{lineItems.length}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">{tf("Qty", "数量")}</span>
                    <span>{totalQuantity}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{tf("Default Target Inbound", "默认目标入库")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="font-medium">{factoryDirectConfig.finalDestinationName || deliveryInfo.warehouse || "-"}</div>
                  <p className="text-xs text-muted-foreground">
                    {tf(
                      "Each vendor can keep this target warehouse or override it in its own fulfillment card.",
                      "每个 vendor 默认使用主 PO 收货仓，也可以在自己的履约卡片中单独调整。"
                    )}
                  </p>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">{tf("Master RN", "主入库单")}</span>
                    <span>{tf("Auto create", "自动生成")}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{tf("Allocation Progress", "分配进度")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{tf("Vendors", "Vendor 数")}</span><span>{factoryVendors.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{tf("Vendor POs", "Vendor PO 数")}</span><span>{vendorPOPreviews.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{tf("Unassigned lines", "未分配行")}</span><span className={unassignedFactoryLines.length ? "text-destructive font-medium" : ""}>{unassignedFactoryLines.length}</span></div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">{tf("Vendor fulfillment", "Vendor 履约设置")}</h3>
                  <p className="text-xs text-muted-foreground">
                    {tf(
                      "A vendor PO is generated from one vendor card and only contains the item lines assigned to that vendor.",
                      "一张 vendor PO 来源于一张 vendor 履约卡，只包含分配给该 vendor 的商品行。"
                    )}
                  </p>
                </div>
                <Button type="button" size="sm" onClick={handleAddFactoryVendor}>
                  <Plus className="mr-2 h-4 w-4" />
                  {tf("Add Vendor", "添加 Vendor")}
                </Button>
              </div>

              {factoryVendors.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  {tf("Add a vendor to configure ship-from, target inbound, and assigned items.", "请先添加 vendor，再配置发货仓、目标入库和承接商品。")}
                </div>
              ) : (
                <div className="grid gap-4">
                  {factoryVendors.map((vendor) => {
                    const shipFromOptions = vendorShipFromWarehouseOptions.filter(item => item.vendorId === vendor.supplierId)
                    const fgOptions = vendorFinishedGoodsWarehouseOptions.filter(item => item.vendorId === vendor.supplierId)
                    const assignedLines = vendor.lineAllocations
                      .map(allocation => {
                        const lineItem = lineItems.find(item => item.id === allocation.lineItemId)
                        return lineItem ? { ...lineItem, allocatedQuantity: allocation.quantity } : null
                      })
                      .filter((item): item is POLineItem & { allocatedQuantity: number } => Boolean(item))

                    return (
                      <Card key={vendor.id} className="border-muted-foreground/20">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <CardTitle className="text-base">{vendor.supplierName}</CardTitle>
                              <p className="text-xs text-muted-foreground">
                                {vendor.supplierCode} · {vendor.contactPerson} · {vendor.contactPhone}
                              </p>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveFactoryVendor(vendor.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2">
                              <Label>{tf("Vendor", "Vendor")}</Label>
                              <Select value={vendor.supplierId} onValueChange={(value) => handleFactoryVendorChange(vendor.id, value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {factorySupplierOptions.map(supplier => (
                                    <SelectItem
                                      key={supplier.id}
                                      value={supplier.id}
                                      disabled={factoryVendors.some(item => item.supplierId === supplier.id && item.id !== vendor.id)}
                                    >
                                      {supplier.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>{tf("Ship-from warehouse", "发货仓库")}</Label>
                              <Select value={vendor.shipFromWarehouseId} onValueChange={(value) => handleVendorShipFromWarehouseChange(vendor.id, value)}>
                                <SelectTrigger><SelectValue placeholder={tf("Select ship-from", "选择发货仓")} /></SelectTrigger>
                                <SelectContent>
                                  {shipFromOptions.map(option => (
                                    <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>{tf("Inbound route", "入库路径")}</Label>
                              <Select
                                value={vendor.useFinishedGoodsWarehouse ? "VIA_FG" : "DIRECT"}
                                onValueChange={(value) => updateFactoryVendor(vendor.id, {
                                  useFinishedGoodsWarehouse: value === "VIA_FG",
                                  finishedGoodsWarehouseId: value === "VIA_FG" ? vendor.finishedGoodsWarehouseId : "",
                                  finishedGoodsWarehouseName: value === "VIA_FG" ? vendor.finishedGoodsWarehouseName : "",
                                })}
                              >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="DIRECT">{tf("Direct to target warehouse", "直发目标仓")}</SelectItem>
                                  <SelectItem value="VIA_FG">{tf("Via vendor finished goods warehouse", "经 vendor 成品仓")}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>{tf("Target inbound warehouse", "目标入库仓")}</Label>
                              <Select value={vendor.targetWarehouseId} onValueChange={(value) => handleVendorTargetWarehouseChange(vendor.id, value)}>
                                <SelectTrigger><SelectValue placeholder={tf("Select target warehouse", "选择目标仓")} /></SelectTrigger>
                                <SelectContent>
                                  {targetWarehouseOptions.map(option => (
                                    <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {vendor.useFinishedGoodsWarehouse && (
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>{tf("Vendor finished goods warehouse", "Vendor 成品仓")}</Label>
                                <Select value={vendor.finishedGoodsWarehouseId} onValueChange={(value) => handleVendorFinishedGoodsWarehouseChange(vendor.id, value)}>
                                  <SelectTrigger><SelectValue placeholder={tf("Select finished goods warehouse", "选择成品仓")} /></SelectTrigger>
                                  <SelectContent>
                                    {fgOptions.length === 0 ? (
                                      <SelectItem value="NO_FG" disabled>{tf("No finished goods warehouse configured", "该 vendor 未配置成品仓")}</SelectItem>
                                    ) : fgOptions.map(option => (
                                      <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                                {tf(
                                  "If this vendor has no finished goods warehouse, switch the route to direct shipment.",
                                  "如果该 vendor 没有成品仓，请将入库路径切换为直发目标仓。"
                                )}
                              </div>
                            </div>
                          )}

                          <div className="rounded-md border bg-muted/20 p-3 text-xs text-muted-foreground">
                            <div className="mb-1 font-medium text-foreground">{tf("Ship-from address", "发货地址")}</div>
                            <div>{vendor.shipFromAddress.address1}{vendor.shipFromAddress.address2 ? `, ${vendor.shipFromAddress.address2}` : ""}</div>
                            <div>{vendor.shipFromAddress.city}, {vendor.shipFromAddress.state} {vendor.shipFromAddress.zipCode}, {vendor.shipFromAddress.country}</div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>{tf("Items handled by this vendor", "该 vendor 承接商品")}</Label>
                                <p className="text-xs text-muted-foreground">
                                  {tf("Add items from the master PO and set the quantity this vendor will fulfill.", "从主 PO 添加商品，并设置该 vendor 承接数量。")}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{assignedLines.length} line(s)</Badge>
                                <Button type="button" size="sm" variant="outline" onClick={() => openVendorItemDialog(vendor.id)}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  {tf("Add Items", "添加商品")}
                                </Button>
                              </div>
                            </div>
                            {assignedLines.length === 0 ? (
                              <div className="rounded-md border border-dashed p-5 text-center text-sm text-muted-foreground">
                                {tf("No items assigned yet. Click Add Items to choose from the master PO.", "还没有承接商品。点击添加商品，从主 PO 中选择。")}
                              </div>
                            ) : (
                              <div className="rounded-md border overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-[72px]">{tf("Line", "行号")}</TableHead>
                                      <TableHead>SKU</TableHead>
                                      <TableHead>{tf("Product", "商品")}</TableHead>
                                      <TableHead className="text-right">{tf("PO Qty", "PO 数量")}</TableHead>
                                      <TableHead className="text-right">{tf("Vendor Qty", "Vendor 数量")}</TableHead>
                                      <TableHead className="w-[72px] text-right">{tf("Action", "操作")}</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {assignedLines.map(item => (
                                      <TableRow key={item.id}>
                                        <TableCell>{item.lineNo}</TableCell>
                                        <TableCell className="font-mono text-xs">{item.skuCode}</TableCell>
                                        <TableCell>{item.productName}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right font-medium">{item.allocatedQuantity}</TableCell>
                                        <TableCell className="text-right">
                                          <Button type="button" size="sm" variant="ghost" onClick={() => updateVendorLineAllocation(vendor.id, item.id, 0)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{tf("Vendor PO grouping", "Vendor PO 生成方式")}</Label>
                <Select value={vendorPOGrouping} onValueChange={setVendorPOGrouping}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PER_VENDOR">{tf("One PO per vendor", "每个 vendor 一张 PO")}</SelectItem>
                    <SelectItem value="PER_VENDOR_ADDRESS">{tf("One PO per vendor + ship-from address", "按 vendor + 发货地址生成 PO")}</SelectItem>
                    <SelectItem value="CONSOLIDATED">{tf("Consolidated execution PO", "合并为一张执行 PO")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{tf("Release mode", "生成/发送方式")}</Label>
                <Select value={vendorSendMode} onValueChange={setVendorSendMode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT_REVIEW">{tf("Create drafts for review", "生成草稿，等待审核")}</SelectItem>
                    <SelectItem value="READY_TO_SEND">{tf("Create and mark ready to send", "生成并标记待发送")}</SelectItem>
                    <SelectItem value="SEND_NOW">{tf("Create and send now", "生成并立即发送")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">{tf("Vendor PO preview", "Vendor PO 预览")}</h3>
              {vendorPOPreviews.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  {tf("Assign items inside vendor cards to preview generated vendor POs.", "在 vendor 卡片中选择承接商品后，可预览将生成的 vendor PO。")}
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {vendorPOPreviews.map(preview => (
                    <div key={preview.vendor.id} className="rounded-lg border p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="font-mono text-sm font-medium">{preview.vendorPoNo}</div>
                        <Badge variant="outline">{preview.lines.length} line(s)</Badge>
                      </div>
                      <div className="text-sm font-medium">{preview.vendor.supplierName}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {preview.vendor.shipFromWarehouseName} → {preview.vendor.useFinishedGoodsWarehouse ? `${preview.vendor.finishedGoodsWarehouseName || tf("Unselected FG warehouse", "未选择成品仓")} → ` : ""}{preview.vendor.targetWarehouseName || "-"}
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {preview.lines.map(line => (
                          <div key={line.id} className="flex justify-between gap-3">
                            <span>{line.skuCode}</span>
                            <span>{tf("Qty", "数量")} {line.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={goToCreatedPODetail}>
                {tf("Configure later", "稍后配置")}
              </Button>
              <Button onClick={handleCreateVendorPOs}>
                {tf("Generate Vendor POs", "生成 Vendor PO")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(activeVendorItemDialogId)} onOpenChange={(open) => !open && closeVendorItemDialog()}>
          <DialogContent className="max-w-4xl max-h-[86vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{tf("Add Items to Vendor", "添加 vendor 承接商品")}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {tf(
                  "Select item lines from the master PO and set the quantity this vendor will fulfill.",
                  "从主 PO 商品中多选，并设置该 vendor 承接数量。"
                )}
              </p>
            </DialogHeader>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[72px]">{tf("Select", "选择")}</TableHead>
                    <TableHead className="w-[72px]">{tf("Line", "行号")}</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>{tf("Product", "商品")}</TableHead>
                    <TableHead className="text-right">{tf("PO Qty", "PO 数量")}</TableHead>
                    <TableHead className="text-right">{tf("Other vendors", "其他 vendor")}</TableHead>
                    <TableHead className="w-[160px] text-right">{tf("This vendor qty", "本 vendor 数量")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map(item => {
                    const currentQty = vendorItemDraftAllocations[item.id] || 0
                    const allocatedByOthers = getLineAllocatedQty(item.id, activeVendorItemDialogId || undefined)
                    const maxQty = Math.max(0, item.quantity - allocatedByOthers)
                    const checked = currentQty > 0

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={checked}
                            disabled={maxQty === 0 && !checked}
                            onChange={(event) => updateVendorItemDraftQty(item.id, event.target.checked ? Math.max(1, maxQty) : 0)}
                          />
                        </TableCell>
                        <TableCell>{item.lineNo}</TableCell>
                        <TableCell className="font-mono text-xs">{item.skuCode}</TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{allocatedByOthers}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={maxQty}
                            value={currentQty || ""}
                            disabled={maxQty === 0 && !checked}
                            onChange={(event) => updateVendorItemDraftQty(item.id, Number(event.target.value))}
                            placeholder={`0 / ${maxQty}`}
                            className="h-8 text-right"
                          />
                          <div className="mt-1 text-right text-[11px] text-muted-foreground">
                            {tf("Available", "可分配")} {maxQty}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeVendorItemDialog}>
                {tf("Cancel", "取消")}
              </Button>
              <Button onClick={confirmVendorItemDialog}>
                {tf("Confirm Items", "确认添加")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <LeaveConfirmDialog
          open={showLeaveConfirm}
          onOpenChange={setShowLeaveConfirm}
          onConfirm={confirmLeave}
        />
      </div>
    </MainLayout>
  )
}
