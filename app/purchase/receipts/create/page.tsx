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
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Plus, X, Package, Upload, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useI18n } from "@/components/i18n-provider"
import { createPurchaseSidebarItems } from "@/lib/purchase-sidebar-items"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProductSelectionDialog } from "@/components/purchase/product-selection-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Combobox, ComboboxOption } from "@/components/ui/combobox"

// PO Info Interface
interface POInfo {
  id: string
  poNo: string
  status: string
  vendor: string
  orderedQty: number
  receivedQty: number
  remainingQty: number
  lines: POLineInfo[]
  shippingAddress?: {
    contactPerson: string
    contactPhone: string
    contactEmail: string
    address: string
  }
  receivingAddress?: {
    contactPerson: string
    contactPhone: string
    contactEmail: string
    address: string
  }
}

interface POLineInfo {
  id: string
  lineNo: number
  sku: string
  itemName: string
  orderedQty: number
  receivedQty: number
  remainingQty: number
  uom: string
}

// Shipment Info Interface
interface ShipmentInfo {
  id: string
  shipmentNo: string
  carrier: string
  trackingNumber: string
  eta?: string
  shippedDate?: string
  isArrived: boolean
  // 国际运输扩展字段
  mawb?: string
  hawb?: string
  mbl?: string
  hbl?: string
  vesselName?: string
  voyageNo?: string
  pol?: string
  pod?: string
  containerNos?: string
}

// Receipt Line Item Interface
interface ReceiptLineItem {
  id: string
  poNo?: string
  poLineNo?: number
  itemId?: string
  sku: string
  itemName: string
  orderedQty: number
  receivedQty: number // 已收货数量（不可编辑）
  thisReceiptQty: number // 本次收货数量（不可编辑，显示用）
  palletCount?: number // 托盘数量（可编辑）
  receivedUOM: string
  location?: string
  batchNo?: string
  serialNo?: string
  lineRemark?: string
}

// Mock PO Data
const mockPOs: POInfo[] = [
  {
    id: "PO-001",
    poNo: "PO-2024-001",
    status: "CONFIRMED",
    vendor: "ABC Suppliers Inc.",
    orderedQty: 150,
    receivedQty: 50,
    remainingQty: 100,
    shippingAddress: {
      contactPerson: "John Supplier",
      contactPhone: "+1-555-0101",
      contactEmail: "john@abcsuppliers.com",
      address: "123 Supplier St, Los Angeles, CA 90001",
    },
    receivingAddress: {
      contactPerson: "Jane Receiver",
      contactPhone: "+1-555-0202",
      contactEmail: "jane@warehouse.com",
      address: "456 Warehouse Ave, Los Angeles, CA 90002",
    },
    lines: [
      { id: "line1", lineNo: 1, sku: "SKU-001", itemName: "Product A", orderedQty: 100, receivedQty: 30, remainingQty: 70, uom: "PCS" },
      { id: "line2", lineNo: 2, sku: "SKU-002", itemName: "Product B", orderedQty: 50, receivedQty: 20, remainingQty: 30, uom: "PCS" },
    ],
  },
  {
    id: "PO-002",
    poNo: "PO-2024-002",
    status: "CONFIRMED",
    vendor: "Global Trading Co.",
    orderedQty: 200,
    receivedQty: 0,
    remainingQty: 200,
    shippingAddress: {
      contactPerson: "Mike Supplier",
      contactPhone: "+1-555-0303",
      contactEmail: "mike@globaltrading.com",
      address: "789 Trading Blvd, New York, NY 10001",
    },
    receivingAddress: {
      contactPerson: "Sarah Receiver",
      contactPhone: "+1-555-0404",
      contactEmail: "sarah@warehouse.com",
      address: "321 Distribution Dr, New York, NY 10002",
    },
    lines: [
      { id: "line3", lineNo: 1, sku: "SKU-003", itemName: "Product C", orderedQty: 200, receivedQty: 0, remainingQty: 200, uom: "PCS" },
    ],
  },
]

// Mock Shipments
const mockShipments: ShipmentInfo[] = [
  { id: "SHIP-001", shipmentNo: "SHIP-2024-001", carrier: "FedEx", trackingNumber: "FX123456789", eta: "2024-01-20", shippedDate: "2024-01-18", isArrived: false },
  { id: "SHIP-002", shipmentNo: "SHIP-2024-002", carrier: "UPS", trackingNumber: "UPS987654321", eta: "2024-01-22", shippedDate: "2024-01-19", isArrived: false },
]

