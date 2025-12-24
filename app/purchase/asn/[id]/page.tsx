"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  ArrowLeft, Edit, Download, Package, Truck, MapPin, 
  Building2, FileText, ExternalLink, Clock, AlertTriangle,
  Copy, Send, RefreshCw, Phone, Mail
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { createPurchaseSidebarItems } from "@/lib/purchase-sidebar-items"
import { ShippingStatus } from "@/lib/enums/po-status"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

// Shipment Detail Interface
interface ShipmentDetail {
  id: string
  shipmentNo: string
  shipmentType: "DOMESTIC" | "INTERNATIONAL"
  direction: "INBOUND" | "OUTBOUND" | "RETURN" | "TRANSFER"
  status: ShippingStatus
  carrier: string
  trackingNos: string[]
  origin: {
    warehouse?: string
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
  plannedPickupDatetime?: string
  plannedDeliveryDatetime?: string
  actualPickupDatetime?: string
  actualDeliveryDatetime?: string
  transportationLegs: TransportationLeg[]
  shipmentLines: ShipmentLineItem[]
  relatedPOs: {
    poNo: string
    poId: string
    status: string
    supplierName: string
    totalAmount: number
    currency: string
    created: string
    expectedArrivalDate?: string
  }[]
  relatedReceipts: {
    receiptNo: string
    receiptId: string
    receivedQty: number
    receivedDate: string
    receivedBy: string
    receiptStatus: string
    warehouseName?: string
    warehouseLocation?: string
    qualityStatus?: string
    damageQty?: number
    rejectedQty?: number
    notes?: string
  }[]
  customsInfo?: {
    declaredValue: string
    currency: string
    commodityDescription: string
    exporterName: string
    importerName: string
    importerTaxID: string
    countryOfOrigin: string
    commercialInvoice: string[]
    packingList: string[]
    otherDocuments: string[]
  }
  remark?: string
  attachments?: string[]
  created: string
  updated: string
  createdBy: string
  updatedBy: string
}

interface TransportationLeg {
  id: string
  legNo: number
  legType: "FIRST_MILE" | "MIDDLE_MILE" | "LAST_MILE" | "SINGLE"
  mode: "FTL" | "LTL" | "EXPRESS" | "SMALL_PARCEL" | "AIR_CARGO" | "OCEAN_FCL" | "OCEAN_LCL" | "RAIL" | "INTERMODAL" | "INTERNAL" | "VIRTUAL"
  carrier: string
  serviceLevel?: string
  origin: {
    warehouse?: string
    airport?: string
    port?: string
    station?: string
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
    airport?: string
    port?: string
    station?: string
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
  plannedPickupDatetime?: string
  plannedDeliveryDatetime?: string
  actualPickupDatetime?: string
  actualDeliveryDatetime?: string
  trackingNos?: string[]
  referenceNumber?: string
  flightNo?: string
  airlineCode?: string
  mawb?: string
  hawb?: string
  vesselName?: string
  voyageNo?: string
  mbl?: string
  hbl?: string
  containerNos?: string[]
  sealNos?: string[]
  pol?: string
  pod?: string
  licensePlate?: string
  driverName?: string
  driverPhone?: string
  bolNumber?: string
  proNumber?: string
  trainNo?: string
  railCarNumber?: string
  packageType?: "BOX" | "PALLET" | "BAG" | "PARCEL" | "CONTAINER" | "OTHER"
  quantity?: string
  totalWeight?: string
  weightUnit?: "LBS" | "KG"
  totalVolume?: string
  volumeUnit?: "CUBIC_FT" | "CUBIC_M"
  palletCount?: string
  containerCount?: string
  containerType?: "20FT" | "40FT" | "40FT_HC"
}

interface ShipmentLineItem {
  id: string
  lineNo: number
  poNo?: string
  poLineNo?: number
  sku: string
  itemName: string
  specifications?: string
  shippedQty: number
  uom: string
  receivedQty?: number
}

// Mock Shipment Detail Data
const mockShipmentDetail: ShipmentDetail = {
  id: "1",
  shipmentNo: "SHIP-2024-001",
  shipmentType: "INTERNATIONAL",
  direction: "INBOUND",
  status: ShippingStatus.IN_TRANSIT,
  carrier: "Maersk",
  trackingNos: ["MA987654321", "MA987654322"],
  origin: {
    address: {
      name: "Shanghai Port",
      contactPerson: "Li Wei",
      contactPhone: "+86-21-12345678",
      contactEmail: "shanghai@port.com",
      address1: "123 Port Road",
      address2: "",
      city: "Shanghai",
      state: "",
      zipCode: "200000",
      country: "CN",
    }
  },
  destination: {
    warehouse: "Main Warehouse - Los Angeles",
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
      country: "US",
    }
  },
  plannedPickupDatetime: "2024-01-18T10:00:00Z",
  plannedDeliveryDatetime: "2024-02-15T14:00:00Z",
  actualPickupDatetime: "2024-01-18T10:30:00Z",
  transportationLegs: [
    {
      id: "leg1",
      legNo: 1,
      legType: "FIRST_MILE",
      mode: "OCEAN_FCL",
      carrier: "Maersk",
      serviceLevel: "Standard",
      origin: {
        port: "Shanghai Port",
        address: {
          name: "Shanghai Port",
          contactPerson: "Li Wei",
          contactPhone: "+86-21-12345678",
          contactEmail: "shanghai@port.com",
          address1: "123 Port Road",
          address2: "",
          city: "Shanghai",
          state: "",
          zipCode: "200000",
          country: "CN",
        }
      },
      destination: {
        port: "Los Angeles Port",
        address: {
          name: "Los Angeles Port",
          contactPerson: "Mike Johnson",
          contactPhone: "+1-555-0202",
          contactEmail: "la.port@company.com",
          address1: "456 Port Ave",
          address2: "",
          city: "Los Angeles",
          state: "CA",
          zipCode: "90001",
          country: "US",
        }
      },
      plannedPickupDatetime: "2024-01-18T10:00:00Z",
      plannedDeliveryDatetime: "2024-02-15T14:00:00Z",
      trackingNos: ["MA987654321"],
      vesselName: "Maersk Shanghai",
      voyageNo: "V001",
      mbl: "MBL-2024-001",
      hbl: "HBL-2024-001",
      containerNos: ["CONT-001", "CONT-002"],
      sealNos: ["SEAL-001", "SEAL-002"],
      pol: "Shanghai",
      pod: "Los Angeles",
      packageType: "CONTAINER",
      quantity: "2",
      containerCount: "2",
      containerType: "40FT",
      totalWeight: "25000",
      weightUnit: "KG",
      totalVolume: "120",
      volumeUnit: "CUBIC_M",
    },
    {
      id: "leg2",
      legNo: 2,
      legType: "LAST_MILE",
      mode: "FTL",
      carrier: "FedEx Freight",
      serviceLevel: "Standard",
      origin: {
        address: {
          name: "Los Angeles Port",
          contactPerson: "Mike Johnson",
          contactPhone: "+1-555-0202",
          contactEmail: "la.port@company.com",
          address1: "456 Port Ave",
          address2: "",
          city: "Los Angeles",
          state: "CA",
          zipCode: "90001",
          country: "US",
        }
      },
      destination: {
        warehouse: "Main Warehouse - Los Angeles",
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
          country: "US",
        }
      },
      plannedPickupDatetime: "2024-02-16T08:00:00Z",
      plannedDeliveryDatetime: "2024-02-16T16:00:00Z",
      trackingNos: ["FX987654321"],
      licensePlate: "CA-ABC-1234",
      driverName: "Tom Wilson",
      driverPhone: "+1-555-0303",
      bolNumber: "BOL-2024-001",
      packageType: "PALLET",
      quantity: "20",
      palletCount: "20",
      totalWeight: "25000",
      weightUnit: "KG",
      totalVolume: "120",
      volumeUnit: "CUBIC_M",
    }
  ],
  shipmentLines: [
    {
      id: "line1",
      lineNo: 1,
      poNo: "PO-2024-001",
      poLineNo: 1,
      sku: "SKU-001",
      itemName: "Product A",
      specifications: "256GB, Natural Titanium",
      shippedQty: 100,
      uom: "PCS",
      receivedQty: 0,
    },
    {
      id: "line2",
      lineNo: 2,
      poNo: "PO-2024-001",
      poLineNo: 2,
      sku: "SKU-002",
      itemName: "Product B",
      specifications: "14-inch, M3 Pro",
      shippedQty: 50,
      uom: "PCS",
      receivedQty: 0,
    },
  ],
  relatedPOs: [
    { 
      poNo: "PO-2024-001", 
      poId: "PO-001",
      status: "CONFIRMED",
      supplierName: "ABC Suppliers Inc.",
      totalAmount: 12500.00,
      currency: "USD",
      created: "2024-01-10T10:00:00Z",
      expectedArrivalDate: "2024-02-20",
    },
  ],
  relatedReceipts: [
    {
      receiptNo: "RCP-2024-001",
      receiptId: "RCP-001",
      receivedQty: 80,
      receivedDate: "2024-02-16T10:30:00Z",
      receivedBy: "John Smith",
      receiptStatus: "PARTIALLY_RECEIVED",
      warehouseName: "Main Warehouse - Los Angeles",
      warehouseLocation: "A区-01-001",
      qualityStatus: "PASSED",
      damageQty: 0,
      rejectedQty: 0,
      notes: "部分收货，剩余货物预计明日到达",
    },
  ],
  customsInfo: {
    declaredValue: "50000.00",
    currency: "USD",
    commodityDescription: "Electronic devices and accessories",
    exporterName: "ABC Trading Co., Ltd.",
    importerName: "XYZ Corporation",
    importerTaxID: "US-123456789",
    countryOfOrigin: "CN",
    commercialInvoice: ["invoice.pdf"],
    packingList: ["packing_list.pdf"],
    otherDocuments: ["certificate.pdf"],
  },
  remark: "Handle with care. Fragile items.",
  attachments: ["shipping_label.pdf", "bol.pdf"],
  created: "2024-01-15T10:30:00Z",
  updated: "2024-01-22T14:20:00Z",
  createdBy: "John Doe",
  updatedBy: "Jane Smith",
}

