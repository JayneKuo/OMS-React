"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Send, Plus, X, Package, Truck, MapPin, Building2, GripVertical, ArrowUp, ArrowDown, Upload, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useI18n } from "@/components/i18n-provider"
import { createPurchaseSidebarItems } from "@/lib/purchase-sidebar-items"
import { ProductSelectionDialog } from "@/components/purchase/product-selection-dialog"

// Shipment Line Item Interface
interface ShipmentLineItem {
  id: string
  poNo?: string
  poLineNo?: number
  productId?: string
  sku: string
  itemName: string
  specifications?: string
  orderedQty?: number
  previouslyShipped?: number
  remainingQty?: number
  shippedQty: number
  uom: string
}

// Transportation Leg Interface - 支持多段运输
interface TransportationLeg {
  id: string
  legNo: number
  
  // Segment Header - 段头部
  legType: "FIRST_MILE" | "MIDDLE_MILE" | "LAST_MILE" // 头程、中程、尾程
  mode: "FTL" | "LTL" | "EXPRESS" | "SMALL_PARCEL" | "AIR_CARGO" | "OCEAN_FCL" | "OCEAN_LCL" | "RAIL" | "INTERMODAL" | "INTERNAL" | "VIRTUAL"
  carrier: string
  serviceLevel?: string // 服务等级/产品
  
