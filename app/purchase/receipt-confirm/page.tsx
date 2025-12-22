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
import { 
  Plus, Download, Upload, FileDown, FilePlus, 
  ExternalLink, Package, Truck, XCircle, Edit, Eye, CheckCircle, RefreshCw
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/components/i18n-provider"
import { createPurchaseSidebarItems } from "@/lib/purchase-sidebar-items"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Receipt Confirm数据接口 - 根据API报文结构
interface ReceiptConfirm {
  receiptId: string // 收货确认单ID
  receiptReferenceNo: string // 收货参考号（收货确认单号）
  facility: number // 仓库ID
  customer?: string // 客户
  carrierName?: string // 承运商名称
  carrierScac?: string // 承运商SCAC代码
  titleId?: string // 货主ID
  containerNo?: string // 集装箱号
  poNo?: string // PO单号
  receivedTime: number // 收货时间（时间戳）
  receiptType: "REGULAR_RECEIPT" | "RETURN" | "XDOCK" // 收货类型
  status: "CLOSED" | "PARTIAL" | "EXCEPTION" // 状态
  shippingMethod?: string // 运输方式
  inYardTime?: number // 进场时间（时间戳）
  containerSize?: string // 集装箱尺寸
  isResend?: boolean // 是否重新发送
  timeZone?: string // 时区
  receiveTaskId?: string // 收货任务ID
  inboundSeal?: string // 进站封号
  outboundSeal?: string // 出站封号
  sealMismatchFlag?: boolean // 封号不匹配标志
  photos?: string[] // 照片数组
  // 计算字段（从items聚合）
  totalReceivedQty?: number // 总收货数量
  totalExpectedQty?: number // 总预期数量
  totalLines?: number // 总行数
  // 兼容字段（用于显示）
  receiptNo?: string // 关联的入库请求单号（如果有）
  receiptConfirmNo?: string // 收货确认单号（映射自receiptReferenceNo）
  referenceNo?: string // 参考号（关联单号）
  inboundReceiptNo?: string // 入库单号（RN开头）
  warehouse?: string // 仓库名称（需要根据facility查询）
  receivedBy?: string // 收货人（需要从其他字段获取）
  receivedDate?: string // 收货日期（格式化自receivedTime）
}

// Mock数据 - 根据API报文结构
const mockReceiptConfirms: ReceiptConfirm[] = [
  {
    receiptId: "RC-001",
    receiptReferenceNo: "RC-2024-001",
    receiptConfirmNo: "RC-2024-001",
    facility: 1001,
    customer: "ABC Company",
    carrierName: "FedEx",
    carrierScac: "FDEG",
    titleId: "TITLE-001",
    containerNo: "CONT-123456",
    poNo: "PO-2024-001",
    receivedTime: 1705747800000, // 2024-01-20T10:30:00Z
    receiptType: "REGULAR_RECEIPT",
    status: "PARTIAL",
    shippingMethod: "LTL",
    inYardTime: 1705746000000, // 2024-01-20T10:00:00Z
    containerSize: "40FT",
    isResend: false,
    timeZone: "America/Los_Angeles",
    receiveTaskId: "TASK-001",
    inboundSeal: "SEAL-IN-001",
    outboundSeal: "SEAL-OUT-001",
    sealMismatchFlag: false,
    photos: [],
    receiptNo: "RCP-2024-001",
    inboundReceiptNo: "RN-2024-001",
    referenceNo: "REF-2024-001",
    warehouse: "Main Warehouse - Los Angeles",
    receivedBy: "John Smith",
    receivedDate: "2024-01-20T10:30:00Z",
    totalReceivedQty: 80,
    totalExpectedQty: 150,
    totalLines: 5,
  },
  {
    receiptId: "RC-002",
    receiptReferenceNo: "RC-2024-002",
    receiptConfirmNo: "RC-2024-002",
    facility: 1002,
    customer: "XYZ Corporation",
    carrierName: "UPS",
    carrierScac: "UPSN",
    titleId: "TITLE-002",
    poNo: "PO-2024-002",
    receivedTime: 1705582500000, // 2024-01-18T14:15:00Z
    receiptType: "REGULAR_RECEIPT",
    status: "CLOSED",
    shippingMethod: "EXPRESS",
    isResend: false,
    timeZone: "America/New_York",
    receiveTaskId: "TASK-002",
    photos: [],
    receiptNo: "RCP-2024-002",
    inboundReceiptNo: "RN-2024-002",
    referenceNo: "REF-2024-002",
    warehouse: "New York Warehouse",
    receivedBy: "Jane Doe",
    receivedDate: "2024-01-18T14:15:00Z",
    totalReceivedQty: 200,
    totalExpectedQty: 200,
    totalLines: 8,
  },
  {
    receiptId: "RC-003",
    receiptReferenceNo: "RC-2024-003",
    receiptConfirmNo: "RC-2024-003",
    facility: 1001,
    customer: "ABC Company",
    carrierName: "DHL",
    carrierScac: "DHLE",
    titleId: "TITLE-001",
    containerNo: "CONT-789012",
    poNo: "PO-2024-001",
    receivedTime: 1705833600000, // 2024-01-21T09:00:00Z
    receiptType: "REGULAR_RECEIPT",
    status: "CLOSED",
    shippingMethod: "AIR_CARGO",
    inYardTime: 1705831800000,
    containerSize: "20FT",
    isResend: false,
    timeZone: "America/Los_Angeles",
    receiveTaskId: "TASK-003",
    inboundSeal: "SEAL-IN-003",
    outboundSeal: "SEAL-OUT-003",
    sealMismatchFlag: false,
    photos: [],
    receiptNo: "RCP-2024-001",
    inboundReceiptNo: "RN-2024-003",
    referenceNo: "REF-2024-003",
    warehouse: "Main Warehouse - Los Angeles",
    receivedBy: "Mike Johnson",
    receivedDate: "2024-01-21T09:00:00Z",
    totalReceivedQty: 70,
    totalExpectedQty: 150,
    totalLines: 5,
  },
  {
    receiptId: "RC-004",
    receiptReferenceNo: "RC-2024-004",
    receiptConfirmNo: "RC-2024-004",
    facility: 1001,
    customer: "Global Trading Co.",
    carrierName: "Maersk",
    carrierScac: "MAEU",
    titleId: "TITLE-003",
    containerNo: "CONT-345678",
    poNo: "PO-2024-003",
    receivedTime: 1705920300000, // 2024-01-22T11:45:00Z
    receiptType: "RETURN",
    status: "EXCEPTION",
    shippingMethod: "OCEAN_FCL",
    inYardTime: 1705918500000,
    containerSize: "40FT",
    isResend: true,
    timeZone: "America/Los_Angeles",
    receiveTaskId: "TASK-004",
    inboundSeal: "SEAL-IN-004",
    outboundSeal: "SEAL-OUT-004",
    sealMismatchFlag: true,
    photos: ["photo1.jpg", "photo2.jpg"],
    receiptNo: "RCP-2024-003",
    inboundReceiptNo: "RN-2024-004",
    referenceNo: "REF-2024-004",
    warehouse: "Main Warehouse - Los Angeles",
    receivedBy: "Mike Johnson",
    receivedDate: "2024-01-22T11:45:00Z",
    totalReceivedQty: 60,
    totalExpectedQty: 100,
    totalLines: 3,
  },
]

export default function ReceiptConfirmPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [searchValue, setSearchValue] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("all")
  const [activeFilters, setActiveFilters] = React.useState<ActiveFilter[]>([])
  const [advancedSearchValues, setAdvancedSearchValues] = React.useState<AdvancedSearchValues>({})
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [selectedRows, setSelectedRows] = React.useState<string[]>([])
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = React.useState(false)

  const sidebarItems = createPurchaseSidebarItems(t)

  // 状态配置
  const statusConfig = {
    CLOSED: { label: t('CLOSED'), color: "bg-green-100 text-green-800" },
    PARTIAL: { label: t('PARTIALLY_RECEIVED'), color: "bg-orange-100 text-orange-800" },
    EXCEPTION: { label: t('EXCEPTION'), color: "bg-red-100 text-red-800" },
  }

  // 收货类型配置
  const receiptTypeConfig = {
    REGULAR_RECEIPT: { label: t('REGULAR_RECEIPT'), color: "bg-blue-100 text-blue-800" },
    RETURN: { label: t('RETURN'), color: "bg-orange-100 text-orange-800" },
    XDOCK: { label: t('XDOCK'), color: "bg-purple-100 text-purple-800" },
  }

  // 筛选器配置
  const filterConfigs: FilterConfig[] = [
    {
      id: "status",
      label: t('status'),
      type: "multiple",
      options: [
        { id: "closed", label: t('CLOSED'), value: "CLOSED" },
        { id: "partial", label: t('PARTIALLY_RECEIVED'), value: "PARTIAL" },
        { id: "exception", label: t('EXCEPTION'), value: "EXCEPTION" },
      ],
    },
    {
      id: "receiptType",
      label: t('receiptType'),
      type: "multiple",
      options: [
        { id: "regular", label: t('REGULAR_RECEIPT'), value: "REGULAR_RECEIPT" },
        { id: "return", label: t('RETURN'), value: "RETURN" },
        { id: "xdock", label: t('XDOCK'), value: "XDOCK" },
      ],
    },
    {
      id: "warehouse",
      label: t('warehouse'),
      type: "single",
      options: [
        { id: "wh001", label: "Main Warehouse - Los Angeles", value: "Main Warehouse - Los Angeles" },
        { id: "wh002", label: "New York Warehouse", value: "New York Warehouse" },
        { id: "wh003", label: "Chicago Warehouse", value: "Chicago Warehouse" },
      ],
    },
  ]

  // 数据过滤逻辑
  const filteredData = React.useMemo(() => {
    let result = [...mockReceiptConfirms]

    // 状态标签页过滤
    if (activeTab !== "all") {
      result = result.filter(r => r.status === activeTab.toUpperCase())
    }

    // 基础搜索过滤
    if (searchValue) {
      const searchLower = searchValue.toLowerCase()
      result = result.filter(r =>
        (r.receiptReferenceNo || r.receiptConfirmNo || "").toLowerCase().includes(searchLower) ||
        (r.receiptNo || "").toLowerCase().includes(searchLower) ||
        (r.customer && r.customer.toLowerCase().includes(searchLower)) ||
        (r.carrierName && r.carrierName.toLowerCase().includes(searchLower)) ||
        (r.containerNo && r.containerNo.toLowerCase().includes(searchLower)) ||
        (r.poNo && r.poNo.toLowerCase().includes(searchLower)) ||
        (r.warehouse && r.warehouse.toLowerCase().includes(searchLower)) ||
        (r.receivedBy && r.receivedBy.toLowerCase().includes(searchLower))
      )
    }

    // 筛选器过滤
    if (activeFilters.length > 0) {
      result = result.filter(r => {
        return activeFilters.every(filter => {
          switch (filter.filterId) {
            case "status":
              return r.status === filter.optionValue
            case "receiptType":
              return r.receiptType === filter.optionValue
            case "warehouse":
              return (r.warehouse || "").includes(filter.optionValue)
            default:
              return true
          }
        })
      })
    }

    // 高级搜索过滤
    if (Object.keys(advancedSearchValues).length > 0) {
      result = result.filter(r => {
        if (advancedSearchValues.receiptReferenceNo && !(r.receiptReferenceNo || r.receiptConfirmNo || "").toLowerCase().includes(advancedSearchValues.receiptReferenceNo.toLowerCase())) {
          return false
        }
        if (advancedSearchValues.receiptNo && !(r.receiptNo || "").toLowerCase().includes(advancedSearchValues.receiptNo.toLowerCase())) {
          return false
        }
        if (advancedSearchValues.customer && (!r.customer || !r.customer.toLowerCase().includes(advancedSearchValues.customer.toLowerCase()))) {
          return false
        }
        if (advancedSearchValues.carrierName && (!r.carrierName || !r.carrierName.toLowerCase().includes(advancedSearchValues.carrierName.toLowerCase()))) {
          return false
        }
        if (advancedSearchValues.containerNo && (!r.containerNo || !r.containerNo.toLowerCase().includes(advancedSearchValues.containerNo.toLowerCase()))) {
          return false
        }
        if (advancedSearchValues.poNo && (!r.poNo || !r.poNo.toLowerCase().includes(advancedSearchValues.poNo.toLowerCase()))) {
          return false
        }
        if (advancedSearchValues.warehouse && !(r.warehouse || "").toLowerCase().includes(advancedSearchValues.warehouse.toLowerCase())) {
          return false
        }
        if (advancedSearchValues.receivedBy && (!r.receivedBy || !r.receivedBy.toLowerCase().includes(advancedSearchValues.receivedBy.toLowerCase()))) {
          return false
        }
        return true
      })
    }

    return result
  }, [activeTab, searchValue, activeFilters, advancedSearchValues])

  // 状态计数
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      all: filteredData.length,
      CLOSED: 0,
      PARTIAL: 0,
      EXCEPTION: 0,
    }
    filteredData.forEach(confirm => {
      counts[confirm.status] = (counts[confirm.status] || 0) + 1
    })
    return counts
  }, [filteredData])

  // 操作处理函数
  const handleView = (confirm: ReceiptConfirm) => {
    router.push(`/purchase/receipt-confirm/${confirm.receiptId}`)
  }

  const handleDownload = (confirm: ReceiptConfirm) => {
    console.log("Download receipt confirm:", confirm.receiptId)
    // TODO: 实现下载收货确认单的逻辑
  }

  const handleRawData = (confirm: ReceiptConfirm) => {
    console.log("View raw data for receipt confirm:", confirm.receiptId)
    // TODO: 实现查看原始数据的逻辑，可以打开一个对话框显示JSON数据
    const rawData = JSON.stringify(confirm, null, 2)
    alert(rawData) // 临时实现，实际应该使用Dialog组件
  }

  // 获取可用操作（根据状态）
  const getAvailableActions = (confirm: ReceiptConfirm) => {
    return [
      { label: t('view'), action: () => handleView(confirm) },
      { label: t('download'), action: () => handleDownload(confirm) },
      { label: t('rawData'), action: () => handleRawData(confirm) },
    ]
  }

  // 批量操作
  const availableBatchActions = [
    { label: t('batchDownload'), action: () => console.log("Batch Download", selectedRows) },
  ]

  // 高级搜索字段配置
  const advancedSearchFields: SearchField[] = [
    { id: "receiptReferenceNo", label: t('receiptReferenceNo'), type: "text" },
    { id: "receiptNo", label: t('inboundRequestNo'), type: "text" },
    { id: "customer", label: t('customer'), type: "text" },
    { id: "carrierName", label: t('carrierName'), type: "text" },
    { id: "containerNo", label: t('containerNo'), type: "text" },
    { id: "poNo", label: t('poNo'), type: "text" },
    { id: "warehouse", label: t('warehouse'), type: "text" },
    { id: "receivedBy", label: t('receivedBy'), type: "text" },
  ]

  // 列定义
  const allColumns: Column<ReceiptConfirm>[] = [
    {
      id: "receiptReferenceNo",
      header: t('receiptReferenceNo'),
      width: "150px",
      defaultVisible: true,
      cell: (row) => (
        <Button variant="link" className="h-auto p-0 font-medium" onClick={() => handleView(row)}>
          {row.receiptReferenceNo || row.receiptConfirmNo}
        </Button>
      ),
    },
    {
      id: "referenceNo",
      header: t('referenceNo') || "Reference No",
      width: "150px",
      defaultVisible: true,
      cell: (row) => row.referenceNo || <span className="text-muted-foreground">-</span>,
    },
    {
      id: "receiptNo",
      header: t('inboundRequestNo'),
      width: "150px",
      defaultVisible: true,
      cell: (row) => row.receiptNo ? (
        <Button variant="link" className="h-auto p-0" onClick={() => router.push(`/purchase/receipts/${row.receiptId}`)}>
          {row.receiptNo}
        </Button>
      ) : <span className="text-muted-foreground">-</span>,
    },
    {
      id: "inboundReceiptNo",
      header: t('inboundReceiptNo'),
      width: "150px",
      defaultVisible: true,
      cell: (row) => row.inboundReceiptNo || <span className="text-muted-foreground">-</span>,
    },
    {
      id: "receiptType",
      header: t('receiptType'),
      width: "120px",
      defaultVisible: true,
      cell: (row) => (
        <Badge className={receiptTypeConfig[row.receiptType]?.color || "bg-gray-100 text-gray-800"}>
          {receiptTypeConfig[row.receiptType]?.label || row.receiptType}
        </Badge>
      ),
    },
    {
      id: "status",
      header: t('status'),
      width: "120px",
      defaultVisible: true,
      cell: (row) => (
        <Badge className={statusConfig[row.status]?.color || "bg-gray-100 text-gray-800"}>
          {statusConfig[row.status]?.label || row.status}
        </Badge>
      ),
    },
    {
      id: "warehouse",
      header: t('warehouse'),
      width: "200px",
      defaultVisible: true,
      cell: (row) => row.warehouse || `Facility ${row.facility}`,
    },
    {
      id: "customer",
      header: t('customer'),
      width: "150px",
      defaultVisible: false,
      cell: (row) => row.customer || <span className="text-muted-foreground">-</span>,
    },
    {
      id: "carrierName",
      header: t('carrierName'),
      width: "150px",
      defaultVisible: false,
      cell: (row) => row.carrierName || <span className="text-muted-foreground">-</span>,
    },
    {
      id: "containerNo",
      header: t('containerNo'),
      width: "150px",
      defaultVisible: false,
      cell: (row) => row.containerNo || <span className="text-muted-foreground">-</span>,
    },
    {
      id: "poNo",
      header: t('poNo'),
      width: "150px",
      defaultVisible: true,
      cell: (row) => row.poNo ? (
        <Button variant="link" className="h-auto p-0" onClick={() => router.push(`/purchase/po/${row.poNo}`)}>
          {row.poNo}
        </Button>
      ) : <span className="text-muted-foreground">-</span>,
    },
    {
      id: "shippingMethod",
      header: t('shippingMethod'),
      width: "120px",
      defaultVisible: false,
      cell: (row) => row.shippingMethod || <span className="text-muted-foreground">-</span>,
    },
    {
      id: "totalReceivedQty",
      header: t('totalReceivedQty') || "累计已收货",
      width: "120px",
      defaultVisible: true,
      cell: (row) => (
        <span className={row.totalReceivedQty && row.totalExpectedQty && row.totalReceivedQty >= row.totalExpectedQty ? "font-medium text-green-600" : ""}>
          {row.totalReceivedQty?.toLocaleString() || 0}
        </span>
      ),
    },
    {
      id: "totalExpectedQty",
      header: t('expectedQty'),
      width: "120px",
      defaultVisible: true,
      cell: (row) => row.totalExpectedQty?.toLocaleString() || 0,
    },
    {
      id: "receivedBy",
      header: t('receivedBy'),
      width: "150px",
      defaultVisible: true,
      cell: (row) => row.receivedBy || <span className="text-muted-foreground">-</span>,
    },
    {
      id: "receivedTime",
      header: t('receivedTime'),
      width: "180px",
      defaultVisible: true,
      cell: (row) => row.receivedTime ? new Date(row.receivedTime).toLocaleString() : (row.receivedDate ? new Date(row.receivedDate).toLocaleString() : "-"),
    },
    {
      id: "inYardTime",
      header: t('inYardTime'),
      width: "180px",
      defaultVisible: false,
      cell: (row) => row.inYardTime ? new Date(row.inYardTime).toLocaleString() : <span className="text-muted-foreground">-</span>,
    },
    {
      id: "sealMismatchFlag",
      header: t('sealMismatchFlag'),
      width: "120px",
      defaultVisible: false,
      cell: (row) => row.sealMismatchFlag ? (
        <Badge className="bg-red-100 text-red-800">{t('yes')}</Badge>
      ) : <span className="text-muted-foreground">-</span>,
    },
    {
      id: "completedLines",
      header: t('completedLines') || "已完成行数",
      width: "120px",
      defaultVisible: false,
      cell: (row) => `${row.completedLines} / ${row.totalLines}`,
    },
    {
      id: "created",
      header: t('created'),
      width: "180px",
      defaultVisible: false,
      cell: (row) => new Date(row.created).toLocaleString(),
    },
    {
      id: "actions",
      header: t('actions'),
      width: "120px",
      defaultVisible: true,
      cell: (row) => {
        const actions = getAvailableActions(row)
        return (
          <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
            {actions.slice(0, 2).map((action, idx) => (
              <button
                key={idx}
                className="text-blue-600 hover:text-blue-800 hover:underline text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                onClick={(e) => {
                  e.stopPropagation()
                  action.action()
                }}
              >
                {action.label}
              </button>
            ))}
            {actions.length > 2 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t('moreActions')}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {actions.slice(2).map((action, idx) => (
                    <DropdownMenuItem 
                      key={idx} 
                      onClick={(e) => {
                        e.stopPropagation()
                        action.action()
                      }}
                    >
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )
      },
    },
  ]

  // Initialize visible columns on mount
  React.useEffect(() => {
    const defaultVisible = new Set(
      allColumns.filter(col => col.defaultVisible !== false).map(col => col.id)
    )
    setVisibleColumns(defaultVisible)
  }, [])

  // Prepare column configs for FilterBar
  const columnConfigs = allColumns.map(col => ({
    id: col.id,
    label: typeof col.header === 'string' ? col.header : col.header,
    visible: visibleColumns.has(col.id),
    defaultVisible: col.defaultVisible
  }))

  // Handle column visibility changes
  const handleColumnsChange = (updatedColumns: { id: string; label: string; visible: boolean }[]) => {
    const newVisible = new Set(updatedColumns.filter(c => c.visible).map(c => c.id))
    setVisibleColumns(newVisible)
  }

  // Filter columns based on visibility
  const visibleColumnsList = allColumns.filter(col => visibleColumns.has(col.id))

  // Pagination
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return filteredData.slice(start, end)
  }, [filteredData, currentPage, pageSize])

  const totalPages = Math.ceil(filteredData.length / pageSize)

  // 刷新数据
  const handleRefresh = React.useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  return (
    <TooltipProvider>
      <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('receiptConfirm')}</h1>
              <p className="text-muted-foreground">{t('manageReceiptConfirms') || '管理收货确认单据'}</p>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
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
            </div>
          </div>

          {/* Status Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">
                {t('all')} ({statusCounts.all})
              </TabsTrigger>
              <TabsTrigger value="closed">
                {t('CLOSED')} ({statusCounts.CLOSED})
              </TabsTrigger>
              <TabsTrigger value="partial">
                {t('PARTIALLY_RECEIVED')} ({statusCounts.PARTIAL})
              </TabsTrigger>
              <TabsTrigger value="exception">
                {t('EXCEPTION')} ({statusCounts.EXCEPTION})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filter Bar */}
          <FilterBar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
            filterConfigs={filterConfigs}
            advancedSearchFields={advancedSearchFields}
            advancedSearchValues={advancedSearchValues}
            onAdvancedSearchChange={setAdvancedSearchValues}
            columnConfigs={columnConfigs}
            onColumnsChange={handleColumnsChange}
            searchPlaceholder={t('searchReceiptConfirmsPlaceholder') || '搜索收货确认单号、入库请求单号、供应商、PO单号、仓库或收货人...'}
          />

          {/* Data Table */}
          <Card>
            <CardContent className="p-0">
              <DataTable
                data={paginatedData}
                columns={visibleColumnsList}
                selectedRows={selectedRows}
                onSelectedRowsChange={setSelectedRows}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                batchActions={selectedRows.length > 0 ? availableBatchActions : undefined}
                hideColumnControl={true}
              />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </TooltipProvider>
  )
}