interface ShipmentDetailPageProps {
  params: {
    id: string
  }
}

export default function ShipmentDetailPage({ params }: ShipmentDetailPageProps) {
  const { t } = useI18n()
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState("lines")
  const [isLoading, setIsLoading] = React.useState(false)
  const [showCreateReceivingDialog, setShowCreateReceivingDialog] = React.useState(false)
  const [createReceivingQuantities, setCreateReceivingQuantities] = React.useState<Record<string, number>>({})
  const shipment = mockShipmentDetail // In real app, fetch by params.id

  const sidebarItems = createPurchaseSidebarItems(t)
  
  const handleReceivingQtyChange = (lineId: string, value: number) => {
    setCreateReceivingQuantities(prev => ({ ...prev, [lineId]: value }))
  }

  // Status configurations
  const statusConfig = {
    [ShippingStatus.SHIPPED]: { label: t('SHIPPED'), color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200" },
    [ShippingStatus.IN_TRANSIT]: { label: t('IN_TRANSIT'), color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200" },
    [ShippingStatus.ARRIVED]: { label: t('ARRIVED'), color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200" },
    [ShippingStatus.SHIPPING_EXCEPTION]: { label: t('SHIPPING_EXCEPTION'), color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200" },
  }

  const shipmentTypeConfig = {
    DOMESTIC: t('domestic'),
    INTERNATIONAL: t('international'),
  }

  const directionConfig = {
    INBOUND: t('inbound'),
    OUTBOUND: t('outbound'),
    RETURN: t('return'),
    TRANSFER: t('transfer'),
  }

  const modeConfig: Record<string, string> = {
    FTL: t('ftl'),
    LTL: t('ltl'),
    EXPRESS: t('express'),
    SMALL_PARCEL: t('smallParcel'),
    AIR_CARGO: t('airCargo'),
    OCEAN_FCL: t('oceanFCL'),
    OCEAN_LCL: t('oceanLCL'),
    RAIL: t('rail'),
    INTERMODAL: t('intermodal'),
    INTERNAL: t('internal'),
    VIRTUAL: t('virtual'),
  }

  const legTypeConfig = {
    FIRST_MILE: t('firstMile'),
    MIDDLE_MILE: t('middleMile'),
    LAST_MILE: t('lastMile'),
    SINGLE: t('singleSegment'),
  }

  // Refresh data
  const handleRefresh = React.useCallback(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  // Get available actions based on status
  const getAvailableActions = () => {
    switch (shipment.status) {
      case ShippingStatus.SHIPPED:
      case ShippingStatus.IN_TRANSIT:
        return [
          { label: t('editShipment'), icon: <Edit className="h-4 w-4" />, action: () => router.push(`/purchase/asn/${params.id}/edit`) },
          { label: t('updateTracking'), icon: <RefreshCw className="h-4 w-4" />, action: () => console.log("Update tracking") },
          { label: t('markArrived'), icon: <Package className="h-4 w-4" />, action: () => console.log("Mark arrived") },
        ]
      case ShippingStatus.ARRIVED:
        return [
          { label: t('createReceiving'), icon: <Package className="h-4 w-4" />, action: () => {
            const initialQuantities: Record<string, number> = {}
            shipment.shipmentLines.forEach(line => {
              initialQuantities[line.id] = line.shippedQty - (line.receivedQty || 0)
            })
            setCreateReceivingQuantities(initialQuantities)
            setShowCreateReceivingDialog(true)
          }},
          { label: t('download'), icon: <Download className="h-4 w-4" />, action: () => console.log("Download") },
        ]
      case ShippingStatus.SHIPPING_EXCEPTION:
        return [
          { label: t('editShipment'), icon: <Edit className="h-4 w-4" />, action: () => router.push(`/purchase/asn/${params.id}/edit`) },
          { label: t('resolveException'), icon: <AlertTriangle className="h-4 w-4" />, action: () => console.log("Resolve exception") },
        ]
      default:
        return [
          { label: t('download'), icon: <Download className="h-4 w-4" />, action: () => console.log("Download") },
        ]
    }
  }

  const availableActions = getAvailableActions()

  // Format address
  const formatAddress = (address: { address1: string; address2?: string; city: string; state: string; zipCode: string; country: string }) => {
    const parts = [
      address.address1,
      address.address2,
      `${address.city}, ${address.state} ${address.zipCode}`,
      address.country,
    ].filter(Boolean)
    return parts.join(", ")
  }

  // Calculate summary data
  const summaryData = React.useMemo(() => {
    const totalShippedQty = shipment.shipmentLines.reduce((sum, line) => sum + line.shippedQty, 0)
    const totalReceivedQty = shipment.shipmentLines.reduce((sum, line) => sum + (line.receivedQty || 0), 0)
    return {
      totalLines: shipment.shipmentLines.length,
      totalShippedQty,
      totalReceivedQty,
      receivingProgress: totalShippedQty > 0 ? (totalReceivedQty / totalShippedQty) * 100 : 0,
    }
  }, [])

  return (
    <TooltipProvider>
      <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
        <div className="space-y-4">
          {/* 简化的顶部标题栏 */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold">{shipment.shipmentNo}</h1>
                      
                      {/* 状态徽章显示 */}
                      <div className="flex items-center gap-2">
                        <Badge className={statusConfig[shipment.status].color}>
                          {statusConfig[shipment.status].label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {shipmentTypeConfig[shipment.shipmentType]}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {directionConfig[shipment.direction]}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Truck className="h-3 w-3" />
                      <span>{t('carrier')}: {shipment.carrier}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{t('created')}: {new Date(shipment.created).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 所有操作按钮都放在顶部右侧 */}
              <div className="flex gap-2">
                {/* 刷新按钮 */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRefresh}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('refresh')}</p>
                  </TooltipContent>
                </Tooltip>
                
                {/* 操作按钮 */}
                {availableActions.map((action, index) => (
                  <Button key={index} variant="outline" size="sm" onClick={action.action}>
                    {action.icon}
                    <span className="ml-2">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* 一屏展示所有关键信息 - 四个卡片一行显示 */}
          <div className="space-y-6">
            {/* 核心信息 - 4列布局 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* 运单基本信息 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    {t('basicInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* 运单编号突出显示 */}
                  <div className="bg-blue-50 p-2 rounded-lg border border-blue-200 dark:bg-blue-900/50 dark:border-blue-700">
                    <div className="text-xs text-muted-foreground mb-1">{t('shipmentNo')}</div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm font-mono text-blue-800 dark:text-blue-200">{shipment.shipmentNo}</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => navigator.clipboard.writeText(shipment.shipmentNo)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('shipmentType')}:</span>
                      <span>{shipmentTypeConfig[shipment.shipmentType]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('direction')}:</span>
                      <span>{directionConfig[shipment.direction]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('carrier')}:</span>
                      <span className="font-medium">{shipment.carrier}</span>
                    </div>
                    {shipment.trackingNos.length > 0 && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('trackingNumberList')}</div>
                        <div className="flex flex-wrap gap-1">
                          {shipment.trackingNos.map((tn, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs font-mono h-5">
                              {tn}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('created')}:</span>
                      <span className="text-xs">{new Date(shipment.created).toLocaleDateString()}</span>
                    </div>
                    {shipment.plannedDeliveryDatetime && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('plannedDeliveryDatetime')}:</span>
                        <span className="font-medium text-orange-600 text-xs">{new Date(shipment.plannedDeliveryDatetime).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {shipment.relatedPOs.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{t('relatedPOs')} ({shipment.relatedPOs.length})</div>
                      <div className="flex flex-wrap gap-1">
                        {shipment.relatedPOs.map((po) => (
                          <Badge 
                            key={po.poId} 
                            variant="outline" 
                            className="text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/50 h-5"
                            onClick={() => router.push(`/purchase/po/${po.poId}`)}
                          >
                            {po.poNo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 起运地信息 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    {t('origin')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* 起运地名称突出显示 */}
                  <div className="bg-green-50 p-2 rounded-lg border border-green-200 dark:bg-green-900/50 dark:border-green-700">
                    <div className="font-bold text-green-800 dark:text-green-200 text-sm mb-1">{shipment.origin.address.name}</div>
                    {shipment.origin.warehouse && (
                      <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {shipment.origin.warehouse}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{t('contactPerson')}</div>
                      <div className="font-medium text-sm">{shipment.origin.address.contactPerson}</div>
                    </div>

                    <div className="space-y-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start h-7 text-xs" 
                        onClick={() => window.open(`tel:${shipment.origin.address.contactPhone}`)}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        {shipment.origin.address.contactPhone}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start h-7 text-xs" 
                        onClick={() => window.open(`mailto:${shipment.origin.address.contactEmail}`)}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        {t('email')}
                      </Button>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{t('address')}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{formatAddress(shipment.origin.address)}</div>
                    </div>

                    {shipment.plannedPickupDatetime && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('plannedPickupDatetime')}</div>
                        <div className="text-xs">{new Date(shipment.plannedPickupDatetime).toLocaleString()}</div>
                      </div>
                    )}
                    {shipment.actualPickupDatetime && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('actualPickupDatetime')}</div>
                        <div className="text-xs font-medium text-green-600">{new Date(shipment.actualPickupDatetime).toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 目的地信息 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    {t('destination')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* 目的地名称突出显示 */}
                  <div className="bg-purple-50 p-2 rounded-lg border border-purple-200 dark:bg-purple-900/50 dark:border-purple-700">
                    <div className="font-bold text-purple-800 dark:text-purple-200 text-sm mb-1">{shipment.destination.address.name}</div>
                    {shipment.destination.warehouse && (
                      <div className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {shipment.destination.warehouse}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{t('contactPerson')}</div>
                      <div className="font-medium text-sm">{shipment.destination.address.contactPerson}</div>
                    </div>

                    <div className="space-y-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start h-7 text-xs" 
                        onClick={() => window.open(`tel:${shipment.destination.address.contactPhone}`)}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        {shipment.destination.address.contactPhone}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start h-7 text-xs" 
                        onClick={() => window.open(`mailto:${shipment.destination.address.contactEmail}`)}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        {t('email')}
                      </Button>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{t('address')}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{formatAddress(shipment.destination.address)}</div>
                    </div>

                    {shipment.plannedDeliveryDatetime && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('plannedDeliveryDatetime')}</div>
                        <div className="text-xs">{new Date(shipment.plannedDeliveryDatetime).toLocaleString()}</div>
                      </div>
                    )}
                    {shipment.actualDeliveryDatetime && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('actualDeliveryDatetime')}</div>
                        <div className="text-xs font-medium text-green-600">{new Date(shipment.actualDeliveryDatetime).toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 物流跟踪 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Truck className="h-4 w-4 text-indigo-600" />
                    {t('logisticsTracking')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* 物流汇总 */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-blue-50 p-2 rounded border border-blue-200 dark:bg-blue-900/50 dark:border-blue-700">
                      <div className="text-muted-foreground mb-1">{t('transportationLegs')}</div>
                      <div className="font-bold text-blue-600 dark:text-blue-400">
                        {shipment.transportationLegs.length} {t('leg')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t('totalShippedQty')}: {summaryData.totalShippedQty}
                      </div>
                    </div>
                    <div className="bg-green-50 p-2 rounded border border-green-200 dark:bg-green-900/50 dark:border-green-700">
                      <div className="text-muted-foreground mb-1">{t('shipmentLines')}</div>
                      <div className="font-bold text-green-600 dark:text-green-400">
                        {summaryData.totalLines} {t('lines')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t('receivedQty')}: {summaryData.totalReceivedQty}
                      </div>
                    </div>
                  </div>

                  {/* 最新运输段 */}
                  {shipment.transportationLegs.length > 0 && (
                    <div>
                      <div className="text-xs font-medium mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Truck className="h-3 w-3 text-blue-600" />
                          {t('latestLeg')}
                        </span>
                        {shipment.transportationLegs.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 px-2 text-xs"
                            onClick={() => setActiveTab("legs")}
                          >
                            {t('viewAll')} ({shipment.transportationLegs.length})
                          </Button>
                        )}
                      </div>
                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-200 dark:bg-blue-900/50 dark:border-blue-700">
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('carrier')}:</span>
                            <span className="font-medium">{shipment.transportationLegs[0].carrier}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('mode')}:</span>
                            <span className="font-medium">{modeConfig[shipment.transportationLegs[0].mode]}</span>
                          </div>
                          {shipment.transportationLegs[0].trackingNos && shipment.transportationLegs[0].trackingNos.length > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('trackingNo')}:</span>
                              <span className="font-mono font-medium">{shipment.transportationLegs[0].trackingNos[0]}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 关联收货单 */}
                  {shipment.relatedReceipts.length > 0 ? (
                    <div>
                      <div className="text-xs font-medium mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3 text-green-600" />
                          {t('latestReceipt')}
                        </span>
                        {shipment.relatedReceipts.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 px-2 text-xs"
                            onClick={() => setActiveTab("related")}
                          >
                            {t('viewAll')} ({shipment.relatedReceipts.length})
                          </Button>
                        )}
                      </div>
                      <div className="bg-green-50 p-2 rounded-lg border border-green-200 dark:bg-green-900/50 dark:border-green-700">
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('receiptNo')}:</span>
                            <span className="font-mono font-medium">{shipment.relatedReceipts[0].receiptNo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('receivedQty')}:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">{shipment.relatedReceipts[0].receivedQty}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-muted-foreground bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Package className="h-6 w-6 mx-auto mb-1 opacity-50" />
                      <div className="text-xs">{t('noRelatedReceipts')}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 主体内容 - 全宽布局 */}
          <div className="space-y-4">
            {/* 标签页 */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="lines">{t('shipmentLines')}</TabsTrigger>
                  <TabsTrigger value="legs">{t('transportationLegs')}</TabsTrigger>
                  <TabsTrigger value="related">{t('relatedDocuments')}</TabsTrigger>
                  <TabsTrigger value="customs">{t('customsDeclarationInfo')}</TabsTrigger>
                </TabsList>

                {/* 商品明细 */}
                <TabsContent value="lines" className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{t('shipmentLines')}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{t('totalLines')} {summaryData.totalLines} {t('lines')}</span>
                          <span>•</span>
                          <span>{t('totalShippedQty')}: {summaryData.totalShippedQty}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="w-[60px] text-center">{t('lineNo')}</TableHead>
                              <TableHead className="min-w-[200px]">{t('productInfo')}</TableHead>
                              <TableHead className="w-[120px]">{t('poNo')}</TableHead>
                              <TableHead className="w-[100px] text-center">{t('shippedQty')}</TableHead>
                              <TableHead className="w-[100px] text-center">{t('receivedQty')}</TableHead>
                              <TableHead className="w-[80px] text-center">{t('unit')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {shipment.shipmentLines.map((line) => {
                              const isReceived = (line.receivedQty || 0) > 0
                              const isFullyReceived = (line.receivedQty || 0) >= line.shippedQty
                              
                              return (
                                <TableRow key={line.id} className={isFullyReceived ? "bg-green-50/30 dark:bg-green-900/20" : ""}>
                                  <TableCell className="text-center">
                                    <Badge variant="outline" className="text-xs font-mono">
                                      {line.lineNo.toString().padStart(2, '0')}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="font-medium text-sm">{line.itemName}</div>
                                      <div className="text-xs text-muted-foreground">
                                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-mono">
                                          SKU: {line.sku}
                                        </span>
                                      </div>
                                      {line.specifications && (
                                        <div className="text-xs text-muted-foreground">{line.specifications}</div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {line.poNo ? (
                                      <Button variant="link" className="h-auto p-0 text-xs font-mono" onClick={() => router.push(`/purchase/po/${line.poNo}`)}>
                                        {line.poNo}
                                      </Button>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="font-medium">{line.shippedQty.toLocaleString()}</div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className={`font-medium ${isFullyReceived ? "text-green-600 dark:text-green-400" : isReceived ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"}`}>
                                      {(line.receivedQty || 0).toLocaleString()}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge variant="outline" className="text-xs">
                                      {line.uom}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                      
                      {/* 汇总行 */}
                      <div className="border-t bg-gray-50 dark:bg-gray-800/50 p-4 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('totalLines')}:</span>
                            <span className="font-medium">{summaryData.totalLines}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('totalShippedQty')}:</span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">{summaryData.totalShippedQty.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('receivedQty')}:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">{summaryData.totalReceivedQty.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 运输段 */}
                <TabsContent value="legs" className="mt-4 space-y-4">
                  {shipment.transportationLegs.map((leg, index) => (
                    <Card key={leg.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Truck className="h-5 w-5" />
                          {t('leg')} {leg.legNo}: {legTypeConfig[leg.legType]} - {modeConfig[leg.mode]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Segment Header */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm text-muted-foreground">{t('carrier')}</Label>
                            <div className="text-base">{leg.carrier}</div>
                          </div>
                          {leg.serviceLevel && (
                            <div>
                              <Label className="text-sm text-muted-foreground">{t('serviceLevel')}</Label>
                              <div className="text-base">{leg.serviceLevel}</div>
                            </div>
                          )}
                        </div>

                        <Separator />

                        {/* Route Info */}
                        <div>
                          <Label className="text-base font-medium mb-3 block">{t('routeInfo')}</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm text-muted-foreground">{t('origin')}</Label>
                              {leg.origin.warehouse && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Building2 className="h-4 w-4" />
                                  {leg.origin.warehouse}
                                </div>
                              )}
                              {leg.origin.port && (
                                <div className="text-sm">{t('pol')}: {leg.origin.port}</div>
                              )}
                              {leg.origin.airport && (
                                <div className="text-sm">{t('originAirport')}: {leg.origin.airport}</div>
                              )}
                              <div className="text-sm">{formatAddress(leg.origin.address)}</div>
                              {leg.plannedPickupDatetime && (
                                <div className="text-sm text-muted-foreground">
                                  {t('plannedPickupDatetime')}: {new Date(leg.plannedPickupDatetime).toLocaleString()}
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm text-muted-foreground">{t('destination')}</Label>
                              {leg.destination.warehouse && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Building2 className="h-4 w-4" />
                                  {leg.destination.warehouse}
                                </div>
                              )}
                              {leg.destination.port && (
                                <div className="text-sm">{t('pod')}: {leg.destination.port}</div>
                              )}
                              {leg.destination.airport && (
                                <div className="text-sm">{t('destinationAirport')}: {leg.destination.airport}</div>
                              )}
                              <div className="text-sm">{formatAddress(leg.destination.address)}</div>
                              {leg.plannedDeliveryDatetime && (
                                <div className="text-sm text-muted-foreground">
                                  {t('plannedDeliveryDatetime')}: {new Date(leg.plannedDeliveryDatetime).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Transport Info */}
                        <div>
                          <Label className="text-base font-medium mb-3 block">{t('transportInfo')}</Label>
                          <div className="grid grid-cols-2 gap-4">
                            {leg.trackingNos && leg.trackingNos.length > 0 && (
                              <div>
                                <Label className="text-sm text-muted-foreground">{t('trackingNumberList')}</Label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {leg.trackingNos.map((tn, idx) => (
                                    <Badge key={idx} variant="outline" className="font-mono">
                                      {tn}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {leg.referenceNumber && (
                              <div>
                                <Label className="text-sm text-muted-foreground">{t('referenceNumber')}</Label>
                                <div className="text-sm">{leg.referenceNumber}</div>
                              </div>
                            )}
                            {leg.mode === "OCEAN_FCL" && (
                              <>
                                {leg.vesselName && (
                                  <div>
                                    <Label className="text-sm text-muted-foreground">{t('vesselName')}</Label>
                                    <div className="text-sm">{leg.vesselName}</div>
                                  </div>
                                )}
                                {leg.voyageNo && (
                                  <div>
                                    <Label className="text-sm text-muted-foreground">{t('voyageNo')}</Label>
                                    <div className="text-sm">{leg.voyageNo}</div>
                                  </div>
                                )}
                                {leg.mbl && (
                                  <div>
                                    <Label className="text-sm text-muted-foreground">{t('mbl')}</Label>
                                    <div className="text-sm">{leg.mbl}</div>
                                  </div>
                                )}
                                {leg.hbl && (
                                  <div>
                                    <Label className="text-sm text-muted-foreground">{t('hbl')}</Label>
                                    <div className="text-sm">{leg.hbl}</div>
                                  </div>
                                )}
                                {leg.containerNos && leg.containerNos.length > 0 && (
                                  <div>
                                    <Label className="text-sm text-muted-foreground">{t('containerNos')}</Label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {leg.containerNos.map((cn, idx) => (
                                        <Badge key={idx} variant="outline">{cn}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                            {leg.mode === "FTL" && (
                              <>
                                {leg.licensePlate && (
                                  <div>
                                    <Label className="text-sm text-muted-foreground">{t('licensePlate')}</Label>
                                    <div className="text-sm">{leg.licensePlate}</div>
                                  </div>
                                )}
                                {leg.driverName && (
                                  <div>
                                    <Label className="text-sm text-muted-foreground">{t('driverName')}</Label>
                                    <div className="text-sm">{leg.driverName}</div>
                                  </div>
                                )}
                                {leg.driverPhone && (
                                  <div>
                                    <Label className="text-sm text-muted-foreground">{t('driverPhone')}</Label>
                                    <div className="text-sm">{leg.driverPhone}</div>
                                  </div>
                                )}
                                {leg.bolNumber && (
                                  <div>
                                    <Label className="text-sm text-muted-foreground">{t('bolNumber')}</Label>
                                    <div className="text-sm">{leg.bolNumber}</div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <Separator />

                        {/* Package Info */}
                        <div>
                          <Label className="text-base font-medium mb-3 block">{t('packageInfo')}</Label>
                          <div className="grid grid-cols-2 gap-4">
                            {leg.packageType && (
                              <div>
                                <Label className="text-sm text-muted-foreground">{t('packageType')}</Label>
                                <div className="text-sm">{leg.packageType}</div>
                              </div>
                            )}
                            {leg.quantity && (
                              <div>
                                <Label className="text-sm text-muted-foreground">{t('quantity')}</Label>
                                <div className="text-sm">{leg.quantity}</div>
                              </div>
                            )}
                            {leg.totalWeight && (
                              <div>
                                <Label className="text-sm text-muted-foreground">{t('weight')}</Label>
                                <div className="text-sm">{leg.totalWeight} {leg.weightUnit}</div>
                              </div>
                            )}
                            {leg.totalVolume && (
                              <div>
                                <Label className="text-sm text-muted-foreground">{t('volume')}</Label>
                                <div className="text-sm">{leg.totalVolume} {leg.volumeUnit}</div>
                              </div>
                            )}
                            {leg.palletCount && (
                              <div>
                                <Label className="text-sm text-muted-foreground">{t('palletCount')}</Label>
                                <div className="text-sm">{leg.palletCount}</div>
                              </div>
                            )}
                            {leg.containerCount && (
                              <div>
                                <Label className="text-sm text-muted-foreground">{t('containerCount')}</Label>
                                <div className="text-sm">{leg.containerCount}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* 关联单据 */}
                <TabsContent value="related" className="mt-4 space-y-4">
                  {/* 关联PO */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t('relatedPOs')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {shipment.relatedPOs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p>{t('noRelatedPOs')}</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead>{t('poNo')}</TableHead>
                                <TableHead>{t('status')}</TableHead>
                                <TableHead>{t('supplierName')}</TableHead>
                                <TableHead className="text-right">{t('totalAmount')}</TableHead>
                                <TableHead>{t('created')}</TableHead>
                                <TableHead>{t('expectedArrivalDate')}</TableHead>
                                <TableHead className="w-[80px]">{t('actions')}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {shipment.relatedPOs.map((po) => {
                                const poStatusConfig: Record<string, { label: string; color: string }> = {
                                  DRAFT: { label: t('DRAFT'), color: "bg-gray-100 text-gray-800" },
                                  CREATED: { label: t('CREATED'), color: "bg-blue-100 text-blue-800" },
                                  CONFIRMED: { label: t('CONFIRMED'), color: "bg-green-100 text-green-800" },
                                  PARTIALLY_RECEIVED: { label: t('PARTIALLY_RECEIVED'), color: "bg-orange-100 text-orange-800" },
                                  CLOSED: { label: t('CLOSED'), color: "bg-teal-100 text-teal-800" },
                                }
                                const status = poStatusConfig[po.status] || poStatusConfig.DRAFT
                                
                                return (
                                  <TableRow key={po.poId}>
                                    <TableCell className="font-medium">
                                      <Button variant="link" className="h-auto p-0 font-medium" onClick={() => router.push(`/purchase/po/${po.poId}`)}>
                                        {po.poNo}
                                      </Button>
                                    </TableCell>
                                    <TableCell>
                                      <Badge className={status.color}>
                                        {status.label}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{po.supplierName}</TableCell>
                                    <TableCell className="text-right font-mono">
                                      {po.currency} {po.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </TableCell>
                                    <TableCell>{new Date(po.created).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                      {po.expectedArrivalDate ? (
                                        <span className="font-medium text-orange-600">{po.expectedArrivalDate}</span>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Button variant="ghost" size="sm" onClick={() => router.push(`/purchase/po/${po.poId}`)}>
                                        <ExternalLink className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 关联收货单 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t('relatedReceiptNos')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {shipment.relatedReceipts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p>{t('noRelatedReceipts')}</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead>{t('receiptNo')}</TableHead>
                                <TableHead className="text-center">{t('receivedQty')}</TableHead>
                                <TableHead>{t('receivedBy')}</TableHead>
                                <TableHead>{t('receivedDate')}</TableHead>
                                <TableHead>{t('status')}</TableHead>
                                <TableHead>{t('warehouse')}</TableHead>
                                <TableHead>{t('warehouseLocation')}</TableHead>
                                <TableHead>{t('qualityStatus')}</TableHead>
                                <TableHead className="text-center">{t('damageQty')}</TableHead>
                                <TableHead className="text-center">{t('rejectedQty')}</TableHead>
                                <TableHead className="w-[80px]">{t('actions')}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {shipment.relatedReceipts.map((receipt) => {
                                const receiptStatusConfig: Record<string, { label: string; color: string }> = {
                                  PENDING: { label: t('PENDING'), color: "bg-gray-100 text-gray-800" },
                                  IN_RECEIVING: { label: t('IN_RECEIVING'), color: "bg-blue-100 text-blue-800" },
                                  PARTIALLY_RECEIVED: { label: t('PARTIALLY_RECEIVED'), color: "bg-orange-100 text-orange-800" },
                                  CLOSED: { label: t('CLOSED'), color: "bg-green-100 text-green-800" },
                                  PARTIAL_DAMAGE: { label: t('PARTIAL_DAMAGE'), color: "bg-yellow-100 text-yellow-800" },
                                }
                                const qualityStatusConfig: Record<string, { label: string; color: string }> = {
                                  PENDING: { label: t('PENDING'), color: "bg-gray-100 text-gray-800" },
                                  PASSED: { label: t('PASSED'), color: "bg-green-100 text-green-800" },
                                  FAILED: { label: t('FAILED'), color: "bg-red-100 text-red-800" },
                                  PARTIAL_DAMAGE: { label: t('PARTIAL_DAMAGE'), color: "bg-yellow-100 text-yellow-800" },
                                }
                                const receiptStatus = receiptStatusConfig[receipt.receiptStatus] || receiptStatusConfig.PENDING
                                const qualityStatus = receipt.qualityStatus ? (qualityStatusConfig[receipt.qualityStatus] || qualityStatusConfig.PENDING) : null
                                
                                return (
                                  <TableRow key={receipt.receiptId}>
                                    <TableCell className="font-medium font-mono">{receipt.receiptNo}</TableCell>
                                    <TableCell className="text-center font-medium text-green-600 dark:text-green-400">
                                      {receipt.receivedQty.toLocaleString()}
                                    </TableCell>
                                    <TableCell>{receipt.receivedBy}</TableCell>
                                    <TableCell>{new Date(receipt.receivedDate).toLocaleString()}</TableCell>
                                    <TableCell>
                                      <Badge className={receiptStatus.color}>
                                        {receiptStatus.label}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{receipt.warehouseName || "-"}</TableCell>
                                    <TableCell className="font-mono text-sm">{receipt.warehouseLocation || "-"}</TableCell>
                                    <TableCell>
                                      {qualityStatus ? (
                                        <Badge className={qualityStatus.color}>
                                          {qualityStatus.label}
                                        </Badge>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </TableCell>
                                    <TableCell className={`text-center ${receipt.damageQty && receipt.damageQty > 0 ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                                      {receipt.damageQty || 0}
                                    </TableCell>
                                    <TableCell className={`text-center ${receipt.rejectedQty && receipt.rejectedQty > 0 ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                                      {receipt.rejectedQty || 0}
                                    </TableCell>
                                    <TableCell>
                                      <Button variant="ghost" size="sm">
                                        <ExternalLink className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 报关信息 */}
                <TabsContent value="customs" className="mt-4">
                  {shipment.shipmentType === "INTERNATIONAL" && shipment.customsInfo ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('customsDeclarationInfo')}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Basic Trade Info */}
                        <div>
                          <Label className="text-base font-medium mb-3 block">{t('basicTradeInfo')}</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm text-muted-foreground">{t('declaredValue')}</Label>
                              <div className="text-base">{shipment.customsInfo.declaredValue} {shipment.customsInfo.currency}</div>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">{t('commodityDescription')}</Label>
                              <div className="text-base">{shipment.customsInfo.commodityDescription}</div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Parties */}
                        <div>
                          <Label className="text-base font-medium mb-3 block">{t('parties')}</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm text-muted-foreground">{t('exporterName')}</Label>
                              <div className="text-base">{shipment.customsInfo.exporterName}</div>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">{t('importerName')}</Label>
                              <div className="text-base">{shipment.customsInfo.importerName}</div>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">{t('importerTaxID')}</Label>
                              <div className="text-base">{shipment.customsInfo.importerTaxID}</div>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">{t('countryOfOrigin')}</Label>
                              <div className="text-base">{shipment.customsInfo.countryOfOrigin}</div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Documents */}
                        <div>
                          <Label className="text-base font-medium mb-3 block">{t('documents')}</Label>
                          <div className="space-y-3">
                            {shipment.customsInfo.commercialInvoice.length > 0 && (
                              <div>
                                <Label className="text-sm text-muted-foreground">{t('commercialInvoice')}</Label>
                                <div className="mt-2 space-y-1">
                                  {shipment.customsInfo.commercialInvoice.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                                      <FileText className="h-4 w-4" />
                                      <span className="text-sm">{file}</span>
                                      <Button variant="ghost" size="sm">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {shipment.customsInfo.packingList.length > 0 && (
                              <div>
                                <Label className="text-sm text-muted-foreground">{t('packingList')}</Label>
                                <div className="mt-2 space-y-1">
                                  {shipment.customsInfo.packingList.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                                      <FileText className="h-4 w-4" />
                                      <span className="text-sm">{file}</span>
                                      <Button variant="ghost" size="sm">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {shipment.customsInfo.otherDocuments.length > 0 && (
                              <div>
                                <Label className="text-sm text-muted-foreground">{t('otherDocuments')}</Label>
                                <div className="mt-2 space-y-1">
                                  {shipment.customsInfo.otherDocuments.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                                      <FileText className="h-4 w-4" />
                                      <span className="text-sm">{file}</span>
                                      <Button variant="ghost" size="sm">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        {t('notApplicable')}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Create Receiving Dialog */}
        <Dialog open={showCreateReceivingDialog} onOpenChange={setShowCreateReceivingDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('createReceiving')}</DialogTitle>
              <DialogDescription>
                {t('createReceiving')} {t('shipmentNo')}: {shipment.shipmentNo}
                <br />
                <span className="text-sm text-muted-foreground">{t('createReceivingDesc')}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Receiving Quantities Table */}
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
                    {shipment.shipmentLines.map((line) => {
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
                              <div className="text-xs text-muted-foreground">
                                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-mono">
                                  SKU: {line.sku}
                                </span>
                              </div>
                              {line.specifications && (
                                <div className="text-xs text-muted-foreground">{line.specifications}</div>
                              )}
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
                  shipmentId: shipment.id,
                  quantities: createReceivingQuantities,
                  status: "CLOSED" // 创建即收货完成
                })
                setShowCreateReceivingDialog(false)
                setCreateReceivingQuantities({})
                // In real app, refresh the page or update shipment data
                handleRefresh()
              }}>{t('createAndComplete')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </MainLayout>
    </TooltipProvider>
  )
}