  // Route Info - 路线信息（所有方式通用）
  origin: {
    warehouse?: string
    airport?: string // 起运机场代码（空运）
    port?: string // 起运港口（海运）
    station?: string // 起运站（铁路）
    address: {
      name: string
      contactPerson: string
      contactPhone: string
      contactEmail: string
      address1: string
      address2: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
  destination: {
    warehouse?: string
    airport?: string // 目的机场代码（空运）
    port?: string // 目的港口（海运）
    station?: string // 目的站（铁路）
    address: {
      name: string
      contactPerson: string
      contactPhone: string
      contactEmail: string
      address1: string
      address2: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
  plannedPickupDatetime?: string // 计划提货时间 / 计划起飞时间 / 预计开船时间 / ETD
  plannedDeliveryDatetime?: string // 计划到达时间 / 计划到达时间 / 预计到港时间 / ETA
  
  // Transport Info - 运输信息（根据运输方式动态变化）
  // Air Cargo
  flightNo?: string
  airlineCode?: string
  mawb?: string // MAWB
  hawb?: string // HAWB
  
  // Express / Small Parcel
  trackingNos?: string[] // Tracking Number（可多条）
  serviceType?: string // 服务类型（Standard/Expedited）
  labelCount?: string // Label 数量
  
  // 通用字段
  referenceNumber?: string // 参考号（客户参考号/内部参考号）
  
  // FTL
  licensePlate?: string // 车牌号
  driverName?: string // 司机姓名
  driverPhone?: string // 司机电话
  bolNumber?: string // BOL号
  routeCode?: string // Route Code（可选）
  
  // LTL
  proNumber?: string // PRO Number（跟踪号）
  
  // Ocean FCL
  vesselName?: string // 船名
  voyageNo?: string // 航次号
  carrierCode?: string // 承运船公司代码
  mbl?: string // MBL
  hbl?: string // HBL
  containerNos?: string[] // 集装箱号（可多个）
  sealNos?: string[] // 封条号（可多个）
  pol?: string // Port of Loading
  pod?: string // Port of Discharge
  
  // Ocean LCL
  hblNumber?: string // HBL号
  consolidationWarehouse?: string // 拼箱仓库信息
  
  // Rail
  trainNo?: string // 车次号
  railCarNumber?: string // 箱号/车皮号
  operator?: string // 运营方
  
  // Internal / Virtual
  internalShipmentNo?: string // 内部单号
  vehicleInfo?: string // 车辆（如果有）
  
  // Package Info - 包裹信息
  // 通用包裹区
  packageType?: "BOX" | "PALLET" | "BAG" | "PARCEL" | "CONTAINER" | "OTHER" // 包装类型：箱/托盘/袋/包裹/集装箱/其他
  quantity?: string // 数量（箱数/托盘数/包裹数/集装箱数量等）
  totalWeight?: string // 总重量
  weightUnit?: "LBS" | "KG" // 重量单位
  totalVolume?: string // 总体积
  volumeUnit?: "CUBIC_FT" | "CUBIC_M" // 体积单位
  
  // 高级包裹区（按运输方式动态显示）
  dimensions?: { // 维度（长宽高）- Small Parcel/Express/LTL可选
    length?: string
    width?: string
    height?: string
    unit?: "IN" | "CM"
  }
  palletCount?: string // 托盘数（FTL/LTL/Air Cargo）
  containerCount?: string // 集装箱数量（Ocean FCL/Rail）
  containerType?: "20FT" | "40FT" | "40FT_HC" // 箱型
  teuCount?: string // TEU数量（Ocean FCL）
  volumeWeight?: string // 体积重（只读，系统计算）- Air Cargo/Small Parcel
  chargeableWeight?: string // 计费重（只读，系统计算）- Air Cargo/Small Parcel
  declaredValue?: string // 申报价值 - Small Parcel/International Express
  hazmatFlag?: boolean // 危险品标志 - Air Cargo/Ocean/Truck
  stackable?: boolean // 可堆叠 - Air Cargo/LTL
}

// Mock PO Data
const mockPOs = [
  {
    id: "PO-001",
    poNo: "PO-2024-001",
    supplierName: "ABC Suppliers Inc.",
    warehouse: "Los Angeles Warehouse",
    lines: [
      { lineNo: 1, sku: "SKU-001", itemName: "Product A", orderedQty: 100, previouslyShipped: 0, remainingQty: 100, uom: "PCS" },
      { lineNo: 2, sku: "SKU-002", itemName: "Product B", orderedQty: 200, previouslyShipped: 50, remainingQty: 150, uom: "PCS" },
    ]
  },
  {
    id: "PO-002",
    poNo: "PO-2024-002",
    supplierName: "Global Trading Co.",
    warehouse: "New York Warehouse",
    lines: [
      { lineNo: 1, sku: "SKU-003", itemName: "Product C", orderedQty: 300, previouslyShipped: 0, remainingQty: 300, uom: "PCS" },
      { lineNo: 2, sku: "SKU-004", itemName: "Product D", orderedQty: 150, previouslyShipped: 0, remainingQty: 150, uom: "PCS" },
    ]
  },
]

// Mock Warehouses
const mockWarehouses = [
  {
    id: "WH001",
    name: "Main Warehouse - Los Angeles",
    address: {
      name: "Main Warehouse",
      contactPerson: "John Smith",
      contactPhone: "+1-555-0101",
      contactEmail: "warehouse.la@company.com",
      address1: "1234 Warehouse Blvd",
      address2: "Building A",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001",
      country: "United States"
    }
  },
  {
    id: "WH002",
    name: "East Distribution Center - New York",
    address: {
      name: "East Distribution Center",
      contactPerson: "Jane Doe",
      contactPhone: "+1-555-0102",
      contactEmail: "warehouse.ny@company.com",
      address1: "456 Commerce St",
      address2: "Suite 200",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "United States"
    }
  },
  {
    id: "WH003",
    name: "West Fulfillment Center - Seattle",
    address: {
      name: "West Fulfillment Center",
      contactPerson: "Bob Johnson",
      contactPhone: "+1-555-0103",
      contactEmail: "warehouse.seattle@company.com",
      address1: "789 Industrial Way",
      address2: "",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      country: "United States"
    }
  },
]

// US States
const usStates = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
]

// US Carriers by mode
const usCarriers = {
  FTL: ["FedEx Freight", "UPS Freight", "XPO Logistics", "Old Dominion", "YRC Freight", "ABF Freight", "Schneider", "Swift Transportation"],
  LTL: ["FedEx Freight", "UPS Freight", "XPO Logistics", "Old Dominion", "YRC Freight", "ABF Freight", "Estes Express", "Southeastern Freight Lines"],
  EXPRESS: ["FedEx Express", "UPS Express", "DHL Express", "TNT Express"],
  SMALL_PARCEL: ["USPS", "FedEx", "UPS", "DHL Express", "Amazon Logistics", "OnTrac"],
  AIR_CARGO: ["FedEx Express", "UPS Next Day Air", "DHL Express", "American Airlines Cargo", "United Cargo", "Delta Cargo"],
  OCEAN_FCL: ["Maersk", "CMA CGM", "COSCO", "Evergreen", "Hapag-Lloyd", "MSC", "ONE", "Yang Ming"],
  OCEAN_LCL: ["Maersk", "CMA CGM", "COSCO", "Evergreen", "Hapag-Lloyd", "MSC", "ONE", "Yang Ming", "Flexport", "Flexport LCL"],
  RAIL: ["Union Pacific", "BNSF Railway", "CSX Transportation", "Norfolk Southern", "Kansas City Southern"],
  INTERMODAL: ["Hub Group", "J.B. Hunt", "Schneider", "Swift Transportation", "XPO Logistics"],
  INTERNAL: ["Internal Fleet", "Company Truck", "Warehouse Transfer"],
  VIRTUAL: ["Virtual Shipment", "Drop Ship", "Direct Ship"]
}

// Service Levels by carrier
const serviceLevels: Record<string, string[]> = {
  "USPS": ["Priority Mail", "Priority Mail Express", "First-Class Mail", "Parcel Select"],
  "FedEx": ["FedEx Ground", "FedEx Express Saver", "FedEx 2Day", "FedEx Standard Overnight", "FedEx Priority Overnight"],
  "UPS": ["UPS Ground", "UPS 3 Day Select", "UPS 2nd Day Air", "UPS Next Day Air", "UPS Next Day Air Early"],
  "DHL Express": ["DHL Express 12:00", "DHL Express 9:00", "DHL Express Envelope"],
  "FedEx Freight": ["FedEx Freight Economy", "FedEx Freight Priority"],
  "UPS Freight": ["UPS Freight LTL", "UPS Freight Truckload"],
}

export default function CreateShipmentPage() {
  const { t } = useI18n()
  const router = useRouter()

  // Basic Information State
  const [shipmentType, setShipmentType] = React.useState<"DOMESTIC" | "INTERNATIONAL">("DOMESTIC")
  const [direction, setDirection] = React.useState<"INBOUND" | "OUTBOUND" | "RETURN" | "TRANSFER">("INBOUND")

  // Multi-PO Selection State
  const [selectedPOIds, setSelectedPOIds] = React.useState<string[]>([])
  const [selectedPOLines, setSelectedPOLines] = React.useState<Record<string, number[]>>({}) // { "PO-001": [1, 2], "PO-002": [1] }
  const [showPODialog, setShowPODialog] = React.useState(false)
  const [poSearchValue, setPOSearchValue] = React.useState("")

  // Multi-Leg Transportation State - 支持多段运输
  const [transportationLegs, setTransportationLegs] = React.useState<TransportationLeg[]>([
    {
      id: "leg-1",
      legNo: 1,
      legType: "FIRST_MILE",
      mode: "SMALL_PARCEL",
      carrier: "",
      trackingNos: [""] as string[],
      packageType: "PARCEL",
      quantity: "",
      weightUnit: "LBS",
      volumeUnit: "CUBIC_FT",
      origin: {
        address: {
          name: "",
          contactPerson: "",
          contactPhone: "",
          contactEmail: "",
          address1: "",
          address2: "",
          city: "",
          state: "",
          zipCode: "",
          country: "United States"
        }
      },
      destination: {
        address: {
          name: "",
          contactPerson: "",
          contactPhone: "",
          contactEmail: "",
          address1: "",
          address2: "",
          city: "",
          state: "",
          zipCode: "",
          country: "United States"
        }
      }
    }
  ])

  // Shipment Lines State
  const [shipmentLines, setShipmentLines] = React.useState<ShipmentLineItem[]>([])
  const [showProductDialog, setShowProductDialog] = React.useState(false)

  // Package Information State - 独立出来
  const [packageInfo, setPackageInfo] = React.useState({
    totalPackages: "",
    totalPallets: "",
    totalWeight: "",
    weightUnit: "LBS" as "LBS" | "KG",
    totalVolume: "",
    volumeUnit: "CUBIC_FT" as "CUBIC_FT" | "CUBIC_M",
    totalContainers: "",
    containerType: "40FT" as "20FT" | "40FT" | "40FT_HC",
  })

  // Customs Declaration Information State
  const [customsInfo, setCustomsInfo] = React.useState({
    // Basic Trade Info
    declaredValue: "",
    currency: "USD",
    commodityDescription: "",
    // Parties
    exporterName: "",
    importerName: "",
    importerTaxID: "",
    // Country of Origin
    countryOfOrigin: "",
    // Documents
    commercialInvoice: [] as File[],
    packingList: [] as File[],
    otherDocuments: [] as File[],
  })

  // Attachments and Notes
  const [remark, setRemark] = React.useState("")

  const sidebarItems = createPurchaseSidebarItems(t)

  // Handle multi-PO selection
  const handlePOToggle = (poId: string, checked: boolean) => {
    if (checked) {
      setSelectedPOIds([...selectedPOIds, poId])
      setSelectedPOLines({ ...selectedPOLines, [poId]: [] })
    } else {
      setSelectedPOIds(selectedPOIds.filter(id => id !== poId))
      const newSelectedPOLines = { ...selectedPOLines }
      delete newSelectedPOLines[poId]
      setSelectedPOLines(newSelectedPOLines)
      // Remove lines from this PO
      setShipmentLines(shipmentLines.filter(line => {
        const po = mockPOs.find(p => p.id === poId)
        return po ? line.poNo !== po.poNo : true
      }))
    }
  }

  // Handle PO Line selection
  const handlePOLineToggle = (poId: string, lineNo: number, checked: boolean) => {
    const po = mockPOs.find(p => p.id === poId)
    if (!po) return

    const currentLines = selectedPOLines[poId] || []
    if (checked) {
      const newLines = [...currentLines, lineNo]
      setSelectedPOLines({ ...selectedPOLines, [poId]: newLines })
      
      // Add to shipment lines
      const poLine = po.lines.find(l => l.lineNo === lineNo)
      if (poLine && poLine.remainingQty && poLine.remainingQty > 0) {
        const newLine: ShipmentLineItem = {
          id: `po-${poId}-${lineNo}`,
          poNo: po.poNo,
          poLineNo: lineNo,
          sku: poLine.sku,
          itemName: poLine.itemName,
          orderedQty: poLine.orderedQty,
          previouslyShipped: poLine.previouslyShipped,
          remainingQty: poLine.remainingQty,
          shippedQty: 0,
          uom: poLine.uom,
        }
        setShipmentLines([...shipmentLines, newLine])
      }
    } else {
      const newLines = currentLines.filter(l => l !== lineNo)
      setSelectedPOLines({ ...selectedPOLines, [poId]: newLines })
      setShipmentLines(shipmentLines.filter(line => {
        const po = mockPOs.find(p => p.id === poId)
        return po ? !(line.poNo === po.poNo && line.poLineNo === lineNo) : true
      }))
    }
  }

  // Handle products selected from ProductSelectionDialog
  const handleProductsSelected = (products: any[]) => {
    const newLines: ShipmentLineItem[] = products.map(product => ({
      id: `product-${Date.now()}-${product.id}`,
      productId: product.id,
      sku: product.sku,
      itemName: product.productName,
      specifications: product.specifications,
      shippedQty: 0,
      uom: product.uom,
    }))
    setShipmentLines([...shipmentLines, ...newLines])
  }

  // Handle shipped quantity change
  const handleShippedQtyChange = (lineId: string, value: number) => {
    setShipmentLines(shipmentLines.map(line => {
      if (line.id === lineId) {
        const shippedQty = Math.max(0, value)
        if (line.remainingQty !== undefined) {
          return { ...line, shippedQty: Math.min(shippedQty, line.remainingQty) }
        }
        return { ...line, shippedQty }
      }
      return line
    }))
  }

  // Remove line item
  const handleRemoveLine = (lineId: string) => {
    const line = shipmentLines.find(l => l.id === lineId)
    setShipmentLines(shipmentLines.filter(l => l.id !== lineId))
    
    if (line && line.poNo && line.poLineNo) {
      const po = mockPOs.find(p => p.poNo === line.poNo)
      if (po) {
        const poId = po.id
        const currentLines = selectedPOLines[poId] || []
        setSelectedPOLines({
          ...selectedPOLines,
          [poId]: currentLines.filter(l => l !== line.poLineNo)
        })
      }
    }
  }

  // Add transportation leg
  const addTransportationLeg = () => {
    const newLeg: TransportationLeg = {
      id: `leg-${Date.now()}`,
      legNo: transportationLegs.length + 1,
      legType: transportationLegs.length === 0 ? "FIRST_MILE" : "LAST_MILE",
      mode: "SMALL_PARCEL",
      carrier: "",
      trackingNos: [""] as string[],
      packageType: "PARCEL",
      quantity: "",
      weightUnit: "LBS",
      volumeUnit: "CUBIC_FT",
      origin: {
        address: {
          name: "",
          contactPerson: "",
          contactPhone: "",
          contactEmail: "",
          address1: "",
          address2: "",
          city: "",
          state: "",
          zipCode: "",
          country: "United States"
        }
      },
      destination: {
        address: {
          name: "",
          contactPerson: "",
          contactPhone: "",
          contactEmail: "",
          address1: "",
          address2: "",
          city: "",
          state: "",
          zipCode: "",
          country: "United States"
        }
      }
    }
    setTransportationLegs([...transportationLegs, newLeg])
  }

  // Remove transportation leg
  const removeTransportationLeg = (legId: string) => {
    if (transportationLegs.length <= 1) {
      alert("至少需要保留一段运输")
      return
    }
    setTransportationLegs(transportationLegs.filter(leg => leg.id !== legId).map((leg, index) => ({
      ...leg,
      legNo: index + 1
    })))
  }

  // Duplicate transportation leg
  const duplicateTransportationLeg = (legId: string) => {
    const legToDuplicate = transportationLegs.find(leg => leg.id === legId)
    if (legToDuplicate) {
      const newLeg: TransportationLeg = {
        ...legToDuplicate,
        id: `leg-${Date.now()}`,
        legNo: transportationLegs.length + 1
      }
      setTransportationLegs([...transportationLegs, newLeg])
    }
  }

  // Move leg up
  const moveLegUp = (legId: string) => {
    const index = transportationLegs.findIndex(leg => leg.id === legId)
    if (index > 0) {
      const newLegs = [...transportationLegs]
      ;[newLegs[index - 1], newLegs[index]] = [newLegs[index], newLegs[index - 1]]
      setTransportationLegs(newLegs.map((leg, idx) => ({ ...leg, legNo: idx + 1 })))
    }
  }

  // Move leg down
  const moveLegDown = (legId: string) => {
    const index = transportationLegs.findIndex(leg => leg.id === legId)
    if (index < transportationLegs.length - 1) {
      const newLegs = [...transportationLegs]
      ;[newLegs[index], newLegs[index + 1]] = [newLegs[index + 1], newLegs[index]]
      setTransportationLegs(newLegs.map((leg, idx) => ({ ...leg, legNo: idx + 1 })))
    }
  }

  // Get segment name display
  const getSegmentName = (leg: TransportationLeg) => {
    const typeMap: Record<string, string> = {
      FIRST_MILE: t('firstMile'),
      MIDDLE_MILE: t('middleMile'),
      LAST_MILE: t('lastMile'),
      SINGLE: t('singleSegment')
    }
    return `${t('segmentNumber')} #${leg.legNo}（${typeMap[leg.legType] || leg.legType}）`
  }

  // Update transportation leg
  const updateTransportationLeg = (legId: string, field: keyof TransportationLeg, value: any) => {
    setTransportationLegs(transportationLegs.map(leg => {
      if (leg.id === legId) {
        return { ...leg, [field]: value }
      }
      return leg
    }))
  }

  // Update leg address
  const updateLegAddress = (legId: string, type: "origin" | "destination", field: string, value: any) => {
    setTransportationLegs(transportationLegs.map(leg => {
      if (leg.id === legId) {
        return {
          ...leg,
          [type]: {
            ...leg[type],
            address: {
              ...leg[type].address,
              [field]: value
            }
          }
        }
      }
      return leg
    }))
  }

  // Handle warehouse selection for leg
  const handleLegWarehouseSelect = (legId: string, type: "origin" | "destination", warehouseId: string) => {
    const warehouse = mockWarehouses.find(w => w.id === warehouseId)
    if (warehouse) {
      setTransportationLegs(transportationLegs.map(leg => {
        if (leg.id === legId) {
          return {
            ...leg,
            [type]: {
              warehouse: warehouseId,
              address: warehouse.address
            }
          }
        }
        return leg
      }))
    }
  }

  // Filtered POs for dialog
  const filteredPOs = React.useMemo(() => {
    if (!poSearchValue) return mockPOs
    return mockPOs.filter(po => 
      po.poNo.toLowerCase().includes(poSearchValue.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(poSearchValue.toLowerCase()) ||
      po.warehouse.toLowerCase().includes(poSearchValue.toLowerCase())
    )
  }, [poSearchValue])

  // Validation
  const isFormValid = () => {
    return transportationLegs.every(leg => leg.carrier && (leg.trackingNos || []).some(tn => tn.trim())) &&
           transportationLegs[0].origin.address.address1 &&
           transportationLegs[transportationLegs.length - 1].destination.address.address1 &&
           shipmentLines.length > 0 &&
           shipmentLines.some(line => line.shippedQty > 0 && line.sku && line.itemName)
  }

  // Handle save
  const handleSave = () => {
    if (!isFormValid()) {
      alert("请填写所有必填字段，并至少添加一个商品行并填写发货数量")
      return
    }
    console.log("Save Shipment", {
      shipmentType,
      direction,
      selectedPOIds,
      selectedPOLines,
      transportationLegs,
      shipmentLines,
      packageInfo,
      customsInfo,
      remark,
    })
    router.push("/purchase/asn")
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
              <h1 className="text-3xl font-bold tracking-tight">{t('newShipment')}</h1>
              <p className="text-muted-foreground">{t('createNewShipment')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              {t('cancel')}
            </Button>
            <Button variant="outline" onClick={handleSave} disabled={!isFormValid()}>
              <Save className="mr-2 h-4 w-4" />
              {t('save')}
            </Button>
            <Button onClick={handleSave} disabled={!isFormValid()}>
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
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shipmentType">{t('shipmentType')} *</Label>
                <Select value={shipmentType} onValueChange={(value: "DOMESTIC" | "INTERNATIONAL") => setShipmentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOMESTIC">{t('domestic')}</SelectItem>
                    <SelectItem value="INTERNATIONAL">{t('international')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="direction">{t('direction')}</Label>
                <Select value={direction} onValueChange={(value: "INBOUND" | "OUTBOUND" | "RETURN" | "TRANSFER") => setDirection(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INBOUND">INBOUND</SelectItem>
                    <SelectItem value="OUTBOUND">OUTBOUND</SelectItem>
                    <SelectItem value="RETURN">RETURN</SelectItem>
                    <SelectItem value="TRANSFER">TRANSFER</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Multi-PO Selection */}
            <div className="space-y-2">
              <Label>{t('selectPO')}</Label>
              <div className="flex flex-wrap gap-2">
                {selectedPOIds.map(poId => {
                  const po = mockPOs.find(p => p.id === poId)
                  if (!po) return null
                  return (
                    <Badge key={poId} variant="outline" className="text-sm px-3 py-1">
                      {po.poNo}
                      <button
                        className="ml-2 hover:text-destructive"
                        onClick={() => handlePOToggle(poId, false)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })}
                <Button variant="outline" onClick={() => setShowPODialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('selectPO')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transportation Legs - 多段运输 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                {t('transportationLegs')}
              </CardTitle>
              <Button variant="outline" onClick={addTransportationLeg}>
                <Plus className="mr-2 h-4 w-4" />
                {t('addLeg')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {transportationLegs.map((leg, index) => (
              <Card key={leg.id} className="border-2">
                <CardContent className="p-6 space-y-6">
                  {/* 一、段头部（Segment Header） */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <Label className="text-sm text-muted-foreground">{t('segmentName')}</Label>
                          <p className="text-base font-semibold">{getSegmentName(leg)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t('segmentType')}</Label>
                        <Select
                          value={leg.legType}
                          onValueChange={(value: "FIRST_MILE" | "MIDDLE_MILE" | "LAST_MILE" | "SINGLE") => 
                            updateTransportationLeg(leg.id, 'legType', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FIRST_MILE">{t('firstMile')}</SelectItem>
                            <SelectItem value="MIDDLE_MILE">{t('middleMile')}</SelectItem>
                            <SelectItem value="LAST_MILE">{t('lastMile')}</SelectItem>
                            <SelectItem value="SINGLE">{t('singleSegment')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{t('mode')} *</Label>
                        <Select
                          value={leg.mode}
                          onValueChange={(value: "FTL" | "LTL" | "EXPRESS" | "SMALL_PARCEL" | "AIR_CARGO" | "OCEAN_FCL" | "OCEAN_LCL" | "RAIL" | "INTERMODAL" | "INTERNAL" | "VIRTUAL") => 
                            updateTransportationLeg(leg.id, 'mode', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FTL">{t('ftl')}</SelectItem>
                            <SelectItem value="LTL">{t('ltl')}</SelectItem>
                            <SelectItem value="EXPRESS">{t('express')}</SelectItem>
                            <SelectItem value="SMALL_PARCEL">{t('smallParcel')}</SelectItem>
                            <SelectItem value="AIR_CARGO">{t('airCargo')}</SelectItem>
                            <SelectItem value="OCEAN_FCL">{t('oceanFCL')}</SelectItem>
                            <SelectItem value="OCEAN_LCL">{t('oceanLCL')}</SelectItem>
                            <SelectItem value="RAIL">{t('rail')}</SelectItem>
                            <SelectItem value="INTERMODAL">{t('intermodal')}</SelectItem>
                            <SelectItem value="INTERNAL">{t('internal')}</SelectItem>
                            <SelectItem value="VIRTUAL">{t('virtual')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{t('carrier')} *</Label>
                        <Select
                          value={leg.carrier}
                          onValueChange={(value) => updateTransportationLeg(leg.id, 'carrier', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectCarrier')} />
                          </SelectTrigger>
                          <SelectContent>
                            {(usCarriers[leg.mode] || []).map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {serviceLevels[leg.carrier] && serviceLevels[leg.carrier].length > 0 && (
                        <div>
                          <Label>{t('serviceLevel')}</Label>
                          <Select
                            value={leg.serviceLevel || ""}
                            onValueChange={(value) => updateTransportationLeg(leg.id, 'serviceLevel', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectServiceLevel')} />
                            </SelectTrigger>
                            <SelectContent>
                              {serviceLevels[leg.carrier].map(sl => (
                                <SelectItem key={sl} value={sl}>{sl}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* 二、路线信息（Route Info）- 所有方式通用 */}
                  <div className="space-y-6">
                    <Label className="text-base font-medium">{t('routeInfo')}</Label>
                    
                    {/* Origin - 起运地 */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">{t('origin')} *</Label>
                        <Select
                          value={leg.origin.warehouse || ""}
                          onValueChange={(value) => handleLegWarehouseSelect(leg.id, "origin", value)}
                        >
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder={t('selectWarehouse')} />
                          </SelectTrigger>
                          <SelectContent>
                            {mockWarehouses.map(wh => (
                              <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* 根据运输方式显示不同的起运地字段 */}
                      {leg.mode === "AIR_CARGO" && (
                        <div>
                          <Label>{t('originAirport')}</Label>
                          <Input
                            value={leg.origin?.airport || ""}
                            onChange={(e) => {
                              const newOrigin = { ...leg.origin, airport: e.target.value }
                              updateTransportationLeg(leg.id, 'origin', newOrigin)
                            }}
                            placeholder="LAX, JFK, PEK"
                          />
                        </div>
                      )}
                      {(leg.mode === "OCEAN_FCL" || leg.mode === "OCEAN_LCL") && (
                        <div>
                          <Label>{t('pol')}</Label>
                          <Input
                            value={leg.pol || ""}
                            onChange={(e) => updateTransportationLeg(leg.id, 'pol', e.target.value)}
                            placeholder="Port of Loading"
                          />
                        </div>
                      )}
                      {leg.mode === "RAIL" && (
                        <div>
                          <Label>{t('originStation')}</Label>
                          <Input
                            value={leg.origin?.station || ""}
                            onChange={(e) => {
                              const newOrigin = { ...leg.origin, station: e.target.value }
                              updateTransportationLeg(leg.id, 'origin', newOrigin)
                            }}
                            placeholder="Origin Station"
                          />
                        </div>
                      )}
                      {/* 通用地址字段 */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label>{t('name')}</Label>
                          <Input
                            value={leg.origin.address.name}
                            onChange={(e) => updateLegAddress(leg.id, "origin", "name", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>{t('contactPerson')}</Label>
                          <Input
                            value={leg.origin.address.contactPerson}
                            onChange={(e) => updateLegAddress(leg.id, "origin", "contactPerson", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>{t('contactPhone')}</Label>
                          <Input
                            value={leg.origin.address.contactPhone}
                            onChange={(e) => updateLegAddress(leg.id, "origin", "contactPhone", e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>{t('address1')} *</Label>
                          <Input
                            value={leg.origin.address.address1}
                            onChange={(e) => updateLegAddress(leg.id, "origin", "address1", e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>{t('address2Optional')}</Label>
                          <Input
                            value={leg.origin.address.address2}
                            onChange={(e) => updateLegAddress(leg.id, "origin", "address2", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>{t('cityLabel')} *</Label>
                          <Input
                            value={leg.origin.address.city}
                            onChange={(e) => updateLegAddress(leg.id, "origin", "city", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>{t('stateProvinceLabel')} *</Label>
                          <Select
                            value={leg.origin.address.state}
                            onValueChange={(value) => updateLegAddress(leg.id, "origin", "state", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {usStates.map(state => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>{t('zipCodeLabel')} *</Label>
                          <Input
                            value={leg.origin.address.zipCode}
                            onChange={(e) => updateLegAddress(leg.id, "origin", "zipCode", e.target.value)}
                            maxLength={5}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Destination - 目的地 */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">{t('destination')} *</Label>
                        <Select
                          value={leg.destination.warehouse || ""}
                          onValueChange={(value) => handleLegWarehouseSelect(leg.id, "destination", value)}
                        >
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder={t('selectWarehouse')} />
                          </SelectTrigger>
                          <SelectContent>
                            {mockWarehouses.map(wh => (
                              <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* 根据运输方式显示不同的目的地字段 */}
                      {leg.mode === "AIR_CARGO" && (
                        <div>
                          <Label>{t('destinationAirport')}</Label>
                          <Input
                            value={leg.destination?.airport || ""}
                            onChange={(e) => {
                              const newDestination = { ...leg.destination, airport: e.target.value }
                              updateTransportationLeg(leg.id, 'destination', newDestination)
                            }}
                            placeholder="LAX, JFK, PEK"
                          />
                        </div>
                      )}
                      {(leg.mode === "OCEAN_FCL" || leg.mode === "OCEAN_LCL") && (
                        <div>
                          <Label>{t('pod')}</Label>
                          <Input
                            value={leg.pod || ""}
                            onChange={(e) => updateTransportationLeg(leg.id, 'pod', e.target.value)}
                            placeholder="Port of Discharge"
                          />
                        </div>
                      )}
                      {leg.mode === "RAIL" && (
                        <div>
                          <Label>{t('destinationStation')}</Label>
                          <Input
                            value={leg.destination?.station || ""}
                            onChange={(e) => {
                              const newDestination = { ...leg.destination, station: e.target.value }
                              updateTransportationLeg(leg.id, 'destination', newDestination)
                            }}
                            placeholder="Destination Station"
                          />
                        </div>
                      )}
                      {/* 通用地址字段 */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label>{t('name')}</Label>
                          <Input
                            value={leg.destination.address.name}
                            onChange={(e) => updateLegAddress(leg.id, "destination", "name", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>{t('contactPerson')}</Label>
                          <Input
                            value={leg.destination.address.contactPerson}
                            onChange={(e) => updateLegAddress(leg.id, "destination", "contactPerson", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>{t('contactPhone')}</Label>
                          <Input
                            value={leg.destination.address.contactPhone}
                            onChange={(e) => updateLegAddress(leg.id, "destination", "contactPhone", e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>{t('address1')} *</Label>
                          <Input
                            value={leg.destination.address.address1}
                            onChange={(e) => updateLegAddress(leg.id, "destination", "address1", e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>{t('address2Optional')}</Label>
                          <Input
                            value={leg.destination.address.address2}
                            onChange={(e) => updateLegAddress(leg.id, "destination", "address2", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>{t('cityLabel')} *</Label>
                          <Input
                            value={leg.destination.address.city}
                            onChange={(e) => updateLegAddress(leg.id, "destination", "city", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>{t('stateProvinceLabel')} *</Label>
                          <Select
                            value={leg.destination.address.state}
                            onValueChange={(value) => updateLegAddress(leg.id, "destination", "state", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {usStates.map(state => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>{t('zipCodeLabel')} *</Label>
                          <Input
                            value={leg.destination.address.zipCode}
                            onChange={(e) => updateLegAddress(leg.id, "destination", "zipCode", e.target.value)}
                            maxLength={5}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 计划时间 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t('plannedPickupDatetime')}</Label>
                        <Input
                          type="datetime-local"
                          value={leg.plannedPickupDatetime || ""}
                          onChange={(e) => updateTransportationLeg(leg.id, 'plannedPickupDatetime', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>{t('plannedDeliveryDatetime')}</Label>
                        <Input
                          type="datetime-local"
                          value={leg.plannedDeliveryDatetime || ""}
                          onChange={(e) => updateTransportationLeg(leg.id, 'plannedDeliveryDatetime', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 三、运输信息（Transport Info）- 跟运输方式强相关 */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">{t('transportInfo')}</Label>
                    
                    {/* 通用字段：跟踪号列表 */}
                    <div>
                      <Label>{t('trackingNumberList')}</Label>
                      <div className="space-y-2">
                        {(leg.trackingNos || []).map((trackingNo, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input
                              value={trackingNo}
                              onChange={(e) => {
                                const newTrackingNos = [...(leg.trackingNos || [])]
                                newTrackingNos[idx] = e.target.value
                                updateTransportationLeg(leg.id, 'trackingNos', newTrackingNos)
                              }}
                              placeholder={t('trackingNo')}
                            />
                            {(leg.trackingNos || []).length > 1 && (
                              <Button variant="outline" size="sm" onClick={() => {
                                const newTrackingNos = (leg.trackingNos || []).filter((_, i) => i !== idx)
                                updateTransportationLeg(leg.id, 'trackingNos', newTrackingNos)
                              }}>
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => {
                          updateTransportationLeg(leg.id, 'trackingNos', [...(leg.trackingNos || []), ""])
                        }}>
                          <Plus className="mr-2 h-4 w-4" />
                          {t('addTrackingNumber')}
                        </Button>
                      </div>
                    </div>

                    {/* 参考号 */}
                    <div>
                      <Label>{t('referenceNumber')}</Label>
                      <Input
                        value={leg.referenceNumber || ""}
                        onChange={(e) => updateTransportationLeg(leg.id, 'referenceNumber', e.target.value)}
                        placeholder={t('customerReference') + " / " + t('internalReference')}
                      />
                    </div>

                    {/* 按运输方式动态显示的字段 */}
                    {/* Air Cargo */}
                    {leg.mode === "AIR_CARGO" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{t('flightNo')}</Label>
                          <Input
                            value={leg.flightNo || ""}
                            onChange={(e) => updateTransportationLeg(leg.id, 'flightNo', e.target.value)}
                            placeholder="AA1234"
                          />
                        </div>
                        <div>
                          <Label>{t('airlineCode')}</Label>
                          <Input
                            value={leg.airlineCode || ""}
                            onChange={(e) => updateTransportationLeg(leg.id, 'airlineCode', e.target.value)}
                            placeholder="AA, UA, DL"
                          />
                        </div>
                        {shipmentType === "INTERNATIONAL" && (
                          <>
                            <div>
                              <Label>{t('mawb')}</Label>
                              <Input
                                value={leg.mawb || ""}
                                onChange={(e) => updateTransportationLeg(leg.id, 'mawb', e.target.value)}
                                placeholder="MAWB"
                              />
                            </div>
                            <div>
                              <Label>{t('hawb')}</Label>
                              <Input
                                value={leg.hawb || ""}
                                onChange={(e) => updateTransportationLeg(leg.id, 'hawb', e.target.value)}
                                placeholder="HAWB"
                              />
                            </div>
                            <div>
                              <Label>{t('originAirport')}</Label>
                              <Input
                                value={leg.origin?.airport || ""}
                                onChange={(e) => {
                                  const newOrigin = { ...leg.origin, airport: e.target.value }
                                  updateTransportationLeg(leg.id, 'origin', newOrigin)
                                }}
                                placeholder="LAX, JFK, PEK"
                              />
                            </div>
                            <div>
                              <Label>{t('destinationAirport')}</Label>
                              <Input
                                value={leg.destination?.airport || ""}
                                onChange={(e) => {
                                  const newDestination = { ...leg.destination, airport: e.target.value }
                                  updateTransportationLeg(leg.id, 'destination', newDestination)
                                }}
                                placeholder="LAX, JFK, PEK"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Ocean FCL */}
                    {(leg.mode === "OCEAN_FCL" || leg.mode === "OCEAN_LCL") && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{t('vesselName')}</Label>
                          <Input
                            value={leg.vesselName || ""}
                            onChange={(e) => updateTransportationLeg(leg.id, 'vesselName', e.target.value)}
                            placeholder={t('vesselName')}
                          />
                        </div>
                        <div>
                          <Label>{t('voyageNo')}</Label>
                          <Input
                            value={leg.voyageNo || ""}
                            onChange={(e) => updateTransportationLeg(leg.id, 'voyageNo', e.target.value)}
                            placeholder={t('voyageNo')}
                          />
                        </div>
                        {leg.mode === "OCEAN_FCL" && (
                          <>
                            <div>
                              <Label>{t('carrierCode')}</Label>
                              <Input
                                value={leg.carrierCode || ""}
                                onChange={(e) => updateTransportationLeg(leg.id, 'carrierCode', e.target.value)}
                                placeholder="SCAC Code"
                              />
                            </div>
                            <div>
                              <Label>{t('mbl')}</Label>
                              <Input
                                value={leg.mbl || ""}
                                onChange={(e) => updateTransportationLeg(leg.id, 'mbl', e.target.value)}
                                placeholder="MBL"
                              />
                            </div>
                            <div>
                              <Label>{t('hbl')}</Label>
                              <Input
                                value={leg.hbl || ""}
                                onChange={(e) => updateTransportationLeg(leg.id, 'hbl', e.target.value)}
                                placeholder="HBL"
                              />
                            </div>
                            <div>
                              <Label>{t('containerNos')}</Label>
                              <div className="space-y-2">
                                {(leg.containerNos || []).map((containerNo, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <Input
                                      value={containerNo}
                                      onChange={(e) => {
                                        const newContainerNos = [...(leg.containerNos || [])]
                                        newContainerNos[idx] = e.target.value
                                        updateTransportationLeg(leg.id, 'containerNos', newContainerNos)
                                      }}
                                      placeholder={t('containerNo')}
                                    />
                                    {(leg.containerNos || []).length > 1 && (
                                      <Button variant="outline" size="sm" onClick={() => {
                                        const newContainerNos = (leg.containerNos || []).filter((_, i) => i !== idx)
                                        updateTransportationLeg(leg.id, 'containerNos', newContainerNos)
                                      }}>
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => {
                                  updateTransportationLeg(leg.id, 'containerNos', [...(leg.containerNos || []), ""])
                                }}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  {t('addContainerNo')}
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label>{t('sealNos')}</Label>
                              <div className="space-y-2">
                                {(leg.sealNos || []).map((sealNo, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <Input
                                      value={sealNo}
                                      onChange={(e) => {
                                        const newSealNos = [...(leg.sealNos || [])]
                                        newSealNos[idx] = e.target.value
                                        updateTransportationLeg(leg.id, 'sealNos', newSealNos)
                                      }}
                                      placeholder={t('sealNo')}
                                    />
                                    {(leg.sealNos || []).length > 1 && (
                                      <Button variant="outline" size="sm" onClick={() => {
                                        const newSealNos = (leg.sealNos || []).filter((_, i) => i !== idx)
                                        updateTransportationLeg(leg.id, 'sealNos', newSealNos)
                                      }}>
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => {
                                  updateTransportationLeg(leg.id, 'sealNos', [...(leg.sealNos || []), ""])
                                }}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  {t('addSealNo')}
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                        {leg.mode === "OCEAN_LCL" && (
                          <>
                            <div>
                              <Label>{t('hblNumber')}</Label>
                              <Input
                                value={leg.hblNumber || ""}
                                onChange={(e) => updateTransportationLeg(leg.id, 'hblNumber', e.target.value)}
                                placeholder="HBL Number"
                              />
                            </div>
                            <div>
                              <Label>{t('consolidationWarehouse')}</Label>
                              <Input
                                value={leg.consolidationWarehouse || ""}
                                onChange={(e) => updateTransportationLeg(leg.id, 'consolidationWarehouse', e.target.value)}
                                placeholder={t('consolidationWarehouse')}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* FTL / LTL */}
                    {(leg.mode === "FTL" || leg.mode === "LTL") && (
                      <div className="grid grid-cols-2 gap-4">
                        {leg.mode === "FTL" && (
                          <>
                            <div>
                              <Label>{t('licensePlate')}</Label>
                              <Input
                                value={leg.licensePlate || ""}
                                onChange={(e) => updateTransportationLeg(leg.id, 'licensePlate', e.target.value)}
                                placeholder="License Plate"
                              />
                            </div>
                            <div>
                              <Label>{t('driverName')}</Label>
                              <Input
                                value={leg.driverName || ""}
                                onChange={(e) => updateTransportationLeg(leg.id, 'driverName', e.target.value)}
                                placeholder="Driver Name"
                              />
                            </div>
                            <div>
                              <Label>{t('driverPhone')}</Label>
                              <Input
                                value={leg.driverPhone || ""}
                                onChange={(e) => updateTransportationLeg(leg.id, 'driverPhone', e.target.value)}
                                placeholder="Driver Phone"
                              />
                            </div>
                            <div>
                              <Label>{t('bolNumber')}</Label>
                              <Input
                                value={leg.bolNumber || ""}
                                onChange={(e) => updateTransportationLeg(leg.id, 'bolNumber', e.target.value)}
                                placeholder="BOL Number"
                              />
                            </div>
                            <div>
                              <Label>{t('routeCode')}</Label>
                              <Input
                                value={leg.routeCode || ""}
                                onChange={(e) => updateTransportationLeg(leg.id, 'routeCode', e.target.value)}
                                placeholder="Route Code (Optional)"
                              />
                            </div>
                          </>
                        )}
                        {leg.mode === "LTL" && (
                          <>
                            <div>
                              <Label>{t('proNumber')}</Label>
                              <Input
                                value={leg.proNumber || ""}
                                onChange={(e) => updateTransportationLeg(leg.id, 'proNumber', e.target.value)}
                                placeholder="PRO Number"
                              />
                            </div>
                            <div>
                              <Label>{t('bolNumber')}</Label>
                              <Input
                                value={leg.bolNumber || ""}
                                onChange={(e) => updateTransportationLeg(leg.id, 'bolNumber', e.target.value)}
                                placeholder="BOL Number"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Small Parcel / Express */}
                    {(leg.mode === "SMALL_PARCEL" || leg.mode === "EXPRESS") && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{t('serviceType')}</Label>
                          <Input
                            value={leg.serviceType || ""}
                            onChange={(e) => updateTransportationLeg(leg.id, 'serviceType', e.target.value)}
                            placeholder="Standard / Expedited"
                          />
                        </div>
                        <div>
                          <Label>{t('labelCount')}</Label>
                          <Input
                            type="number"
                            value={leg.labelCount || ""}
                            onChange={(e) => updateTransportationLeg(leg.id, 'labelCount', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    )}

                    {/* Rail */}
                    {leg.mode === "RAIL" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{t('trainNo')}</Label>
                          <Input
                            value={leg.trainNo || ""}
                            onChange={(e) => updateTransportationLeg(leg.id, 'trainNo', e.target.value)}
                            placeholder="Train Number"
                          />
                        </div>
                        <div>
                          <Label>{t('railCarNumber')}</Label>
                          <Input
                            value={leg.railCarNumber || ""}
                            onChange={(e) => updateTransportationLeg(leg.id, 'railCarNumber', e.target.value)}
                            placeholder="Rail Car Number"
                          />
                        </div>
                        <div>
                          <Label>{t('operator')}</Label>
                          <Input
                            value={leg.operator || ""}
                            onChange={(e) => updateTransportationLeg(leg.id, 'operator', e.target.value)}
                            placeholder="Operator"
                          />
                        </div>
                      </div>
                    )}

                    {/* Internal / Virtual */}
                    {(leg.mode === "INTERNAL" || leg.mode === "VIRTUAL") && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{t('internalShipmentNo')}</Label>
                          <Input
                            value={leg.internalShipmentNo || ""}
                            onChange={(e) => updateTransportationLeg(leg.id, 'internalShipmentNo', e.target.value)}
                            placeholder="Internal Shipment No"
                          />
                        </div>
                        {leg.mode === "INTERNAL" && (
                          <>
                            <div>
                              <Label>{t('driverName')}</Label>
                              <Input
                                value={leg.driverName || ""}
                                onChange={(e) => updateTransportationLeg(leg.id, 'driverName', e.target.value)}
                                placeholder="Driver Name (Optional)"
                              />
                            </div>
                            <div>
                              <Label>{t('vehicleInfo')}</Label>
                              <Input
                                value={leg.vehicleInfo || ""}
                                onChange={(e) => updateTransportationLeg(leg.id, 'vehicleInfo', e.target.value)}
                                placeholder="Vehicle Info (Optional)"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* 四、包裹信息（Package Info）- 通用模型 + 动态规则 */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">{t('packageInfo')}</Label>
                    
                    {/* 通用包裹区 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t('packageType')}</Label>
                        <Select
                          value={leg.packageType || "BOX"}
                          onValueChange={(value: "BOX" | "PALLET" | "BAG" | "PARCEL" | "CONTAINER" | "OTHER") => 
                            updateTransportationLeg(leg.id, 'packageType', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BOX">{t('box')}</SelectItem>
                            <SelectItem value="PALLET">{t('pallets')}</SelectItem>
                            <SelectItem value="BAG">{t('bag')}</SelectItem>
                            <SelectItem value="PARCEL">{t('packages')}</SelectItem>
                            <SelectItem value="CONTAINER">{t('containers')}</SelectItem>
                            <SelectItem value="OTHER">{t('other')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{t('quantity')}</Label>
                        <Input
                          type="number"
                          value={leg.quantity || ""}
                          onChange={(e) => updateTransportationLeg(leg.id, 'quantity', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>{t('weight')}</Label>
                          <Input
                            type="number"
                            value={leg.totalWeight || ""}
                            onChange={(e) => updateTransportationLeg(leg.id, 'totalWeight', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label>{t('unit')}</Label>
                          <Select
                            value={leg.weightUnit || "LBS"}
                            onValueChange={(value: "LBS" | "KG") => updateTransportationLeg(leg.id, 'weightUnit', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LBS">LBS</SelectItem>
                              <SelectItem value="KG">KG</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>{t('volume')}</Label>
                          <Input
                            type="number"
                            value={leg.totalVolume || ""}
                            onChange={(e) => updateTransportationLeg(leg.id, 'totalVolume', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label>{t('unit')}</Label>
                          <Select
                            value={leg.volumeUnit || "CUBIC_FT"}
                            onValueChange={(value: "CUBIC_FT" | "CUBIC_M") => updateTransportationLeg(leg.id, 'volumeUnit', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CUBIC_FT">Cubic Ft</SelectItem>
                              <SelectItem value="CUBIC_M">Cubic M</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* 高级包裹区 - 按运输方式动态显示 */}
                    {/* Air Cargo: 托盘数、体积重、计费重 */}
                    {leg.mode === "AIR_CARGO" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{t('pallets')}</Label>
                          <Input
                            type="number"
                            value={leg.palletCount || ""}
                            onChange={(e) => updateTransportationLeg(leg.id, 'palletCount', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label>{t('volumeWeight')}</Label>
                          <Input
                            type="number"
                            value={leg.volumeWeight || ""}
                            readOnly
                            placeholder="Auto Calculated"
                            className="bg-muted"
                          />
                        </div>
                        <div>
                          <Label>{t('chargeableWeight')}</Label>
                          <Input
                            type="number"
                            value={leg.chargeableWeight || ""}
                            readOnly
                            placeholder="Auto Calculated"
                            className="bg-muted"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={leg.hazmatFlag || false}
                            onChange={(e) => updateTransportationLeg(leg.id, 'hazmatFlag', e.target.checked)}
                            className="h-4 w-4"
                          />
                          <Label>{t('hazmatFlag')}</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={leg.stackable || false}
                            onChange={(e) => updateTransportationLeg(leg.id, 'stackable', e.target.checked)}
                            className="h-4 w-4"
                          />
                          <Label>{t('stackable')}</Label>
                        </div>
                      </div>
                    )}

                    {/* Ocean FCL: 集装箱数、箱型、TEU */}
                    {leg.mode === "OCEAN_FCL" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{t('containerCount')}</Label>
                          <Input
                            type="number"
                            value={leg.containerCount || ""}
                            onChange={(e) => updateTransportationLeg(leg.id, 'containerCount', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label>{t('containerType')}</Label>
                          <Select
                            value={leg.containerType || "40FT"}
                            onValueChange={(value: "20FT" | "40FT" | "40FT_HC") => 
                              updateTransportationLeg(leg.id, 'containerType', value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="20FT">20FT</SelectItem>
                              <SelectItem value="40FT">40FT</SelectItem>
                              <SelectItem value="40FT_HC">40FT HC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>{t('teu')}</Label>
                          <Input
                            type="number"
                            value={leg.teuCount || ""}
                            onChange={(e) => updateTransportationLeg(leg.id, 'teuCount', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={leg.hazmatFlag || false}
                            onChange={(e) => updateTransportationLeg(leg.id, 'hazmatFlag', e.target.checked)}
                            className="h-4 w-4"
                          />
                          <Label>{t('hazmatFlag')}</Label>
                        </div>
                      </div>
                    )}

                    {/* Small Parcel / Express: 维度、体积重、计费重、申报价值 */}
                    {(leg.mode === "SMALL_PARCEL" || leg.mode === "EXPRESS") && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{t('dimensions')}</Label>
                          <div className="grid grid-cols-4 gap-2">
                            <Input
                              value={leg.dimensions?.length || ""}
                              onChange={(e) => updateTransportationLeg(leg.id, 'dimensions', {
                                ...leg.dimensions,
                                length: e.target.value
                              })}
                              placeholder={t('length')}
                            />
                            <Input
                              value={leg.dimensions?.width || ""}
                              onChange={(e) => updateTransportationLeg(leg.id, 'dimensions', {
                                ...leg.dimensions,
                                width: e.target.value
                              })}
                              placeholder={t('width')}
                            />
                            <Input
                              value={leg.dimensions?.height || ""}
                              onChange={(e) => updateTransportationLeg(leg.id, 'dimensions', {
                                ...leg.dimensions,
                                height: e.target.value
                              })}
                              placeholder={t('height')}
                            />
                            <Select
                              value={leg.dimensions?.unit || "IN"}
                              onValueChange={(value: "IN" | "CM") => updateTransportationLeg(leg.id, 'dimensions', {
                                ...leg.dimensions,
                                unit: value
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="IN">{t('inches')}</SelectItem>
                                <SelectItem value="CM">{t('cm')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>{t('volumeWeight')}</Label>
                          <Input
                            type="number"
                            value={leg.volumeWeight || ""}
                            readOnly
                            placeholder="Auto Calculated"
                            className="bg-muted"
                          />
                        </div>
                        <div>
                          <Label>{t('chargeableWeight')}</Label>
                          <Input
                            type="number"
                            value={leg.chargeableWeight || ""}
                            readOnly
                            placeholder="Auto Calculated"
                            className="bg-muted"
                          />
                        </div>
                        {shipmentType === "INTERNATIONAL" && (
                          <div>
                            <Label>{t('declaredValue')}</Label>
                            <Input
                              type="number"
                              value={leg.declaredValue || ""}
                              onChange={(e) => updateTransportationLeg(leg.id, 'declaredValue', e.target.value)}
                              placeholder="0.00"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* FTL / LTL: 托盘数 */}
                    {(leg.mode === "FTL" || leg.mode === "LTL") && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{t('pallets')}</Label>
                          <Input
                            type="number"
                            value={leg.palletCount || ""}
                            onChange={(e) => updateTransportationLeg(leg.id, 'palletCount', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        {leg.mode === "LTL" && (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={leg.stackable || false}
                              onChange={(e) => updateTransportationLeg(leg.id, 'stackable', e.target.checked)}
                              className="h-4 w-4"
                            />
                            <Label>{t('stackable')}</Label>
                          </div>
                        )}
                        {leg.mode === "FTL" && (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={leg.hazmatFlag || false}
                              onChange={(e) => updateTransportationLeg(leg.id, 'hazmatFlag', e.target.checked)}
                              className="h-4 w-4"
                            />
                            <Label>{t('hazmatFlag')}</Label>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rail: 集装箱数、托盘数 */}
                    {leg.mode === "RAIL" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{t('containerCount')}</Label>
                          <Input
                            type="number"
                            value={leg.containerCount || ""}
                            onChange={(e) => updateTransportationLeg(leg.id, 'containerCount', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label>{t('pallets')}</Label>
                          <Input
                            type="number"
                            value={leg.palletCount || ""}
                            onChange={(e) => updateTransportationLeg(leg.id, 'palletCount', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* 五、底部操作区域（Segment Actions） */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateTransportationLeg(leg.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t('duplicateSegment')}
                    </Button>
                    {index > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveLegUp(leg.id)}
                      >
                        <ArrowUp className="mr-2 h-4 w-4" />
                        {t('moveUp')}
                      </Button>
                    )}
                    {index < transportationLegs.length - 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveLegDown(leg.id)}
                      >
                        <ArrowDown className="mr-2 h-4 w-4" />
                        {t('moveDown')}
                      </Button>
                    )}
                    {transportationLegs.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTransportationLeg(leg.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="mr-2 h-4 w-4" />
                        {t('deleteSegment')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Shipment Lines */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t('shipmentLines')}
              </CardTitle>
              <Button onClick={() => setShowProductDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('addProduct')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {shipmentLines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>{t('noProductLines')}</p>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">{t('lineNo')}</TableHead>
                      <TableHead className="min-w-[200px]">{t('productInfo')}</TableHead>
                      {selectedPOIds.length > 0 && <TableHead>{t('poNo')}</TableHead>}
                      {selectedPOIds.length > 0 && (
                        <>
                          <TableHead>{t('orderedQty')}</TableHead>
                          <TableHead>{t('previouslyShipped')}</TableHead>
                          <TableHead>{t('remainingQty')}</TableHead>
                        </>
                      )}
                      <TableHead className="w-[100px]">{t('shippedQty')} *</TableHead>
                      <TableHead className="w-[80px]">{t('unit')}</TableHead>
                      <TableHead className="w-[60px]">{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipmentLines.map((line, index) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          <Badge variant="outline">{index + 1}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{line.itemName}</div>
                            <div className="text-xs text-muted-foreground">SKU: {line.sku}</div>
                            {line.specifications && (
                              <div className="text-xs text-muted-foreground">{line.specifications}</div>
                            )}
                          </div>
                        </TableCell>
                        {selectedPOIds.length > 0 && (
                          <TableCell>
                            {line.poNo ? (
                              <Badge variant="outline">{line.poNo}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        )}
                        {selectedPOIds.length > 0 && (
                          <>
                            <TableCell>{line.orderedQty || "-"}</TableCell>
                            <TableCell>{line.previouslyShipped || "-"}</TableCell>
                            <TableCell>{line.remainingQty || "-"}</TableCell>
                          </>
                        )}
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={line.remainingQty}
                            value={line.shippedQty}
                            onChange={(e) => handleShippedQtyChange(line.id, parseInt(e.target.value) || 0)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>{line.uom}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveLine(line.id)}>
                            <X className="h-4 w-4" />
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

        {/* Customs Declaration Information - 报关信息 */}
        {shipmentType === "INTERNATIONAL" && (
          <Card>
            <CardHeader>
              <CardTitle>{t('customsDeclarationInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Trade Info */}
              <div className="space-y-4">
                <Label className="text-base font-medium">{t('basicTradeInfo')}</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>{t('declaredValue')}</Label>
                      <Input
                        type="number"
                        value={customsInfo.declaredValue}
                        onChange={(e) => setCustomsInfo({...customsInfo, declaredValue: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label>{t('currency')}</Label>
                      <Select value={customsInfo.currency} onValueChange={(value) => setCustomsInfo({...customsInfo, currency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="CNY">CNY</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>{t('commodityDescription')}</Label>
                    <Textarea
                      value={customsInfo.commodityDescription}
                      onChange={(e) => setCustomsInfo({...customsInfo, commodityDescription: e.target.value})}
                      placeholder={t('commodityDescription')}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Parties */}
              <div className="space-y-4">
                <Label className="text-base font-medium">{t('parties')}</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('exporterName')}</Label>
                    <Input
                      value={customsInfo.exporterName}
                      onChange={(e) => setCustomsInfo({...customsInfo, exporterName: e.target.value})}
                      placeholder={t('exporterName')}
                    />
                  </div>
                  <div>
                    <Label>{t('importerName')}</Label>
                    <Input
                      value={customsInfo.importerName}
                      onChange={(e) => setCustomsInfo({...customsInfo, importerName: e.target.value})}
                      placeholder={t('importerName')}
                    />
                  </div>
                  <div>
                    <Label>{t('importerTaxID')}</Label>
                    <Input
                      value={customsInfo.importerTaxID}
                      onChange={(e) => setCustomsInfo({...customsInfo, importerTaxID: e.target.value})}
                      placeholder={t('importerTaxID')}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Country of Origin */}
              <div className="space-y-4">
                <Label className="text-base font-medium">{t('countryOfOrigin')}</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      value={customsInfo.countryOfOrigin}
                      onChange={(e) => setCustomsInfo({...customsInfo, countryOfOrigin: e.target.value})}
                      placeholder="e.g., CN, US"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Documents */}
              <div className="space-y-4">
                <Label className="text-base font-medium">{t('documents')}</Label>
                
                {/* Commercial Invoice */}
                <div className="space-y-2">
                  <Label className="text-sm">{t('commercialInvoice')}</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        setCustomsInfo({...customsInfo, commercialInvoice: [...customsInfo.commercialInvoice, ...files]})
                      }}
                      className="hidden"
                      id="commercial-invoice-upload"
                    />
                    <label htmlFor="commercial-invoice-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <Button variant="outline" size="sm" type="button" onClick={(e) => {
                          e.preventDefault()
                          document.getElementById('commercial-invoice-upload')?.click()
                        }}>
                          {t('upload')}
                        </Button>
                      </div>
                    </label>
                    {customsInfo.commercialInvoice.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {customsInfo.commercialInvoice.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                            <span>{file.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCustomsInfo({
                                  ...customsInfo,
                                  commercialInvoice: customsInfo.commercialInvoice.filter((_, i) => i !== index)
                                })
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Packing List */}
                <div className="space-y-2">
                  <Label className="text-sm">{t('packingList')}</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        setCustomsInfo({...customsInfo, packingList: [...customsInfo.packingList, ...files]})
                      }}
                      className="hidden"
                      id="packing-list-upload"
                    />
                    <label htmlFor="packing-list-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <Button variant="outline" size="sm" type="button" onClick={(e) => {
                          e.preventDefault()
                          document.getElementById('packing-list-upload')?.click()
                        }}>
                          {t('upload')}
                        </Button>
                      </div>
                    </label>
                    {customsInfo.packingList.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {customsInfo.packingList.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                            <span>{file.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCustomsInfo({
                                  ...customsInfo,
                                  packingList: customsInfo.packingList.filter((_, i) => i !== index)
                                })
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Other Documents */}
                <div className="space-y-2">
                  <Label className="text-sm">{t('otherDocuments')}</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        setCustomsInfo({...customsInfo, otherDocuments: [...customsInfo.otherDocuments, ...files]})
                      }}
                      className="hidden"
                      id="other-documents-upload"
                    />
                    <label htmlFor="other-documents-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <Button variant="outline" size="sm" type="button" onClick={(e) => {
                          e.preventDefault()
                          document.getElementById('other-documents-upload')?.click()
                        }}>
                          {t('upload')}
                        </Button>
                      </div>
                    </label>
                    {customsInfo.otherDocuments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {customsInfo.otherDocuments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                            <span>{file.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCustomsInfo({
                                  ...customsInfo,
                                  otherDocuments: customsInfo.otherDocuments.filter((_, i) => i !== index)
                                })
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attachments and Notes */}
        <Card>
          <CardHeader>
            <CardTitle>{t('attachmentsAndNotes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="remark">{t('notesField')}</Label>
              <Textarea
                id="remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder={t('enterNotes')}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Multi-PO Selection Dialog */}
        <Dialog open={showPODialog} onOpenChange={setShowPODialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('selectPO')}</DialogTitle>
              <DialogDescription>
                {t('selectMultiplePOs')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder={t('search') + " PO No, Supplier, Warehouse..."}
                value={poSearchValue}
                onChange={(e) => setPOSearchValue(e.target.value)}
              />
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>{t('poNo')}</TableHead>
                      <TableHead>{t('supplierName')}</TableHead>
                      <TableHead>{t('warehouse')}</TableHead>
                      <TableHead>{t('lines')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPOs.map((po) => {
                      const availableLines = po.lines.filter(l => l.remainingQty && l.remainingQty > 0).length
                      const isSelected = selectedPOIds.includes(po.id)
                      return (
                        <TableRow key={po.id}>
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handlePOToggle(po.id, checked as boolean)}
                              disabled={availableLines === 0}
                            />
                          </TableCell>
                          <TableCell>{po.poNo}</TableCell>
                          <TableCell>{po.supplierName}</TableCell>
                          <TableCell>{po.warehouse}</TableCell>
                          <TableCell>
                            {availableLines > 0 ? (
                              <Badge variant="outline">{availableLines} {t('available')}</Badge>
                            ) : (
                              <Badge variant="secondary">{t('fullyShipped')}</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {isSelected && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Open PO line selection dialog
                                  const currentLines = selectedPOLines[po.id] || []
                                  // Show lines for selection
                                  const availableLineNos = po.lines
                                    .filter(l => l.remainingQty && l.remainingQty > 0)
                                    .map(l => l.lineNo)
                                  const unselectedLines = availableLineNos.filter(l => !currentLines.includes(l))
                                  if (unselectedLines.length > 0) {
                                    // Auto-select all available lines
                                    handlePOLineToggle(po.id, unselectedLines[0], true)
                                  }
                                }}
                              >
                                {t('selectLines')}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPODialog(false)}>{t('cancel')}</Button>
              <Button onClick={() => {
                // Auto-select all available lines for selected POs
                selectedPOIds.forEach(poId => {
                  const po = mockPOs.find(p => p.id === poId)
                  if (po) {
                    po.lines
                      .filter(l => l.remainingQty && l.remainingQty > 0)
                      .forEach(line => {
                        if (!selectedPOLines[poId]?.includes(line.lineNo)) {
                          handlePOLineToggle(poId, line.lineNo, true)
                        }
                      })
                  }
                })
                setShowPODialog(false)
              }}>{t('confirm')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Product Selection Dialog */}
        <ProductSelectionDialog
          open={showProductDialog}
          onOpenChange={setShowProductDialog}
          onProductsSelected={handleProductsSelected}
        />
      </div>
    </MainLayout>
  )
}