// Mock Warehouses
const mockWarehouses = [
  { id: "WH001", name: "Main Warehouse - Los Angeles", type: "LOCAL_WAREHOUSE" },
  { id: "WH002", name: "East Distribution Center - New York", type: "THIRD_PARTY" },
  { id: "WH003", name: "West Fulfillment Center - Seattle", type: "LOCAL_WAREHOUSE" },
  { id: "WH004", name: "Central Warehouse - Chicago", type: "THIRD_PARTY" },
]

export default function CreateReceiptPage() {
  const { t } = useI18n()
  const router = useRouter()
  const sidebarItems = createPurchaseSidebarItems(t)

  // 区块①：收货基础信息
  const [receiptNo, setReceiptNo] = React.useState("") // 系统生成
  const [receiptType, setReceiptType] = React.useState<"REGULAR" | "TRANSLOAD" | "RETURN_FROM_END_USER" | "INVENTORY_RECEIPT" | "CUSTOMER_TRANSFER">("REGULAR")
  const [title, setTitle] = React.useState("") // 货主（下拉+自定义输入）
  const [titleInputValue, setTitleInputValue] = React.useState("") // 自定义输入的title
  const [warehouse, setWarehouse] = React.useState("")
  const [autoReceiving, setAutoReceiving] = React.useState<"YES" | "NO">("NO")
  const [relatedNo, setRelatedNo] = React.useState("") // 关联单号
  
  const [remark, setRemark] = React.useState("")
  
  // PO Line选择对话框
  const [showPOLineDialog, setShowPOLineDialog] = React.useState(false)
  const [selectedPOLineIds, setSelectedPOLineIds] = React.useState<string[]>([]) // 对话框中选中的PO Line IDs
  
  // 供应商信息
  const [supplier, setSupplier] = React.useState("") // 供应商名称
  const [selectedPOs, setSelectedPOs] = React.useState<POInfo[]>([]) // 选中的多个PO
  const [poNo, setPONo] = React.useState("") // 当前输入的采购单号（用于选择）
  
  // 运输信息
  const [transportMode, setTransportMode] = React.useState<"FTL" | "LTL" | "EXPRESS" | "SMALL_PARCEL" | "AIR_CARGO" | "OCEAN_FCL" | "OCEAN_LCL" | "RAIL" | "INTERMODAL" | "INTERNAL" | "VIRTUAL" | "">("")
  const [appointmentTime, setAppointmentTime] = React.useState("") // 预约时间
  const [inYardTime, setInYardTime] = React.useState("") // 进场时间
  // 运输方式相关字段
  const [carrier, setCarrier] = React.useState("")
  const [trackingNumber, setTrackingNumber] = React.useState("")
  const [trailerNo, setTrailerNo] = React.useState("")
  const [trailerSize, setTrailerSize] = React.useState("")
  const [sealNo, setSealNo] = React.useState("")
  const [containerNo, setContainerNo] = React.useState("")
  const [containerSize, setContainerSize] = React.useState("")
  const [bol, setBol] = React.useState("")
  const [mawb, setMawb] = React.useState("")
  const [hawb, setHawb] = React.useState("")
  const [mbl, setMbl] = React.useState("")
  const [hbl, setHbl] = React.useState("")
  const [vessel, setVessel] = React.useState("")
  const [voyage, setVoyage] = React.useState("")
  const [flightNo, setFlightNo] = React.useState("")
  const [airlineCode, setAirlineCode] = React.useState("")
  
  const [attachments, setAttachments] = React.useState<File[]>([])

  // PO Line选择对话框
  const [dialogSelectedPO, setDialogSelectedPO] = React.useState<POInfo | null>(null) // 对话框中当前选择的PO

  // 区块④：收货明细
  const [receiptLines, setReceiptLines] = React.useState<ReceiptLineItem[]>([])
  const [showProductDialog, setShowProductDialog] = React.useState(false)

  // 获取仓库类型
  const selectedWarehouse = mockWarehouses.find(w => w.id === warehouse)
  const isLocalWarehouse = selectedWarehouse?.type === "LOCAL_WAREHOUSE"
  const isThirdPartyWarehouse = selectedWarehouse?.type === "THIRD_PARTY"

  // 生成Receipt No
  React.useEffect(() => {
    if (warehouse) {
      setReceiptNo(`RCP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`)
    }
  }, [warehouse])


  // 处理PO选择（从下拉或手动输入）
  const handlePOChange = (value: string) => {
    setPONo(value)
    // 如果是从下拉选择的PO
    const po = mockPOs.find(p => p.poNo === value || p.id === value)
    if (po) {
      // 检查是否已经添加过这个PO
      if (!selectedPOs.find(p => p.id === po.id)) {
        setSelectedPOs(prev => [...prev, po])
        if (!supplier) {
          setSupplier(po.vendor)
        }
      }
      // 设置当前PO用于打开对话框
      setDialogSelectedPO(po)
    } else {
      // 手动输入的PO No，清空当前选择
      setDialogSelectedPO(null)
    }
  }

  // 移除PO
  const handleRemovePO = (poId: string) => {
    setSelectedPOs(prev => prev.filter(p => p.id !== poId))
    setReceiptLines(prev => prev.filter(line => {
      const po = mockPOs.find(p => p.id === poId)
      return po ? line.poNo !== po.poNo : true
    }))
  }
  
  // 处理Title选择或自定义输入
  const handleTitleChange = (value: string) => {
    setTitle(value)
    setTitleInputValue(value)
  }
  
  // Mock Titles
  const mockTitles: ComboboxOption[] = [
    { value: "ABC Company", label: "ABC Company" },
    { value: "XYZ Corporation", label: "XYZ Corporation" },
    { value: "Global Trading Co.", label: "Global Trading Co." },
  ]
  
  // PO Options for Combobox
  const poOptions: ComboboxOption[] = mockPOs.map(po => ({
    value: po.poNo,
    label: `${po.poNo} - ${po.vendor}`,
  }))
  
  // 根据运输方式显示相关字段
  const getTransportFields = () => {
    switch (transportMode) {
      case "FTL":
        return (
          <>
            <div className="space-y-2">
              <Label>{t('carrier')}</Label>
              <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder={t('enterCarrier')} />
            </div>
            <div className="space-y-2">
              <Label>{t('licensePlate')}</Label>
              <Input value={trailerNo} onChange={(e) => setTrailerNo(e.target.value)} placeholder={t('enterLicensePlate')} />
            </div>
            <div className="space-y-2">
              <Label>{t('driverName')}</Label>
              <Input value={flightNo} onChange={(e) => setFlightNo(e.target.value)} placeholder={t('enterDriverName')} />
            </div>
            <div className="space-y-2">
              <Label>{t('driverPhone')}</Label>
              <Input value={airlineCode} onChange={(e) => setAirlineCode(e.target.value)} placeholder={t('enterDriverPhone')} />
            </div>
            <div className="space-y-2">
              <Label>{t('bol')}</Label>
              <Input value={bol} onChange={(e) => setBol(e.target.value)} placeholder={t('enterBOL')} />
            </div>
            <div className="space-y-2">
              <Label>{t('trailerNo')}</Label>
              <Input value={trailerNo} onChange={(e) => setTrailerNo(e.target.value)} placeholder={t('enterTrailerNo')} />
            </div>
            <div className="space-y-2">
              <Label>{t('trailerSize')}</Label>
              <Input value={trailerSize} onChange={(e) => setTrailerSize(e.target.value)} placeholder={t('enterTrailerSize')} />
            </div>
            <div className="space-y-2">
              <Label>{t('sealNo')}</Label>
              <Input value={sealNo} onChange={(e) => setSealNo(e.target.value)} placeholder={t('enterSealNo')} />
            </div>
          </>
        )
      case "LTL":
        return (
          <>
            <div className="space-y-2">
              <Label>{t('carrier')}</Label>
              <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder={t('enterCarrier')} />
            </div>
            <div className="space-y-2">
              <Label>{t('proNumber')}</Label>
              <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder={t('enterProNumber')} />
            </div>
            <div className="space-y-2">
              <Label>{t('bol')}</Label>
              <Input value={bol} onChange={(e) => setBol(e.target.value)} placeholder={t('enterBOL')} />
            </div>
          </>
        )
      case "AIR_CARGO":
        return (
          <>
            <div className="space-y-2">
              <Label>{t('carrier')}</Label>
              <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder={t('enterCarrier')} />
            </div>
            <div className="space-y-2">
              <Label>MAWB</Label>
              <Input value={mawb} onChange={(e) => setMawb(e.target.value)} placeholder="Enter MAWB" />
            </div>
            <div className="space-y-2">
              <Label>HAWB</Label>
              <Input value={hawb} onChange={(e) => setHawb(e.target.value)} placeholder="Enter HAWB" />
            </div>
            <div className="space-y-2">
              <Label>{t('flightNo')}</Label>
              <Input value={flightNo} onChange={(e) => setFlightNo(e.target.value)} placeholder={t('enterFlightNo')} />
            </div>
            <div className="space-y-2">
              <Label>{t('airlineCode')}</Label>
              <Input value={airlineCode} onChange={(e) => setAirlineCode(e.target.value)} placeholder={t('enterAirlineCode')} />
            </div>
            <div className="space-y-2">
              <Label>{t('trackingNo')}</Label>
              <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder={t('enterTrackingNo')} />
            </div>
          </>
        )
      case "OCEAN_FCL":
        return (
          <>
            <div className="space-y-2">
              <Label>{t('carrier')}</Label>
              <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder={t('enterCarrier')} />
            </div>
            <div className="space-y-2">
              <Label>MBL</Label>
              <Input value={mbl} onChange={(e) => setMbl(e.target.value)} placeholder="Enter MBL" />
            </div>
            <div className="space-y-2">
              <Label>HBL</Label>
              <Input value={hbl} onChange={(e) => setHbl(e.target.value)} placeholder="Enter HBL" />
            </div>
            <div className="space-y-2">
              <Label>{t('vessel')}</Label>
              <Input value={vessel} onChange={(e) => setVessel(e.target.value)} placeholder={t('enterVessel')} />
            </div>
            <div className="space-y-2">
              <Label>{t('voyage')}</Label>
              <Input value={voyage} onChange={(e) => setVoyage(e.target.value)} placeholder={t('enterVoyage')} />
            </div>
            <div className="space-y-2">
              <Label>{t('containerNo')}</Label>
              <Input value={containerNo} onChange={(e) => setContainerNo(e.target.value)} placeholder={t('enterContainerNo')} />
            </div>
            <div className="space-y-2">
              <Label>{t('containerSize')}</Label>
              <Input value={containerSize} onChange={(e) => setContainerSize(e.target.value)} placeholder={t('enterContainerSize')} />
            </div>
            <div className="space-y-2">
              <Label>{t('sealNo')}</Label>
              <Input value={sealNo} onChange={(e) => setSealNo(e.target.value)} placeholder={t('enterSealNo')} />
            </div>
          </>
        )
      case "OCEAN_LCL":
        return (
          <>
            <div className="space-y-2">
              <Label>{t('carrier')}</Label>
              <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder={t('enterCarrier')} />
            </div>
            <div className="space-y-2">
              <Label>HBL</Label>
              <Input value={hbl} onChange={(e) => setHbl(e.target.value)} placeholder="Enter HBL" />
            </div>
            <div className="space-y-2">
              <Label>{t('consolidationWarehouse')}</Label>
              <Input value={vessel} onChange={(e) => setVessel(e.target.value)} placeholder={t('enterConsolidationWarehouse')} />
            </div>
          </>
        )
      case "RAIL":
        return (
          <>
            <div className="space-y-2">
              <Label>{t('carrier')}</Label>
              <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder={t('enterCarrier')} />
            </div>
            <div className="space-y-2">
              <Label>{t('trainNo')}</Label>
              <Input value={flightNo} onChange={(e) => setFlightNo(e.target.value)} placeholder={t('enterTrainNo')} />
            </div>
            <div className="space-y-2">
              <Label>{t('railCarNumber')}</Label>
              <Input value={trailerNo} onChange={(e) => setTrailerNo(e.target.value)} placeholder={t('enterRailCarNumber')} />
            </div>
            <div className="space-y-2">
              <Label>{t('operator')}</Label>
              <Input value={airlineCode} onChange={(e) => setAirlineCode(e.target.value)} placeholder={t('enterOperator')} />
            </div>
          </>
        )
      case "EXPRESS":
      case "SMALL_PARCEL":
        return (
          <>
            <div className="space-y-2">
              <Label>{t('carrier')}</Label>
              <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder={t('enterCarrier')} />
            </div>
            <div className="space-y-2">
              <Label>{t('trackingNo')}</Label>
              <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder={t('enterTrackingNo')} />
            </div>
          </>
        )
      case "INTERMODAL":
        return (
          <>
            <div className="space-y-2">
              <Label>{t('carrier')}</Label>
              <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder={t('enterCarrier')} />
            </div>
            <div className="space-y-2">
              <Label>{t('trackingNo')}</Label>
              <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder={t('enterTrackingNo')} />
            </div>
            <div className="space-y-2">
              <Label>{t('containerNo')}</Label>
              <Input value={containerNo} onChange={(e) => setContainerNo(e.target.value)} placeholder={t('enterContainerNo')} />
            </div>
          </>
        )
      case "INTERNAL":
      case "VIRTUAL":
        return (
          <>
            <div className="space-y-2">
              <Label>{t('internalShipmentNo')}</Label>
              <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder={t('enterInternalShipmentNo')} />
            </div>
          </>
        )
      default:
        return null
    }
  }

  // 打开PO Line选择对话框
  const handleOpenPOLineDialog = (po?: POInfo) => {
    const poToUse = po || dialogSelectedPO
    if (!poToUse) {
      alert(t('pleaseSelectPOFirst'))
      return
    }
    setDialogSelectedPO(poToUse)
    // 初始化已选中的lines（已经在receiptLines中的）
    const existingLineIds = receiptLines
      .filter(line => line.poNo === poToUse.poNo)
      .map(line => poToUse.lines.find(l => l.lineNo === line.poLineNo)?.id)
      .filter(Boolean) as string[]
    setSelectedPOLineIds(existingLineIds)
    setShowPOLineDialog(true)
  }

  // 处理PO Line对话框中的选择
  const handlePOLineDialogSelect = (lineId: string, checked: boolean) => {
    setSelectedPOLineIds(prev => {
      if (checked) {
        return [...prev, lineId]
      } else {
        return prev.filter(id => id !== lineId)
      }
    })
  }

  // 确认PO Line选择，添加到收货明细
  const handleConfirmPOLineSelection = () => {
    if (!dialogSelectedPO) return

    // 获取选中的lines
    const selectedLines = dialogSelectedPO.lines.filter(line => selectedPOLineIds.includes(line.id))
    
    // 添加到收货明细
    const newLines: ReceiptLineItem[] = selectedLines.map(line => ({
      id: `line-${dialogSelectedPO.poNo}-${line.lineNo}-${Date.now()}`,
      poNo: dialogSelectedPO.poNo,
      poLineNo: line.lineNo,
      sku: line.sku,
      itemName: line.itemName,
      orderedQty: line.orderedQty,
      receivedQty: 0, // 新建收货单，已收货数量为0
      thisReceiptQty: 0, // 新建收货单，本次收货数量为0（由仓库填写）
      palletCount: 0,
      receivedUOM: line.uom,
    }))

    // 合并到现有lines，如果已存在则更新，否则添加
    setReceiptLines(prev => {
      const updated = [...prev]
      newLines.forEach(newLine => {
        const existingIndex = updated.findIndex(
          rl => rl.poNo === newLine.poNo && rl.poLineNo === newLine.poLineNo
        )
        if (existingIndex >= 0) {
          // 更新已存在的line（保留已收货数量和本次收货数量，只更新其他字段）
          updated[existingIndex] = { 
            ...updated[existingIndex], 
            orderedQty: newLine.orderedQty,
            receivedUOM: newLine.receivedUOM,
          }
        } else {
          // 添加新line
          updated.push(newLine)
        }
      })
      // 移除未选中的lines
      return updated.filter(rl => {
        if (rl.poNo !== dialogSelectedPO.poNo) return true
        return selectedPOLineIds.includes(
          dialogSelectedPO.lines.find(l => l.lineNo === rl.poLineNo)?.id || ""
        )
      })
    })

    setShowPOLineDialog(false)
  }


  // 处理运单选择（从下拉或手动输入）
  const handleShipmentChange = (value: string) => {
    setShipmentNo(value)
    // 如果是从下拉选择的运单
    const shipment = mockShipments.find(s => s.shipmentNo === value)
    if (shipment) {
      setSelectedShipment(shipment)
      setTrackingNumber(shipment.trackingNumber || "")
      setEta(shipment.eta || "")
      setShippedDate(shipment.shippedDate || "")
      setIsArrived(shipment.isArrived || false)
      setMbl(shipment.mbl || "")
      setHbl(shipment.hbl || "")
      setPol(shipment.pol || "")
      setPod(shipment.pod || "")
      // 如果基础信息中的字段为空，则填充
      if (!carrier && shipment.carrier) setCarrier(shipment.carrier)
      if (!mawb && shipment.mawb) setMawb(shipment.mawb)
      if (!hawb && shipment.hawb) setHawb(shipment.hawb)
      if (!vessel && shipment.vesselName) setVessel(shipment.vesselName)
      if (!voyage && shipment.voyageNo) setVoyage(shipment.voyageNo)
    } else {
      // 手动输入的Shipment No，清空选中状态
      setSelectedShipment(null)
      // 保留用户手动输入的其他字段
    }
  }

  // 处理订购数量变化
  const handleOrderedQtyChange = (lineId: string, value: number) => {
    setReceiptLines(prev => prev.map(line => {
      if (line.id === lineId) {
        return { ...line, orderedQty: Math.max(0, value) }
      }
      return line
    }))
  }

  // 处理托盘数量变化
  const handlePalletCountChange = (lineId: string, value: number) => {
    setReceiptLines(prev => prev.map(line => {
      if (line.id === lineId) {
        return { ...line, palletCount: Math.max(0, value) }
      }
      return line
    }))
  }

  // 处理库位变化
  const handleLocationChange = (lineId: string, value: string) => {
    setReceiptLines(prev => prev.map(line => {
      if (line.id === lineId) {
        return { ...line, location: value }
      }
      return line
    }))
  }

  // 处理批次号变化
  const handleBatchNoChange = (lineId: string, value: string) => {
    setReceiptLines(prev => prev.map(line => {
      if (line.id === lineId) {
        return { ...line, batchNo: value }
      }
      return line
    }))
  }

  // 处理序列号变化
  const handleSerialNoChange = (lineId: string, value: string) => {
    setReceiptLines(prev => prev.map(line => {
      if (line.id === lineId) {
        return { ...line, serialNo: value }
      }
      return line
    }))
  }

  // 处理备注变化
  const handleLineRemarkChange = (lineId: string, value: string) => {
    setReceiptLines(prev => prev.map(line => {
      if (line.id === lineId) {
        return { ...line, lineRemark: value }
      }
      return line
    }))
  }

  // 添加商品行（从产品选择对话框）
  const handleProductsSelected = (products: any[]) => {
    const newLines: ReceiptLineItem[] = products.map(product => ({
      id: `line-manual-${Date.now()}-${product.id}`,
      sku: product.sku,
      itemName: product.productName,
      orderedQty: 1,
      receivedQty: 0,
      thisReceiptQty: 1,
      palletCount: 0,
      receivedUOM: product.uom,
    }))
    setReceiptLines(prev => [...prev, ...newLines])
    setShowProductDialog(false)
  }

  // 删除收货明细行
  const handleRemoveLine = (lineId: string) => {
    setReceiptLines(prev => prev.filter(line => line.id !== lineId))
  }

  // 处理附件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachments(prev => [...prev, ...newFiles])
    }
  }

  // 删除附件
  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  // 表单验证
  const isFormValid = () => {
    if (!warehouse) return false
    if (receiptLines.length === 0) return false
    // 检查是否有至少一条明细行的订购数量大于0
    if (receiptLines.every(line => line.orderedQty <= 0)) return false
    // 如果启用自动收货，需要填写库位
    if (autoReceiving === "YES" && receiptLines.some(line => !line.location)) return false
    return true
  }

  // 保存
  const handleSave = () => {
    if (!isFormValid()) {
      alert(t('pleaseFillRequiredFields'))
      return
    }

    const receiptData = {
      receiptNo,
      receiptType,
      title: titleInputValue || title,
      warehouse,
      autoReceiving,
      relatedNo,
      remark,
      supplier,
      poNo,
      transportMode,
      appointmentTime,
      inYardTime,
      carrier,
      trackingNumber,
      trailerNo,
      trailerSize,
      sealNo,
      containerNo,
      containerSize,
      bol,
      mawb,
      hawb,
      mbl,
      hbl,
      vessel,
      voyage,
      flightNo,
      airlineCode,
      attachments: attachments.map(f => f.name),
      receiptLines,
    }

    console.log("Create Receipt:", receiptData)
    router.push("/purchase/receipts")
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
              <h1 className="text-3xl font-bold tracking-tight">{t('createNewReceipt')}</h1>
              <p className="text-muted-foreground">{t('createReceiptDescription')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSave} disabled={!isFormValid()}>
              <Save className="mr-2 h-4 w-4" />
              {t('save')}
            </Button>
            <Button onClick={() => {
              handleSave()
              console.log("Push to warehouse")
            }} disabled={!isFormValid()}>
              <Save className="mr-2 h-4 w-4" />
              {t('saveAndPushToWarehouse')}
            </Button>
          </div>
        </div>

        {/* 区块①：收货基础信息 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('receiptBasicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('receiptNo')}</Label>
                <Input value={receiptNo} disabled placeholder={t('autoGenerated')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiptType">{t('receiptType')} *</Label>
                <Select value={receiptType} onValueChange={(value: "REGULAR" | "TRANSLOAD" | "RETURN_FROM_END_USER" | "INVENTORY_RECEIPT" | "CUSTOMER_TRANSFER") => setReceiptType(value)}>
                  <SelectTrigger id="receiptType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGULAR">{t('regularReceipt')}</SelectItem>
                    <SelectItem value="TRANSLOAD">{t('transload')}</SelectItem>
                    <SelectItem value="RETURN_FROM_END_USER">{t('returnFromEndUser')}</SelectItem>
                    <SelectItem value="INVENTORY_RECEIPT">{t('inventoryReceipt')}</SelectItem>
                    <SelectItem value="CUSTOMER_TRANSFER">{t('customerTransfer')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">{t('title')}</Label>
                <Combobox
                  options={mockTitles}
                  value={title}
                  onValueChange={handleTitleChange}
                  placeholder={t('selectOrEnterTitle')}
                  searchPlaceholder={t('searchTitle')}
                  allowCustom={true}
                  customPlaceholder={t('enterCustomTitle')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warehouse">{t('warehouse')} *</Label>
                <Select value={warehouse} onValueChange={setWarehouse}>
                  <SelectTrigger id="warehouse">
                    <SelectValue placeholder={t('selectWarehouse')} />
                  </SelectTrigger>
                  <SelectContent>
                    {mockWarehouses.map(wh => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="relatedNo">{t('relatedNo')}</Label>
                <Input
                  id="relatedNo"
                  value={relatedNo}
                  onChange={(e) => setRelatedNo(e.target.value)}
                  placeholder={t('enterRelatedNo')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="autoReceiving">{t('autoReceiving')}</Label>
                <Select value={autoReceiving} onValueChange={(value: "YES" | "NO") => setAutoReceiving(value)}>
                  <SelectTrigger id="autoReceiving">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YES">{t('yes')}</SelectItem>
                    <SelectItem value="NO">{t('no')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remark">{t('remark')}</Label>
              <Textarea
                id="remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder={t('enterNotes')}
                rows={3}
              />
            </div>

          </CardContent>
        </Card>

        {/* 供应商信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('supplierInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">{t('supplierName')}</Label>
                <Input
                  id="supplier"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder={t('enterSupplier')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('poNo')}</Label>
                <div className="flex gap-2">
                  <Combobox
                    options={poOptions}
                    value={poNo}
                    onValueChange={handlePOChange}
                    placeholder={t('selectOrEnterPO')}
                    searchPlaceholder={t('searchPO')}
                    allowCustom={true}
                    className="flex-1"
                  />
                  {dialogSelectedPO && (
                    <Button variant="outline" onClick={() => handleOpenPOLineDialog()}>
                      {t('selectPOLines')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* 已选择的PO列表 */}
            {selectedPOs.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('selectedPOs')}</Label>
                <div className="space-y-2">
                  {selectedPOs.map(po => (
                    <div key={po.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex-1">
                        <div className="font-medium">{po.poNo}</div>
                        <div className="text-sm text-muted-foreground">{po.vendor}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleOpenPOLineDialog(po)}
                        >
                          {t('selectPOLines')}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemovePO(po.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 区块②：运输信息 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('transportInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transportMode">{t('transportMode')}</Label>
                <Select value={transportMode} onValueChange={(value: "FTL" | "LTL" | "EXPRESS" | "SMALL_PARCEL" | "AIR_CARGO" | "OCEAN_FCL" | "OCEAN_LCL" | "RAIL" | "INTERMODAL" | "INTERNAL" | "VIRTUAL" | "") => setTransportMode(value)}>
                  <SelectTrigger id="transportMode">
                    <SelectValue placeholder={t('selectTransportMode')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FTL">{t('ftl')}</SelectItem>
                    <SelectItem value="LTL">{t('ltl')}</SelectItem>
                    <SelectItem value="EXPRESS">{t('expressDelivery')}</SelectItem>
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
              <div className="space-y-2">
                <Label htmlFor="appointmentTime">{t('appointmentTime')}</Label>
                <Input
                  id="appointmentTime"
                  type="datetime-local"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inYardTime">{t('inYardTime')}</Label>
                <Input
                  id="inYardTime"
                  type="datetime-local"
                  value={inYardTime}
                  onChange={(e) => setInYardTime(e.target.value)}
                />
              </div>
            </div>

            {transportMode && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getTransportFields()}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 区块④：收货明细 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('receiptLines')}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowProductDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('addLineItem')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {receiptLines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('noReceiptLines')}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('item')}</TableHead>
                    <TableHead>{t('poNo')}</TableHead>
                    <TableHead>{t('orderedQty')}</TableHead>
                    <TableHead>{t('receivedQty')}</TableHead>
                    <TableHead>{t('thisReceiptQty')}</TableHead>
                    <TableHead>{t('palletCount')}</TableHead>
                    <TableHead>{t('receivedUOM')}</TableHead>
                    {autoReceiving === "YES" && (
                      <TableHead>{t('location')}</TableHead>
                    )}
                    <TableHead>{t('batchNo')}</TableHead>
                    <TableHead>{t('serialNo')}</TableHead>
                    <TableHead>{t('lineRemark')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receiptLines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{line.itemName}</div>
                          <div className="text-sm text-muted-foreground">{line.sku}</div>
                        </div>
                      </TableCell>
                      <TableCell>{line.poNo || "-"}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={line.orderedQty}
                          onChange={(e) => handleOrderedQtyChange(line.id, parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>{line.receivedQty.toLocaleString()}</TableCell>
                      <TableCell>{line.thisReceiptQty.toLocaleString()}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={line.palletCount || 0}
                          onChange={(e) => handlePalletCountChange(line.id, parseInt(e.target.value) || 0)}
                          placeholder={t('enterPalletCount')}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={line.receivedUOM}
                          onChange={(e) => handleUOMChange(line.id, e.target.value)}
                          placeholder={t('enterUOM')}
                          className="w-24"
                        />
                      </TableCell>
                      {autoReceiving === "YES" && (
                        <TableCell>
                          <Input
                            value={line.location || ""}
                            onChange={(e) => handleLocationChange(line.id, e.target.value)}
                            placeholder={t('enterLocation')}
                            className="w-32"
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <Input
                          value={line.batchNo || ""}
                          onChange={(e) => handleBatchNoChange(line.id, e.target.value)}
                          placeholder={t('enterBatchNo')}
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={line.serialNo || ""}
                          onChange={(e) => handleSerialNoChange(line.id, e.target.value)}
                          placeholder={t('enterSerialNo')}
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={line.lineRemark || ""}
                          onChange={(e) => handleLineRemarkChange(line.id, e.target.value)}
                          placeholder={t('enterRemark')}
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveLine(line.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>



        {/* 产品选择对话框 */}
        <ProductSelectionDialog
          open={showProductDialog}
          onOpenChange={setShowProductDialog}
          onProductsSelected={handleProductsSelected}
        />

        {/* PO Line选择对话框 */}
        <Dialog open={showPOLineDialog} onOpenChange={setShowPOLineDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('selectPOLines')}</DialogTitle>
              <DialogDescription>
                {dialogSelectedPO && `${t('selectLinesFromPO')}: ${dialogSelectedPO.poNo}`}
              </DialogDescription>
            </DialogHeader>
            {dialogSelectedPO && (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedPOLineIds.length === dialogSelectedPO.lines.length && dialogSelectedPO.lines.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPOLineIds(dialogSelectedPO.lines.map(l => l.id))
                            } else {
                              setSelectedPOLineIds([])
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>{t('lineNo')}</TableHead>
                      <TableHead>{t('sku')}</TableHead>
                      <TableHead>{t('itemName')}</TableHead>
                      <TableHead>{t('orderedQty')}</TableHead>
                      <TableHead>{t('receivedQty')}</TableHead>
                      <TableHead>{t('remainingQty')}</TableHead>
                      <TableHead>{t('uom')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dialogSelectedPO.lines.map(line => {
                      const isSelected = selectedPOLineIds.includes(line.id)
                      return (
                        <TableRow key={line.id} className={isSelected ? 'bg-primary/10' : ''}>
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handlePOLineDialogSelect(line.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>{line.lineNo}</TableCell>
                          <TableCell>{line.sku}</TableCell>
                          <TableCell>{line.itemName}</TableCell>
                          <TableCell>{line.orderedQty}</TableCell>
                          <TableCell>{line.receivedQty}</TableCell>
                          <TableCell className="text-orange-600">{line.remainingQty}</TableCell>
                          <TableCell>{line.uom}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPOLineDialog(false)}>
                {t('cancel')}
              </Button>
              <Button onClick={handleConfirmPOLineSelection}>
                {t('confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
