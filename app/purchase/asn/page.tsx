"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, Column } from "@/components/data-table/data-table"
import { FilterBar, FilterConfig, ActiveFilter, ColumnConfig } from "@/components/data-table/filter-bar"
import { SearchField, AdvancedSearchValues } from "@/components/data-table/advanced-search-dialog"
import { OrderNumberCell } from "@/components/ui/order-number-cell"
import { StatusBadge } from "@/components/ui/status-badge"
import { 
  Plus, Download, Upload, FileDown, FilePlus, 
  ExternalLink, Package, Truck, XCircle, MoreVertical
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/components/i18n-provider"
import { createPurchaseSidebarItems } from "@/lib/purchase-sidebar-items"
import { ShippingStatus } from "@/lib/enums/po-status"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Shipment数据接口
interface Shipment {
  id: string
  shipmentNo: string
  shipmentType: "DOMESTIC" | "INTERNATIONAL"
  mode: "PARCEL" | "AIR" | "OCEAN" | "TRUCK" | "RAIL"
  status: ShippingStatus
  carrier: string
  trackingNo: string
  origin: string
  destination: string
  originCountry?: string
  destinationCountry?: string
  eta: string
  actualDelivery?: string
  relatedPOCount: number
  relatedPOs: string[]
  relatedReceiptNos: string[] // 关联的入库接受单号
  relatedSKUCount: number
  totalShippedQty: number // 只显示运输数量，不显示收货数量
  updatedAt: string
  pickupDate?: string
  deliveryDate?: string
}

// Mock数据
const mockShipments: Shipment[] = [
  {
    id: "1",
    shipmentNo: "SHIP-2024-001",
    shipmentType: "DOMESTIC",
    mode: "TRUCK",
    status: ShippingStatus.SHIPPED,
    carrier: "FedEx",
    trackingNo: "FX123456789",
    origin: "Los Angeles, CA",
    destination: "New York, NY",
    eta: "2024-01-25",
    relatedPOCount: 2,
    relatedPOs: ["PO-001", "PO-002"],
    relatedReceiptNos: [],
    relatedSKUCount: 15,
    totalShippedQty: 500,
    updatedAt: "2024-01-20 10:30:00",
    pickupDate: "2024-01-20",
  },
  {
    id: "2",
    shipmentNo: "SHIP-2024-002",
    shipmentType: "INTERNATIONAL",
    mode: "OCEAN",
    status: ShippingStatus.IN_TRANSIT,
    carrier: "Maersk",
    trackingNo: "MA987654321",
    origin: "Shanghai, China",
    destination: "Los Angeles, CA",
    originCountry: "CN",
    destinationCountry: "US",
    eta: "2024-02-15",
    relatedPOCount: 1,
    relatedPOs: ["PO-003"],
    relatedReceiptNos: [],
    relatedSKUCount: 8,
    totalShippedQty: 1200,
    updatedAt: "2024-01-22 14:20:00",
    pickupDate: "2024-01-18",
  },
  {
    id: "3",
    shipmentNo: "SHIP-2024-003",
    shipmentType: "DOMESTIC",
    mode: "PARCEL",
    status: ShippingStatus.ARRIVED,
    carrier: "UPS",
    trackingNo: "UPS456789123",
    origin: "Chicago, IL",
    destination: "Miami, FL",
    eta: "2024-01-23",
    actualDelivery: "2024-01-23 09:15:00",
    relatedPOCount: 1,
    relatedPOs: ["PO-004"],
    relatedReceiptNos: ["REC-2024-001"],
    relatedSKUCount: 5,
    totalShippedQty: 100,
    updatedAt: "2024-01-23 09:20:00",
    pickupDate: "2024-01-21",
    deliveryDate: "2024-01-23",
  },
  {
    id: "4",
    shipmentNo: "SHIP-2024-004",
    shipmentType: "INTERNATIONAL",
    mode: "AIR",
    status: ShippingStatus.SHIPPING_EXCEPTION,
    carrier: "DHL",
    trackingNo: "DHL789123456",
    origin: "Tokyo, Japan",
    destination: "Seattle, WA",
    originCountry: "JP",
    destinationCountry: "US",
    eta: "2024-01-24",
    relatedPOCount: 1,
    relatedPOs: ["PO-005"],
    relatedReceiptNos: [],
    relatedSKUCount: 12,
    totalShippedQty: 300,
    updatedAt: "2024-01-22 16:45:00",
    pickupDate: "2024-01-20",
  },
  {
    id: "5",
    shipmentNo: "SHIP-2024-005",
    shipmentType: "DOMESTIC",
    mode: "RAIL",
    status: ShippingStatus.IN_TRANSIT,
    carrier: "Union Pacific",
    trackingNo: "UP321654987",
    origin: "Denver, CO",
    destination: "Portland, OR",
    eta: "2024-01-26",
    relatedPOCount: 3,
    relatedPOs: ["PO-006", "PO-007", "PO-008"],
    relatedReceiptNos: [],
    relatedSKUCount: 25,
    totalShippedQty: 800,
    updatedAt: "2024-01-21 11:00:00",
    pickupDate: "2024-01-19",
  },
]

export default function ShipmentPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [searchValue, setSearchValue] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<ActiveFilter[]>([])
  const [advancedSearchValues, setAdvancedSearchValues] = React.useState<AdvancedSearchValues>({})
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [filteredData, setFilteredData] = React.useState<Shipment[]>(mockShipments)
  const [selectedRows, setSelectedRows] = React.useState<(string | number)[]>([])
  const [activeTab, setActiveTab] = React.useState<string>("all")
  
  // Dialog states
  const [showViewDialog, setShowViewDialog] = React.useState(false)
  const [showEditDialog, setShowEditDialog] = React.useState(false)
  const [showUpdateTrackingDialog, setShowUpdateTrackingDialog] = React.useState(false)
  const [showMarkArrivedDialog, setShowMarkArrivedDialog] = React.useState(false)
  const [showMarkExceptionDialog, setShowMarkExceptionDialog] = React.useState(false)
  const [showResolveExceptionDialog, setShowResolveExceptionDialog] = React.useState(false)
  const [currentShipment, setCurrentShipment] = React.useState<Shipment | null>(null)
  
  // Form states for dialogs
  const [trackingNo, setTrackingNo] = React.useState("")
  const [eta, setEta] = React.useState("")
  const [actualDelivery, setActualDelivery] = React.useState("")
  const [exceptionReason, setExceptionReason] = React.useState("")
  const [resolveNote, setResolveNote] = React.useState("")
  const [autoReceive, setAutoReceive] = React.useState(false)
  const [receivingQuantities, setReceivingQuantities] = React.useState<Record<string, number>>({})
  const [showCreateReceivingDialog, setShowCreateReceivingDialog] = React.useState(false)
  const [createReceivingQuantities, setCreateReceivingQuantities] = React.useState<Record<string, number>>({})
  
  // Mock shipment lines data (in real app, fetch from API)
  const getShipmentLines = (shipmentId: string) => {
    // Mock data - in real app, fetch from API
    return [
      { id: "line1", lineNo: 1, sku: "SKU-001", itemName: "Product A", shippedQty: 100, uom: "PCS", receivedQty: 0 },
      { id: "line2", lineNo: 2, sku: "SKU-002", itemName: "Product B", shippedQty: 50, uom: "PCS", receivedQty: 0 },
    ]
  }

  const sidebarItems = createPurchaseSidebarItems(t)

  // 状态配置
  const statusConfig = {
    [ShippingStatus.SHIPPED]: { label: t('SHIPPED'), color: "text-primary" },
    [ShippingStatus.IN_TRANSIT]: { label: t('IN_TRANSIT'), color: "text-primary" },
    [ShippingStatus.ARRIVED]: { label: t('ARRIVED'), color: "text-success" },
    [ShippingStatus.SHIPPING_EXCEPTION]: { label: t('SHIPPING_EXCEPTION'), color: "text-destructive" },
  }

  // 运输类型配置
  const shipmentTypeConfig = {
    DOMESTIC: t('domestic'),
    INTERNATIONAL: t('international'),
  }

  // 运输方式配置
  const modeConfig = {
    PARCEL: t('parcel'),
    AIR: t('air'),
    OCEAN: t('ocean'),
    TRUCK: t('truck'),
    RAIL: t('rail'),
  }

  // 筛选器配置
  const filterConfigs: FilterConfig[] = [
    {
      id: "status",
      label: t('status'),
      type: "multiple",
      options: [
        { id: "shipped", label: t('SHIPPED'), value: ShippingStatus.SHIPPED },
        { id: "in_transit", label: t('IN_TRANSIT'), value: ShippingStatus.IN_TRANSIT },
        { id: "arrived", label: t('ARRIVED'), value: ShippingStatus.ARRIVED },
        { id: "shipping_exception", label: t('SHIPPING_EXCEPTION'), value: ShippingStatus.SHIPPING_EXCEPTION },
      ],
    },
    {
      id: "shipmentType",
      label: t('shipmentType'),
      type: "multiple",
      options: [
        { id: "domestic", label: t('domestic'), value: "DOMESTIC" },
        { id: "international", label: t('international'), value: "INTERNATIONAL" },
      ],
    },
    {
      id: "mode",
      label: t('mode'),
      type: "multiple",
      options: [
        { id: "parcel", label: t('parcel'), value: "PARCEL" },
        { id: "air", label: t('air'), value: "AIR" },
        { id: "ocean", label: t('ocean'), value: "OCEAN" },
        { id: "truck", label: t('truck'), value: "TRUCK" },
        { id: "rail", label: t('rail'), value: "RAIL" },
      ],
    },
    {
      id: "carrier",
      label: t('carrier'),
      type: "multiple",
      options: [
        { id: "fedex", label: "FedEx", value: "FedEx" },
        { id: "ups", label: "UPS", value: "UPS" },
        { id: "dhl", label: "DHL", value: "DHL" },
        { id: "maersk", label: "Maersk", value: "Maersk" },
        { id: "union_pacific", label: "Union Pacific", value: "Union Pacific" },
      ],
    },
  ]

  // 高级搜索字段配置
  const advancedSearchFields: SearchField[] = [
    { id: "shipmentNo", label: t('shipmentNo'), placeholder: "e.g., SHIP-2024-001" },
    { id: "trackingNo", label: t('trackingNo'), placeholder: "e.g., FX123456789" },
    { id: "poNo", label: t('poNo'), placeholder: "e.g., PO-001" },
    { id: "skuItem", label: t('skuItem'), placeholder: "e.g., SKU-001 or Item Name" },
    { id: "originCountry", label: t('originCountry'), placeholder: "e.g., CN, US" },
    { id: "destinationCountry", label: t('destinationCountry'), placeholder: "e.g., CN, US" },
  ]

  // 列配置（用于列可见性控制）
  const [columnConfigs, setColumnConfigs] = React.useState<ColumnConfig[]>(() => {
    return [
      { id: "shipmentNo", label: t('shipmentNo'), visible: true, defaultVisible: true },
      { id: "shipmentType", label: t('shipmentType'), visible: true, defaultVisible: true },
      { id: "mode", label: t('mode'), visible: true, defaultVisible: true },
      { id: "status", label: t('status'), visible: true, defaultVisible: true },
      { id: "carrier", label: t('carrier'), visible: true, defaultVisible: true },
      { id: "trackingNo", label: t('trackingNo'), visible: true, defaultVisible: true },
      { id: "originDestination", label: t('originDestination'), visible: true, defaultVisible: true },
      { id: "eta", label: t('eta'), visible: true, defaultVisible: true },
      { id: "actualDelivery", label: t('actualDelivery'), visible: false, defaultVisible: false },
      { id: "relatedPOs", label: t('relatedPOs'), visible: true, defaultVisible: true },
      { id: "relatedReceiptNos", label: t('relatedReceiptNos'), visible: true, defaultVisible: true },
      { id: "relatedSKUCount", label: t('relatedSKUCount'), visible: true, defaultVisible: true },
      { id: "totalShippedQty", label: t('totalShippedQty'), visible: true, defaultVisible: true },
      { id: "updatedAt", label: t('updatedAt'), visible: false, defaultVisible: false },
      { id: "actions", label: t('actions'), visible: true, defaultVisible: true },
    ]
  })

  // 计算状态计数
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      all: mockShipments.length,
      [ShippingStatus.SHIPPED]: 0,
      [ShippingStatus.IN_TRANSIT]: 0,
      [ShippingStatus.ARRIVED]: 0,
      [ShippingStatus.SHIPPING_EXCEPTION]: 0,
    }
    mockShipments.forEach(shipment => {
      counts[shipment.status] = (counts[shipment.status] || 0) + 1
    })
    return counts
  }, [])

  // 过滤数据
  React.useEffect(() => {
    let result = [...mockShipments]

    // 标签页过滤
    if (activeTab !== "all") {
      result = result.filter(s => s.status === activeTab)
    }

    // 搜索过滤
    if (searchValue) {
      const searchLower = searchValue.toLowerCase()
      result = result.filter(s =>
        s.shipmentNo.toLowerCase().includes(searchLower) ||
        s.trackingNo.toLowerCase().includes(searchLower) ||
        s.carrier.toLowerCase().includes(searchLower) ||
        s.origin.toLowerCase().includes(searchLower) ||
        s.destination.toLowerCase().includes(searchLower) ||
        s.relatedPOs.some(po => po.toLowerCase().includes(searchLower))
      )
    }

    // 筛选器过滤
    if (activeFilters.length > 0) {
      result = result.filter(s => {
        return activeFilters.every(filter => {
          switch (filter.filterId) {
            case "status":
              return s.status === filter.optionValue
            case "shipmentType":
              return s.shipmentType === filter.optionValue
            case "mode":
              return s.mode === filter.optionValue
            case "carrier":
              return s.carrier === filter.optionValue
            default:
              return true
          }
        })
      })
    }

    // 高级搜索过滤
    if (Object.keys(advancedSearchValues).length > 0) {
      result = result.filter(s => {
        if (advancedSearchValues.shipmentNo && !s.shipmentNo.toLowerCase().includes(advancedSearchValues.shipmentNo.toLowerCase())) {
          return false
        }
        if (advancedSearchValues.trackingNo && !s.trackingNo.toLowerCase().includes(advancedSearchValues.trackingNo.toLowerCase())) {
          return false
        }
        if (advancedSearchValues.poNo && !s.relatedPOs.some(po => po.toLowerCase().includes(advancedSearchValues.poNo!.toLowerCase()))) {
          return false
        }
        if (advancedSearchValues.originCountry && s.originCountry !== advancedSearchValues.originCountry) {
          return false
        }
        if (advancedSearchValues.destinationCountry && s.destinationCountry !== advancedSearchValues.destinationCountry) {
          return false
        }
        return true
      })
    }

    setFilteredData(result)
    setCurrentPage(1)
  }, [activeTab, searchValue, activeFilters, advancedSearchValues])

  // 操作处理函数
  const handleView = (shipment: Shipment) => {
    router.push(`/purchase/asn/${shipment.id}`)
  }

  const handleEdit = (shipment: Shipment) => {
    router.push(`/purchase/asn/${shipment.id}/edit`)
  }

  const handleUpdateTracking = (shipment: Shipment) => {
    setCurrentShipment(shipment)
    setTrackingNo(shipment.trackingNo)
    setEta(shipment.eta)
    setShowUpdateTrackingDialog(true)
  }

  const handleMarkArrived = (shipment: Shipment) => {
    setCurrentShipment(shipment)
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
    setActualDelivery(dateStr)
    setAutoReceive(false)
    setReceivingQuantities({})
    setShowMarkArrivedDialog(true)
  }

  const handleMarkException = (shipment: Shipment) => {
    setCurrentShipment(shipment)
    setExceptionReason("")
    setShowMarkExceptionDialog(true)
  }

  const handleResolveException = (shipment: Shipment) => {
    setCurrentShipment(shipment)
    setResolveNote("")
    setShowResolveExceptionDialog(true)
  }

  const handleCreateReceiving = (shipment: Shipment) => {
    setCurrentShipment(shipment)
    const lines = getShipmentLines(shipment.id)
    const initialQuantities: Record<string, number> = {}
    lines.forEach(line => {
      initialQuantities[line.id] = line.shippedQty - (line.receivedQty || 0)
    })
    setCreateReceivingQuantities(initialQuantities)
    setShowCreateReceivingDialog(true)
  }
  
  const handleReceivingQtyChange = (lineId: string, value: number, isCreateReceiving: boolean = false) => {
    if (isCreateReceiving) {
      setCreateReceivingQuantities(prev => ({ ...prev, [lineId]: value }))
    } else {
      setReceivingQuantities(prev => ({ ...prev, [lineId]: value }))
    }
  }

  // 获取可用操作（根据状态）
  const getAvailableActions = (shipment: Shipment) => {
    switch (shipment.status) {
      case ShippingStatus.SHIPPED:
      case ShippingStatus.IN_TRANSIT:
        return [
          { label: t('view'), action: () => handleView(shipment) },
          { label: t('edit'), action: () => handleEdit(shipment) },
          { label: t('updateTracking'), action: () => handleUpdateTracking(shipment) },
          { label: t('markException'), action: () => handleMarkException(shipment) },
          { label: t('markArrived'), action: () => handleMarkArrived(shipment) },
        ]
      case ShippingStatus.ARRIVED:
        return [
          { label: t('view'), action: () => handleView(shipment) },
          { label: t('createReceiving'), action: () => handleCreateReceiving(shipment) },
        ]
      case ShippingStatus.SHIPPING_EXCEPTION:
        return [
          { label: t('view'), action: () => handleView(shipment) },
          { label: t('edit'), action: () => handleEdit(shipment) },
          { label: t('resolveException'), action: () => handleResolveException(shipment) },
          { label: t('updateTracking'), action: () => handleUpdateTracking(shipment) },
        ]
      default:
        return []
    }
  }

  // 列定义
  const columns: Column<Shipment>[] = [
    {
      id: "shipmentNo",
      header: t('shipmentNo'),
      accessorKey: "shipmentNo",
      width: "150px",
      defaultVisible: true,
      cell: (row) => (
        <OrderNumberCell 
          orderNumber={row.shipmentNo} 
          onClick={() => router.push(`/purchase/asn/${row.id}`)}
        />
      ),
    },
    {
      id: "status",
      header: t('status'),
      width: "120px",
      defaultVisible: true,
      cell: (row) => (
        <StatusBadge status={row.status} language="cn" />
      ),
    },
    {
      id: "shipmentType",
      header: t('shipmentType'),
      width: "100px",
      defaultVisible: true,
      cell: (row) => (
        <span className="text-text-secondary text-sm">{shipmentTypeConfig[row.shipmentType]}</span>
      ),
    },
    {
      id: "mode",
      header: t('mode'),
      width: "100px",
      defaultVisible: true,
      cell: (row) => (
        <span className="text-sm">{modeConfig[row.mode]}</span>
      ),
    },
    {
      id: "carrier",
      header: t('carrier'),
      width: "120px",
      defaultVisible: true,
      cell: (row) => <span className="text-sm">{row.carrier}</span>,
    },
    {
      id: "trackingNo",
      header: t('trackingNo'),
      width: "150px",
      defaultVisible: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">{row.trackingNo}</span>
          <ExternalLink className="h-3 w-3 text-muted-foreground cursor-pointer" />
        </div>
      ),
    },
    {
      id: "originDestination",
      header: t('originDestination'),
      width: "200px",
      defaultVisible: true,
      cell: (row) => (
        <div className="text-sm">
          <div>{row.origin}</div>
          <div className="text-muted-foreground">→ {row.destination}</div>
        </div>
      ),
    },
    {
      id: "eta",
      header: t('eta'),
      width: "120px",
      defaultVisible: true,
      cell: (row) => <span className="text-sm">{row.eta}</span>,
    },
    {
      id: "actualDelivery",
      header: t('actualDelivery'),
      width: "150px",
      defaultVisible: false,
      cell: (row) => (
        <span className="text-sm">{row.actualDelivery || "-"}</span>
      ),
    },
    {
      id: "relatedPOs",
      header: t('relatedPOs'),
      width: "200px",
      defaultVisible: true,
      cell: (row) => (
        <div className="flex flex-wrap gap-1 text-xs">
          {row.relatedPOs.map((po, idx) => (
            <OrderNumberCell 
              key={idx}
              orderNumber={po} 
              onClick={() => router.push(`/purchase/po/${po}`)}
              className="text-xs"
            />
          ))}
        </div>
      ),
    },
    {
      id: "relatedReceiptNos",
      header: t('relatedReceiptNos'),
      width: "200px",
      defaultVisible: true,
      cell: (row) => (
        <div className="flex flex-wrap gap-1 text-xs">
          {row.relatedReceiptNos.length > 0 ? (
            row.relatedReceiptNos.map((receipt, idx) => (
              <OrderNumberCell 
                key={idx}
                orderNumber={receipt} 
                onClick={() => router.push(`/purchase/receipts/${receipt}`)}
                className="text-xs"
              />
            ))
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      id: "relatedSKUCount",
      header: t('relatedSKUCount'),
      width: "120px",
      defaultVisible: true,
      cell: (row) => (
        <span className="text-sm">{row.relatedSKUCount} SKU</span>
      ),
    },
    {
      id: "totalShippedQty",
      header: t('totalShippedQty'),
      width: "120px",
      defaultVisible: true,
      cell: (row) => (
        <span className="text-sm">{row.totalShippedQty}</span>
      ),
    },
    {
      id: "updatedAt",
      header: t('updatedAt'),
      width: "150px",
      defaultVisible: false,
      cell: (row) => <span className="text-sm text-muted-foreground">{row.updatedAt}</span>,
    },
    {
      id: "actions",
      header: t('actions'),
      width: "80px",
      defaultVisible: true,
      cell: (row) => {
        const actions = getAvailableActions(row)
        
        if (actions.length === 0) {
          return null
        }

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4 text-text-secondary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                {actions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      action.action()
                    }}
                    className="text-sm"
                  >
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  // 批量操作
  const selectedRowsData = React.useMemo(() => {
    return filteredData.filter(row => selectedRows.includes(row.id))
  }, [filteredData, selectedRows])

  const selectedStatuses = React.useMemo(() => {
    return [...new Set(selectedRowsData.map(row => row.status))]
  }, [selectedRowsData])

  const availableBatchActions = React.useMemo(() => {
    if (selectedRows.length === 0) return []
    
    if (selectedStatuses.length === 1) {
      const status = selectedStatuses[0]
      switch (status) {
        case ShippingStatus.SHIPPED:
        case ShippingStatus.IN_TRANSIT:
          return [
            { label: t('batchUpdateTracking'), action: () => console.log("Batch Update Tracking", selectedRows) },
            { label: t('batchMarkArrived'), action: () => console.log("Batch Mark Arrived", selectedRows) },
            { label: t('batchMarkException'), action: () => console.log("Batch Mark Exception", selectedRows) },
          ]
        case ShippingStatus.ARRIVED:
          return [
            { label: t('batchCreateReceiving'), action: () => console.log("Batch Create Receiving", selectedRows) },
          ]
        case ShippingStatus.SHIPPING_EXCEPTION:
          return [
            { label: t('batchResolveException'), action: () => console.log("Batch Resolve Exception", selectedRows) },
            { label: t('batchUpdateTracking'), action: () => console.log("Batch Update Tracking", selectedRows) },
          ]
        default:
          return []
      }
    }
    
    // 混合状态
    return [
      { label: t('batchUpdateTracking'), action: () => console.log("Batch Update Tracking", selectedRows) },
    ]
  }, [selectedRows, selectedStatuses, t])

  // 分页数据
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return filteredData.slice(start, end)
  }, [filteredData, currentPage, pageSize])

  // 可见列
  const visibleColumns = React.useMemo(() => {
    return columns.filter(col => {
      const config = columnConfigs.find(c => c.id === col.id)
      return config?.visible !== false
    })
  }, [columns, columnConfigs])

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">{t('shipments')}</h1>
            <p className="text-sm text-text-secondary mt-sm">{t('manageShipments')}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => console.log("Export", selectedRows.length > 0 ? selectedRows : "all")}
            >
              <Download className="mr-2 h-4 w-4" />
              {selectedRows.length > 0 ? `${t('export')} (${selectedRows.length})` : t('export')}
            </Button>
            
            {/* Batch Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" disabled={selectedRows.length === 0} className="text-sm font-normal">
                  <Package className="mr-2 h-4 w-4" />
                  {t('batchActions')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {selectedRows.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    {t('selectRowsToSeeActions')}
                  </div>
                ) : selectedStatuses.length === 1 ? (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      {t('statusLabel')}: {statusConfig[selectedStatuses[0]].label}
                    </div>
                    <DropdownMenuSeparator />
                    {availableBatchActions.map((action, idx) => (
                      <DropdownMenuItem key={idx} onClick={action.action}>
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      {t('mixedStatus')} ({selectedStatuses.length} {t('types')})
          </div>
                    <DropdownMenuSeparator />
                    {availableBatchActions.map((action, idx) => (
                      <DropdownMenuItem key={idx} onClick={action.action}>
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Selection */}
            {selectedRows.length > 0 && (
              <Button variant="outline" onClick={() => setSelectedRows([])}>
                <XCircle className="mr-2 h-4 w-4" />
                {t('clearSelection')}
              </Button>
            )}

            {/* New Shipment */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
          <Button size="sm" className="text-sm font-normal">
            <Plus className="mr-2 h-4 w-4" />
                  {t('newShipment')}
          </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => router.push("/purchase/asn/create")}>
                  <FilePlus className="mr-2 h-4 w-4" />
                  {t('createManuallyShipment')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Import from File")}>
                  <Upload className="mr-2 h-4 w-4" />
                  {t('importFromFileShipment')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => console.log("Download Template")}>
                  <FileDown className="mr-2 h-4 w-4" />
                  {t('downloadTemplateShipment')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              {t('all')} <Badge className="ml-2">{statusCounts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value={ShippingStatus.SHIPPED}>
              {t('SHIPPED')} <Badge className="ml-2">{statusCounts[ShippingStatus.SHIPPED]}</Badge>
            </TabsTrigger>
            <TabsTrigger value={ShippingStatus.IN_TRANSIT}>
              {t('IN_TRANSIT')} <Badge className="ml-2">{statusCounts[ShippingStatus.IN_TRANSIT]}</Badge>
            </TabsTrigger>
            <TabsTrigger value={ShippingStatus.ARRIVED}>
              {t('ARRIVED')} <Badge className="ml-2">{statusCounts[ShippingStatus.ARRIVED]}</Badge>
            </TabsTrigger>
            <TabsTrigger value={ShippingStatus.SHIPPING_EXCEPTION}>
              {t('SHIPPING_EXCEPTION')} <Badge className="ml-2">{statusCounts[ShippingStatus.SHIPPING_EXCEPTION]}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filter Bar */}
        <FilterBar
          searchPlaceholder={`${t('search')} ${t('shipmentNo')}, ${t('trackingNo')}, ${t('carrier')}...`}
          onSearchChange={setSearchValue}
          filters={filterConfigs}
          onFiltersChange={setActiveFilters}
          columns={columnConfigs}
          onColumnsChange={setColumnConfigs}
          advancedSearchFields={advancedSearchFields}
          onAdvancedSearch={setAdvancedSearchValues}
        />

        {/* Data Table */}
        <Card>
          <CardContent className="pt-6">
            <DataTable
              data={paginatedData}
              columns={visibleColumns}
              currentPage={currentPage}
              totalItems={filteredData.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              onSelectionChange={setSelectedRows}
              selectedRows={selectedRows}
              onRowClick={(row) => handleView(row)}
              hideColumnControl={true}
            />
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('viewShipment')} - {currentShipment?.shipmentNo}</DialogTitle>
              <DialogDescription>
                {t('viewShipment')} {t('shipmentNo')}: {currentShipment?.shipmentNo}
              </DialogDescription>
            </DialogHeader>
            {currentShipment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('shipmentNo')}</Label>
                    <div className="text-sm font-medium">{currentShipment.shipmentNo}</div>
                  </div>
                  <div>
                    <Label>{t('status')}</Label>
                    <div>
                      <span className={`${statusConfig[currentShipment.status].color} text-sm`}>
                        {statusConfig[currentShipment.status].label}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>{t('shipmentType')}</Label>
                    <div className="text-sm">{shipmentTypeConfig[currentShipment.shipmentType]}</div>
                  </div>
                  <div>
                    <Label>{t('mode')}</Label>
                    <div className="text-sm">{modeConfig[currentShipment.mode]}</div>
                  </div>
                  <div>
                    <Label>{t('carrier')}</Label>
                    <div className="text-sm">{currentShipment.carrier}</div>
                  </div>
                  <div>
                    <Label>{t('trackingNo')}</Label>
                    <div className="text-sm">{currentShipment.trackingNo}</div>
                  </div>
                  <div>
                    <Label>{t('origin')}</Label>
                    <div className="text-sm">{currentShipment.origin}</div>
                  </div>
                  <div>
                    <Label>{t('destination')}</Label>
                    <div className="text-sm">{currentShipment.destination}</div>
                  </div>
                  <div>
                    <Label>{t('eta')}</Label>
                    <div className="text-sm">{currentShipment.eta}</div>
                  </div>
                  {currentShipment.actualDelivery && (
                    <div>
                      <Label>{t('actualDelivery')}</Label>
                      <div className="text-sm">{currentShipment.actualDelivery}</div>
                    </div>
                  )}
                  <div>
                    <Label>{t('relatedPOs')}</Label>
                    <div className="text-sm">{currentShipment.relatedPOs.join(", ")}</div>
                  </div>
                  <div>
                    <Label>{t('relatedReceiptNos')}</Label>
                    <div className="text-sm">
                      {currentShipment.relatedReceiptNos.length > 0 
                        ? currentShipment.relatedReceiptNos.join(", ")
                        : "-"}
                    </div>
                  </div>
                  <div>
                    <Label>{t('relatedSKUCount')}</Label>
                    <div className="text-sm">{currentShipment.relatedSKUCount} SKU</div>
                  </div>
                  <div>
                    <Label>{t('totalShippedQty')}</Label>
                    <div className="text-sm">{currentShipment.totalShippedQty}</div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewDialog(false)}>{t('close')}</Button>
              {currentShipment && (
                <Button onClick={() => {
                  setShowViewDialog(false)
                  handleEdit(currentShipment)
                }}>{t('edit')}</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Tracking Dialog */}
        <Dialog open={showUpdateTrackingDialog} onOpenChange={setShowUpdateTrackingDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('updateTracking')}</DialogTitle>
              <DialogDescription>
                {t('updateTracking')} {t('shipmentNo')}: {currentShipment?.shipmentNo}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="trackingNo">{t('trackingNo')}</Label>
                <Input
                  id="trackingNo"
                  value={trackingNo}
                  onChange={(e) => setTrackingNo(e.target.value)}
                  placeholder={t('trackingNo')}
                />
              </div>
              <div>
                <Label htmlFor="eta">{t('eta')}</Label>
                <Input
                  id="eta"
                  type="date"
                  value={eta}
                  onChange={(e) => setEta(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUpdateTrackingDialog(false)}>{t('cancel')}</Button>
              <Button onClick={() => {
                console.log("Update Tracking", { shipmentId: currentShipment?.id, trackingNo, eta })
                setShowUpdateTrackingDialog(false)
              }}>{t('confirm')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mark Arrived Dialog */}
        <Dialog open={showMarkArrivedDialog} onOpenChange={setShowMarkArrivedDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('markArrived')}</DialogTitle>
              <DialogDescription>
                {t('markArrived')} {t('shipmentNo')}: {currentShipment?.shipmentNo}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="actualDelivery">{t('actualDelivery')}</Label>
                <Input
                  id="actualDelivery"
                  type="datetime-local"
                  value={actualDelivery}
                  onChange={(e) => setActualDelivery(e.target.value)}
                />
              </div>
              
              {/* Auto Receive Option */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="autoReceive" 
                  checked={autoReceive}
                  onCheckedChange={(checked) => {
                    setAutoReceive(checked as boolean)
                    if (checked && currentShipment) {
                      const lines = getShipmentLines(currentShipment.id)
                      const initialQuantities: Record<string, number> = {}
                      lines.forEach(line => {
                        initialQuantities[line.id] = line.shippedQty - (line.receivedQty || 0)
                      })
                      setReceivingQuantities(initialQuantities)
                    } else {
                      setReceivingQuantities({})
                    }
                  }}
                />
                <Label htmlFor="autoReceive" className="cursor-pointer">
                  {t('autoReceiveOnArrival')}
                </Label>
              </div>
              
              {/* Receiving Quantities Table */}
              {autoReceive && currentShipment && (
                <div className="border rounded-lg">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800">
                    <Label className="text-base font-medium">{t('receivingQuantities')}</Label>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">{t('lineNo')}</TableHead>
                        <TableHead className="min-w-[200px]">{t('productInfo')}</TableHead>
                        <TableHead className="text-center">{t('shippedQty')}</TableHead>
                        <TableHead className="text-center">{t('receivedQty')}</TableHead>
                        <TableHead className="text-center">{t('receivingQty')}</TableHead>
                        <TableHead className="w-[80px]">{t('unit')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getShipmentLines(currentShipment.id).map((line) => {
                        const maxQty = line.shippedQty - (line.receivedQty || 0)
                        const receivingQty = receivingQuantities[line.id] || 0
                        return (
                          <TableRow key={line.id}>
                            <TableCell>
                              <Badge variant="outline">{line.lineNo}</Badge>
                            </TableCell>
                            <TableCell>
                  <div className="space-y-1">
                                <div className="font-medium text-sm">{line.itemName}</div>
                                <div className="text-xs text-muted-foreground">SKU: {line.sku}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{line.shippedQty}</TableCell>
                            <TableCell className="text-center">{line.receivedQty || 0}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                max={maxQty}
                                value={receivingQty}
                                onChange={(e) => handleReceivingQtyChange(line.id, parseInt(e.target.value) || 0)}
                                className="w-24 mx-auto"
                              />
                            </TableCell>
                            <TableCell className="text-center">{line.uom}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowMarkArrivedDialog(false)
                setAutoReceive(false)
                setReceivingQuantities({})
              }}>{t('cancel')}</Button>
              <Button onClick={() => {
                console.log("Mark Arrived", { 
                  shipmentId: currentShipment?.id, 
                  actualDelivery,
                  autoReceive,
                  receivingQuantities: autoReceive ? receivingQuantities : undefined
                })
                setShowMarkArrivedDialog(false)
                setAutoReceive(false)
                setReceivingQuantities({})
              }}>{t('confirm')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mark Exception Dialog */}
        <Dialog open={showMarkExceptionDialog} onOpenChange={setShowMarkExceptionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('markException')}</DialogTitle>
              <DialogDescription>
                {t('markException')} {t('shipmentNo')}: {currentShipment?.shipmentNo}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="exceptionReason">{t('exceptionDescription')}</Label>
                <Textarea
                  id="exceptionReason"
                  value={exceptionReason}
                  onChange={(e) => setExceptionReason(e.target.value)}
                  placeholder={t('enterNotes')}
                  rows={4}
                />
                  </div>
                  </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMarkExceptionDialog(false)}>{t('cancel')}</Button>
              <Button onClick={() => {
                console.log("Mark Exception", { shipmentId: currentShipment?.id, exceptionReason })
                setShowMarkExceptionDialog(false)
              }}>{t('confirm')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Resolve Exception Dialog */}
        <Dialog open={showResolveExceptionDialog} onOpenChange={setShowResolveExceptionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('resolveException')}</DialogTitle>
              <DialogDescription>
                {t('resolveException')} {t('shipmentNo')}: {currentShipment?.shipmentNo}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="resolveNote">{t('notes')}</Label>
                <Textarea
                  id="resolveNote"
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  placeholder={t('enterNotes')}
                  rows={4}
                />
                  </div>
                </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResolveExceptionDialog(false)}>{t('cancel')}</Button>
              <Button onClick={() => {
                console.log("Resolve Exception", { shipmentId: currentShipment?.id, resolveNote })
                setShowResolveExceptionDialog(false)
              }}>{t('confirm')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Receiving Dialog */}
        <Dialog open={showCreateReceivingDialog} onOpenChange={setShowCreateReceivingDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('createReceiving')}</DialogTitle>
              <DialogDescription>
                {t('createReceiving')} {t('shipmentNo')}: {currentShipment?.shipmentNo}
                <br />
                <span className="text-sm text-muted-foreground">{t('createReceivingDesc')}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Receiving Quantities Table */}
              {currentShipment && (
                <div className="border rounded-lg">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800">
                    <Label className="text-base font-medium">{t('receivingQuantities')}</Label>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">{t('lineNo')}</TableHead>
                        <TableHead className="min-w-[200px]">{t('productInfo')}</TableHead>
                        <TableHead className="text-center">{t('shippedQty')}</TableHead>
                        <TableHead className="text-center">{t('receivedQty')}</TableHead>
                        <TableHead className="text-center">{t('receivingQty')} *</TableHead>
                        <TableHead className="w-[80px]">{t('unit')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getShipmentLines(currentShipment.id).map((line) => {
                        const maxQty = line.shippedQty - (line.receivedQty || 0)
                        const receivingQty = createReceivingQuantities[line.id] || 0
                        return (
                          <TableRow key={line.id}>
                            <TableCell>
                              <Badge variant="outline">{line.lineNo}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-sm">{line.itemName}</div>
                                <div className="text-xs text-muted-foreground">SKU: {line.sku}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{line.shippedQty}</TableCell>
                            <TableCell className="text-center">{line.receivedQty || 0}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                max={maxQty}
                                value={receivingQty}
                                onChange={(e) => handleReceivingQtyChange(line.id, parseInt(e.target.value) || 0, true)}
                                className="w-24 mx-auto"
                                required
                              />
                            </TableCell>
                            <TableCell className="text-center">{line.uom}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowCreateReceivingDialog(false)
                setCreateReceivingQuantities({})
              }}>{t('cancel')}</Button>
              <Button onClick={() => {
                const hasQuantities = Object.values(createReceivingQuantities).some(qty => qty > 0)
                if (!hasQuantities) {
                  alert(t('pleaseEnterReceivingQuantities'))
                  return
                }
                console.log("Create Receiving", { 
                  shipmentId: currentShipment?.id,
                  quantities: createReceivingQuantities,
                  status: "CLOSED" // 创建即收货完成
                })
                setShowCreateReceivingDialog(false)
                setCreateReceivingQuantities({})
                // In real app, navigate to receipt detail page or refresh list
              }}>{t('createAndComplete')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
