"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, Column } from "@/components/data-table/data-table"
import { FilterBar, FilterConfig, ActiveFilter } from "@/components/data-table/filter-bar"
import { SearchField, AdvancedSearchValues } from "@/components/data-table/advanced-search-dialog"
import { FileText, ShoppingCart, Truck, Package, CheckCircle, Plus, Download, Send, XCircle, Upload, FileDown, FilePlus, AlertTriangle, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PRActionConfirmDialog } from "@/components/purchase/pr-action-confirm-dialog"
import { SimplePODialog } from "@/components/purchase/simple-po-dialog"
import { I18nProvider, useI18n } from "@/components/i18n-provider"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { OrderNumberCell } from "@/components/ui/order-number-cell"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Import the shared sidebar items
import { createPurchaseSidebarItems } from "@/lib/purchase-sidebar-items"

// PR Data Interface based on requirements
interface PurchaseRequest {
  id: string
  prNo: string
  businessNo: string // 业务单号/关联业务号
  businessEntity: string // 业务实体/公司
  department: string // 事业部/部门
  requester: string // 申请人
  requesterNo: string // 申请人工号
  currentApprover: string | null // 当前审批人
  status: "DRAFT" | "SUBMITTED" | "APPROVING" | "APPROVED" | "REJECTED" | "CANCELLED" | "EXCEPTION" | "PARTIAL_PO" | "FULL_PO" | "CLOSED"
  prType: string // PR类型
  priority: "NORMAL" | "URGENT" | "VERY_URGENT" // 优先级
  poGenerated: "NOT_GENERATED" | "PARTIALLY_GENERATED" | "FULLY_GENERATED" // PO生成情况
  created: string
  expectedDeliveryDate: string // 期望到货日期（最早）
  targetWarehouses: string[] // 目标仓库
  skuCount: number // 需求SKU数量
  totalQty: number // 总需求数量
  estimatedAmount: number // 预计总金额
  currency: string
  updated: string
  exceptions: string[] // 异常信息
  // 额外字段
  budgetProject: string // 预算项目/成本中心
  notes: string // 备注
  lineItems?: any[] // 商品明细行
}

// Mock data with comprehensive PR fields
const mockPRs: PurchaseRequest[] = [
  {
    id: "1",
    prNo: "PR202401100001",
    businessNo: "PROJ-2024-001",
    businessEntity: "UT",
    department: "ECOM Dept",
    requester: "张三",
    requesterNo: "EMP001",
    currentApprover: "李经理",
    status: "PARTIAL_PO",
    prType: "常规采购",
    priority: "NORMAL",
    poGenerated: "PARTIALLY_GENERATED",
    created: "2024-01-10T09:30:00Z",
    expectedDeliveryDate: "2024-01-25",
    targetWarehouses: ["Main Warehouse - LA"],
    skuCount: 15,
    totalQty: 500,
    estimatedAmount: 12500.00,
    currency: "USD",
    updated: "2024-01-12T14:20:00Z",
    exceptions: [],
    budgetProject: "Q1-Marketing",
    notes: "促销活动备货",
    lineItems: [
      {
        id: "1",
        lineNo: 1,
        skuCode: "SKU001",
        productName: "iPhone 15 Pro",
        specifications: "256GB Space Black",
        quantity: 100,
        unit: "PCS",
        estimatedUnitPrice: 100.00,
        supplier: "Apple Inc.",
      },
      {
        id: "2",
        lineNo: 2,
        skuCode: "SKU002",
        productName: "MacBook Pro",
        specifications: "14-inch M3 Pro",
        quantity: 50,
        unit: "PCS",
        estimatedUnitPrice: 200.00,
        supplier: "Apple Inc.",
      },
    ],
  },
  {
    id: "2",
    prNo: "PR202401090001",
    businessNo: "REQ-2024-002",
    businessEntity: "UF",
    department: "Operations",
    requester: "王五",
    requesterNo: "EMP002",
    currentApprover: null,
    status: "DRAFT",
    prType: "项目采购",
    priority: "URGENT",
    poGenerated: "NOT_GENERATED",
    created: "2024-01-09T11:15:00Z",
    expectedDeliveryDate: "2024-01-20",
    targetWarehouses: ["East DC - NY", "West FC - Seattle"],
    skuCount: 28,
    totalQty: 1200,
    estimatedAmount: 35000.00,
    currency: "USD",
    updated: "2024-01-09T11:15:00Z",
    exceptions: [],
    budgetProject: "Infrastructure-2024",
    notes: "紧急补货需求",
  },
  {
    id: "3",
    prNo: "PR202401050001",
    businessNo: "PROJ-2024-003",
    businessEntity: "ITEM",
    department: "Product Team",
    requester: "赵六",
    requesterNo: "EMP003",
    currentApprover: null,
    status: "APPROVED",
    prType: "备货",
    priority: "NORMAL",
    poGenerated: "FULLY_GENERATED",
    created: "2024-01-05T13:20:00Z",
    expectedDeliveryDate: "2024-01-18",
    targetWarehouses: ["Central WH - Chicago"],
    skuCount: 42,
    totalQty: 850,
    estimatedAmount: 28000.00,
    currency: "USD",
    updated: "2024-01-08T16:45:00Z",
    exceptions: [],
    budgetProject: "Product-Launch-Q1",
    notes: "新品上市备货",
    lineItems: [
      {
        id: "3",
        lineNo: 1,
        skuCode: "SKU003",
        productName: "Samsung Galaxy S24",
        specifications: "256GB Phantom Black",
        quantity: 200,
        unit: "PCS",
        estimatedUnitPrice: 80.00,
        supplier: "Samsung Electronics",
      },
    ],
  },
  {
    id: "3a",
    prNo: "PR202401110002",
    businessNo: "REQ-2024-003A",
    businessEntity: "UT",
    department: "Marketing",
    requester: "李四",
    requesterNo: "EMP003A",
    currentApprover: "张经理",
    status: "APPROVING",
    prType: "常规采购",
    priority: "URGENT",
    poGenerated: "NOT_GENERATED",
    created: "2024-01-11T10:30:00Z",
    expectedDeliveryDate: "2024-01-28",
    targetWarehouses: ["Main Warehouse - LA"],
    skuCount: 25,
    totalQty: 600,
    estimatedAmount: 18500.00,
    currency: "USD",
    updated: "2024-01-12T09:15:00Z",
    exceptions: [],
    budgetProject: "Marketing-Campaign-Q1",
    notes: "营销活动物料采购，等待审批",
  },
  {
    id: "4",
    prNo: "PR202401120001",
    businessNo: "REQ-2024-004",
    businessEntity: "LSO",
    department: "Logistics",
    requester: "孙七",
    requesterNo: "EMP004",
    currentApprover: "陈总监",
    status: "EXCEPTION",
    prType: "内部调拨",
    priority: "VERY_URGENT",
    poGenerated: "NOT_GENERATED",
    created: "2024-01-12T08:00:00Z",
    expectedDeliveryDate: "2024-01-22",
    targetWarehouses: ["多仓（3）"],
    skuCount: 35,
    totalQty: 1500,
    estimatedAmount: 45000.00,
    currency: "USD",
    updated: "2024-01-12T16:30:00Z",
    exceptions: ["缺少目标仓库配置", "审批流配置错误"],
    budgetProject: "Logistics-Optimization",
    notes: "仓库间调拨需求",
  },
  {
    id: "5",
    prNo: "PR202401080001",
    businessNo: "PROJ-2024-005",
    businessEntity: "UT",
    department: "Sales",
    requester: "周八",
    requesterNo: "EMP005",
    currentApprover: null,
    status: "REJECTED",
    prType: "常规采购",
    priority: "NORMAL",
    poGenerated: "NOT_GENERATED",
    created: "2024-01-08T10:45:00Z",
    expectedDeliveryDate: "2024-01-30",
    targetWarehouses: ["Main Warehouse - LA"],
    skuCount: 8,
    totalQty: 200,
    estimatedAmount: 5000.00,
    currency: "USD",
    updated: "2024-01-10T09:20:00Z",
    exceptions: [],
    budgetProject: "Sales-Support",
    notes: "销售支持物料",
  },
  {
    id: "6",
    prNo: "PR202401110001",
    businessNo: "REQ-2024-006",
    businessEntity: "UF",
    department: "IT",
    requester: "吴九",
    requesterNo: "EMP006",
    currentApprover: null,
    status: "CANCELLED",
    prType: "项目采购",
    priority: "NORMAL",
    poGenerated: "NOT_GENERATED",
    created: "2024-01-11T14:30:00Z",
    expectedDeliveryDate: "2024-02-01",
    targetWarehouses: ["East DC - NY"],
    skuCount: 12,
    totalQty: 300,
    estimatedAmount: 15000.00,
    currency: "USD",
    updated: "2024-01-11T16:00:00Z",
    exceptions: [],
    budgetProject: "IT-Infrastructure",
    notes: "IT设备采购（已取消）",
  },
  {
    id: "7",
    prNo: "PR202401130001",
    businessNo: "REQ-2024-007",
    businessEntity: "UT",
    department: "Sales",
    requester: "刘十",
    requesterNo: "EMP007",
    currentApprover: null,
    status: "SUBMITTED",
    prType: "常规采购",
    priority: "NORMAL",
    poGenerated: "NOT_GENERATED",
    created: "2024-01-13T09:00:00Z",
    expectedDeliveryDate: "2024-01-28",
    targetWarehouses: ["Main Warehouse - LA"],
    skuCount: 20,
    totalQty: 600,
    estimatedAmount: 18000.00,
    currency: "USD",
    updated: "2024-01-13T09:00:00Z",
    exceptions: [],
    budgetProject: "Sales-Q1",
    notes: "销售团队办公用品采购",
  },
  {
    id: "8",
    prNo: "PR202401140001",
    businessNo: "PROJ-2024-008",
    businessEntity: "UF",
    department: "Product Team",
    requester: "陈十一",
    requesterNo: "EMP008",
    currentApprover: "王总监",
    status: "SUBMITTED",
    prType: "项目采购",
    priority: "URGENT",
    poGenerated: "NOT_GENERATED",
    created: "2024-01-14T11:30:00Z",
    expectedDeliveryDate: "2024-01-26",
    targetWarehouses: ["East DC - NY", "Central WH - Chicago"],
    skuCount: 35,
    totalQty: 1000,
    estimatedAmount: 32000.00,
    currency: "USD",
    updated: "2024-01-14T11:30:00Z",
    exceptions: [],
    budgetProject: "Product-Development",
    notes: "新产品开发所需原材料",
  },
  {
    id: "9",
    prNo: "PR202401150001",
    businessNo: "PROJ-2024-009",
    businessEntity: "UT",
    department: "Operations",
    requester: "李十二",
    requesterNo: "EMP009",
    currentApprover: null,
    status: "PARTIAL_PO",
    prType: "常规采购",
    priority: "NORMAL",
    poGenerated: "PARTIALLY_GENERATED",
    created: "2024-01-15T10:00:00Z",
    expectedDeliveryDate: "2024-01-30",
    targetWarehouses: ["Main Warehouse - LA"],
    skuCount: 25,
    totalQty: 800,
    estimatedAmount: 22000.00,
    currency: "USD",
    updated: "2024-01-15T15:30:00Z",
    exceptions: [],
    budgetProject: "Operations-Q1",
    notes: "部分商品已生成PO",
    lineItems: [
      {
        id: "9",
        lineNo: 1,
        skuCode: "SKU009",
        productName: "Dell Laptop",
        specifications: "15-inch i7 16GB",
        quantity: 30,
        unit: "PCS",
        estimatedUnitPrice: 120.00,
        supplier: "Dell Technologies",
      },
      {
        id: "10",
        lineNo: 2,
        skuCode: "SKU010",
        productName: "HP Printer",
        specifications: "LaserJet Pro M404n",
        quantity: 10,
        unit: "PCS",
        estimatedUnitPrice: 150.00,
        supplier: "HP Inc.",
      },
    ],
  },
  {
    id: "10",
    prNo: "PR202401160001",
    businessNo: "REQ-2024-010",
    businessEntity: "UF",
    department: "Sales",
    requester: "王十三",
    requesterNo: "EMP010",
    currentApprover: null,
    status: "FULL_PO",
    prType: "备货",
    priority: "NORMAL",
    poGenerated: "FULLY_GENERATED",
    created: "2024-01-16T09:30:00Z",
    expectedDeliveryDate: "2024-02-01",
    targetWarehouses: ["East DC - NY"],
    skuCount: 18,
    totalQty: 600,
    estimatedAmount: 16000.00,
    currency: "USD",
    updated: "2024-01-16T16:00:00Z",
    exceptions: [],
    budgetProject: "Sales-Inventory",
    notes: "所有商品已转为PO",
  },
  {
    id: "11",
    prNo: "PR202401170001",
    businessNo: "PROJ-2024-011",
    businessEntity: "UT",
    department: "IT",
    requester: "李十四",
    requesterNo: "EMP011",
    currentApprover: null,
    status: "CLOSED",
    prType: "项目采购",
    priority: "NORMAL",
    poGenerated: "FULLY_GENERATED",
    created: "2024-01-17T08:00:00Z",
    expectedDeliveryDate: "2024-02-05",
    targetWarehouses: ["Central WH - Chicago"],
    skuCount: 12,
    totalQty: 400,
    estimatedAmount: 12000.00,
    currency: "USD",
    updated: "2024-01-17T17:00:00Z",
    exceptions: [],
    budgetProject: "IT-Equipment",
    notes: "项目已完成，PR已关闭",
  },
]



// 状态优先级排序 - 按照业务流程顺序
const statusPriority = {
  DRAFT: 1,        // 草稿
  SUBMITTED: 2,    // 未提交
  APPROVING: 3,    // 审批中
  APPROVED: 4,     // 通过
  REJECTED: 5,     // 拒绝
  CANCELLED: 6,    // 取消
  EXCEPTION: 7,    // 异常
  PARTIAL_PO: 8,   // 部分PO
  FULL_PO: 9,      // 已关闭
  CLOSED: 10,      // 已关闭
}

const getPriorityConfig = (t: any) => ({
  NORMAL: { label: t('normal'), color: "text-text-secondary" },
  URGENT: { label: t('urgent'), color: "text-warning" },
  VERY_URGENT: { label: t('veryUrgent'), color: "text-destructive" },
})

const getPOGeneratedConfig = (t: any) => ({
  NOT_GENERATED: { label: t('notGeneratedPO'), color: "text-text-secondary" },
  PARTIALLY_GENERATED: { label: t('partiallyGeneratedPO'), color: "text-warning" },
  FULLY_GENERATED: { label: t('fullyGeneratedPO'), color: "text-success" },
})

const getPRTypeConfig = (t: any) => ({
  "常规采购": { label: t('regularPurchase'), color: "text-text-secondary" },
  "项目采购": { label: t('projectPurchase'), color: "text-text-secondary" },
  "备货": { label: t('stockReplenishment'), color: "text-text-secondary" },
  "内部调拨": { label: t('internalTransfer'), color: "text-text-secondary" },
})

function PRPageContent() {
  const router = useRouter()
  const { t, language, setLanguage } = useI18n()

  // Status configuration with translations - using design system colors
  const statusConfig = React.useMemo(() => ({
    DRAFT: { label: t('DRAFT'), color: "text-text-secondary" },
    SUBMITTED: { label: t('SUBMITTED'), color: "text-primary" },
    APPROVING: { label: t('APPROVING'), color: "text-primary" },
    APPROVED: { label: t('APPROVED'), color: "text-success" },
    REJECTED: { label: t('REJECTED'), color: "text-destructive" },
    CANCELLED: { label: t('CANCELLED'), color: "text-text-secondary" },
    EXCEPTION: { label: t('EXCEPTION'), color: "text-destructive" },
    PARTIAL_PO: { label: t('PARTIAL_PO'), color: "text-warning" },
    FULL_PO: { label: t('FULL_PO'), color: "text-success" },
    CLOSED: { label: t('CLOSED'), color: "text-text-secondary" },
  }), [t])
  
  const priorityConfig = React.useMemo(() => getPriorityConfig(t), [t])
  const poGeneratedConfig = React.useMemo(() => getPOGeneratedConfig(t), [t])
  const prTypeConfig = React.useMemo(() => getPRTypeConfig(t), [t])
  const [searchValue, setSearchValue] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<ActiveFilter[]>([])
  const [advancedSearchValues, setAdvancedSearchValues] = React.useState<AdvancedSearchValues>({})
  const [advancedSearchFilters, setAdvancedSearchFilters] = React.useState<any[]>([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [filteredData, setFilteredData] = React.useState<PurchaseRequest[]>(mockPRs)
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(new Set())
  const [selectedRows, setSelectedRows] = React.useState<(string | number)[]>([])
  const [activeTab, setActiveTab] = React.useState<string>("all")
  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean
    action: string
    newStatus: string
    message: string
    prNo: string
  }>({
    open: false,
    action: "",
    newStatus: "",
    message: "",
    prNo: "",
  })
  const [showPODialog, setShowPODialog] = React.useState(false)
  const [currentPRForPO, setCurrentPRForPO] = React.useState<PurchaseRequest | null>(null)

  // 状态更新函数
  const updatePRStatus = (newStatus: string, message: string, action: string, prNo: string) => {
    setConfirmDialog({
      open: true,
      action,
      newStatus,
      message,
      prNo,
    })
  }

  // 确认操作
  const handleConfirmAction = (reason?: string) => {
    console.log(`${confirmDialog.message} PR ${confirmDialog.prNo}, 新状态: ${confirmDialog.newStatus}`)
    if (reason) {
      console.log(`原因: ${reason}`)
    }
    alert(`${confirmDialog.message}成功！`)
    // 实际应用中应该刷新数据或更新状态
  }

  // 处理PO生成
  const handlePOGeneration = (data: any) => {
    console.log("生成PO数据:", data)
    alert(`成功生成PO！选择了 ${data.selectedItems.length} 个商品行`)
    setShowPODialog(false)
    setCurrentPRForPO(null)
    // 实际应用中应该调用API生成PO
  }

  // Define filter configurations - memoized for language changes
  const filterConfigs: FilterConfig[] = React.useMemo(() => [
    {
      id: "status",
      label: t('prStatus'),
      type: "multiple",
      options: [
        { id: "draft", label: t('draft'), value: "DRAFT" },
        { id: "submitted", label: t('submitted'), value: "SUBMITTED" },
        { id: "approving", label: t('approving'), value: "APPROVING" },
        { id: "approved", label: t('approved'), value: "APPROVED" },
        { id: "rejected", label: t('rejected'), value: "REJECTED" },
        { id: "cancelled", label: t('cancelled'), value: "CANCELLED" },
        { id: "exception", label: t('exception'), value: "EXCEPTION" },
        { id: "partial_po", label: t('partialPO'), value: "PARTIAL_PO" },
        { id: "full_po", label: t('fullPO'), value: "FULL_PO" },
        { id: "closed", label: t('closed'), value: "CLOSED" },
      ],
    },
    {
      id: "businessEntity",
      label: t('businessEntity'),
      type: "multiple",
      options: [
        { id: "ut", label: "UT", value: "UT" },
        { id: "uf", label: "UF", value: "UF" },
        { id: "item", label: "ITEM", value: "ITEM" },
        { id: "lso", label: "LSO", value: "LSO" },
      ],
    },
    {
      id: "department",
      label: t('department'),
      type: "multiple",
      options: [
        { id: "ecom", label: "ECOM Dept", value: "ECOM Dept" },
        { id: "operations", label: "Operations", value: "Operations" },
        { id: "product", label: "Product Team", value: "Product Team" },
        { id: "logistics", label: "Logistics", value: "Logistics" },
        { id: "sales", label: "Sales", value: "Sales" },
        { id: "it", label: "IT", value: "IT" },
      ],
    },
    {
      id: "priority",
      label: t('priority'),
      type: "multiple",
      options: [
        { id: "normal", label: t('normal'), value: "NORMAL" },
        { id: "urgent", label: t('urgent'), value: "URGENT" },
        { id: "very_urgent", label: t('veryUrgent'), value: "VERY_URGENT" },
      ],
    },
    {
      id: "poGenerated",
      label: t('poGenerationStatus'),
      type: "multiple",
      options: [
        { id: "not_generated", label: t('notGeneratedPO'), value: "NOT_GENERATED" },
        { id: "partially_generated", label: t('partiallyGeneratedPO'), value: "PARTIALLY_GENERATED" },
        { id: "fully_generated", label: t('fullyGeneratedPO'), value: "FULLY_GENERATED" },
      ],
    },
    {
      id: "prType",
      label: t('prType'),
      type: "multiple",
      options: [
        { id: "regular", label: t('regularPurchase'), value: "常规采购" },
        { id: "project", label: t('projectPurchase'), value: "项目采购" },
        { id: "stock", label: t('stockReplenishment'), value: "备货" },
        { id: "transfer", label: t('internalTransfer'), value: "内部调拨" },
      ],
    },
    {
      id: "exception",
      label: t('exceptionMark'),
      type: "single",
      options: [
        { id: "all", label: t('all'), value: "all" },
        { id: "normal", label: t('normal'), value: "normal" },
        { id: "exception", label: t('exception'), value: "exception" },
      ],
    },
  ], [t])

  // Advanced search field configurations - memoized for language changes
  const advancedSearchFields: SearchField[] = React.useMemo(() => [
    { 
      id: "prNo", 
      label: t('prNumber'), 
      placeholder: "PR202401100001\nPR202401100002\nPR202401100003",
      type: "batch",
      maxItems: 100
    },
    { 
      id: "businessNo", 
      label: t('businessNumber'), 
      placeholder: t('exampleBusinessNumber')
    },
    { id: "requester", label: t('requester'), placeholder: t('enterName') },
    { id: "requesterNo", label: t('requesterNumber'), placeholder: t('exampleEmployeeNumber') },
    { id: "currentApprover", label: t('currentApprover'), placeholder: t('enterApproverName') },
    { id: "budgetProject", label: t('budgetProject'), placeholder: t('exampleBudgetProject') },
  ], [t])

  // Calculate status counts
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      all: mockPRs.length,
      DRAFT: 0,
      SUBMITTED: 0,
      APPROVING: 0,
      APPROVED: 0,
      REJECTED: 0,
      CANCELLED: 0,
      EXCEPTION: 0,
      PARTIAL_PO: 0,
      FULL_PO: 0,
      CLOSED: 0,
    }
    mockPRs.forEach(pr => {
      counts[pr.status] = (counts[pr.status] || 0) + 1
    })
    return counts
  }, [])

  // Filter logic
  React.useEffect(() => {
    let filtered = mockPRs

    // Tab filter (status)
    if (activeTab !== "all") {
      filtered = filtered.filter(pr => pr.status === activeTab)
    }

    // Simple search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase()
      filtered = filtered.filter(pr => 
        pr.prNo.toLowerCase().includes(searchLower) ||
        pr.businessNo.toLowerCase().includes(searchLower) ||
        pr.requester.toLowerCase().includes(searchLower) ||
        pr.requesterNo.toLowerCase().includes(searchLower) ||
        pr.department.toLowerCase().includes(searchLower) ||
        pr.businessEntity.toLowerCase().includes(searchLower) ||
        pr.budgetProject.toLowerCase().includes(searchLower) ||
        pr.notes.toLowerCase().includes(searchLower)
      )
    }

    // Advanced search filter
    if (Object.keys(advancedSearchValues).length > 0) {
      filtered = filtered.filter(pr => {
        return Object.entries(advancedSearchValues).every(([key, value]) => {
          const prValue = pr[key as keyof PurchaseRequest]
          
          // 处理批量搜索（数组）
          if (Array.isArray(value)) {
            if (typeof prValue === 'string') {
              return value.some(v => prValue.toLowerCase().includes(v.toLowerCase()))
            }
            return false
          }
          
          // 处理普通搜索（字符串）
          if (typeof prValue === 'string' && typeof value === 'string') {
            return prValue.toLowerCase().includes(value.toLowerCase())
          }
          return false
        })
      })
    }

    // Apply active filters
    activeFilters.forEach(filter => {
      if (filter.filterId === "status") {
        filtered = filtered.filter(pr => pr.status === filter.optionValue)
      } else if (filter.filterId === "businessEntity") {
        filtered = filtered.filter(pr => pr.businessEntity === filter.optionValue)
      } else if (filter.filterId === "department") {
        filtered = filtered.filter(pr => pr.department === filter.optionValue)
      } else if (filter.filterId === "priority") {
        filtered = filtered.filter(pr => pr.priority === filter.optionValue)
      } else if (filter.filterId === "poGenerated") {
        filtered = filtered.filter(pr => pr.poGenerated === filter.optionValue)
      } else if (filter.filterId === "prType") {
        filtered = filtered.filter(pr => pr.prType === filter.optionValue)
      } else if (filter.filterId === "exception") {
        if (filter.optionValue === "normal") {
          filtered = filtered.filter(pr => pr.exceptions.length === 0)
        } else if (filter.optionValue === "exception") {
          filtered = filtered.filter(pr => pr.exceptions.length > 0)
        }
      }
    })

    // 在"全部"标签页中按状态优先级排序
    if (activeTab === "all") {
      filtered = filtered.sort((a, b) => {
        const priorityA = statusPriority[a.status as keyof typeof statusPriority] || 999
        const priorityB = statusPriority[b.status as keyof typeof statusPriority] || 999
        
        // 首先按状态优先级排序
        if (priorityA !== priorityB) {
          return priorityA - priorityB
        }
        
        // 状态相同时按创建时间倒序排序（最新的在前）
        return new Date(b.created).getTime() - new Date(a.created).getTime()
      })
    } else {
      // 其他标签页按创建时间倒序排序
      filtered = filtered.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    }

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchValue, activeFilters, advancedSearchValues, activeTab])

  // Define columns with default visibility - reorganized based on create page - memoized for language changes
  const allColumns: Column<PurchaseRequest>[] = React.useMemo(() => [
    {
      id: "prNo",
      header: t('prNo'),
      accessorKey: "prNo",
      width: "150px",
      defaultVisible: true,
      cell: (row) => (
        <OrderNumberCell 
          orderNumber={row.prNo} 
          onClick={() => router.push(`/purchase/pr/${row.id}`)}
        />
      ),
    },
    {
      id: "status",
      header: t('status'),
      width: "100px",
      defaultVisible: true,
      cell: (row) => {
        const config = statusConfig[row.status as keyof typeof statusConfig]
        if (!config) {
          return <span className="text-text-secondary text-xs">未知状态</span>
        }
        
        // 根据状态类型返回对应颜色的Badge
        const getBadgeColor = () => {
          switch (row.status) {
            case 'APPROVED':
            case 'FULL_PO':
            case 'CLOSED':
              return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            case 'APPROVING':
            case 'PARTIAL_PO':
              return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            case 'REJECTED':
            case 'CANCELLED':
            case 'EXCEPTION':
              return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            case 'DRAFT':
            case 'SUBMITTED':
            default:
              return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
          }
        }
        
        return (
          <Badge className={`text-xs ${getBadgeColor()}`}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      id: "department",
      header: t('department'),
      accessorKey: "department",
      width: "150px",
      defaultVisible: true,
      cell: (row) => <span className="text-xs">{row.department}</span>,
    },
    {
      id: "requester",
      header: t('requester'),
      width: "120px",
      defaultVisible: true,
      cell: (row) => (
        <div title={`工号: ${row.requesterNo}`}>
          <div className="font-medium text-xs">{row.requester}</div>
          <div className="text-xs text-muted-foreground">{row.requesterNo}</div>
        </div>
      ),
    },
    {
      id: "prType",
      header: t('prType'),
      accessorKey: "prType",
      width: "120px",
      defaultVisible: true,
      cell: (row) => {
        const config = prTypeConfig[row.prType as keyof typeof prTypeConfig]
        if (!config) {
          return <span className="text-text-secondary text-xs">{row.prType}</span>
        }
        return (
          <span className={`${config.color} text-xs`}>
            {config.label}
          </span>
        )
      },
    },
    {
      id: "priority",
      header: t('priority'),
      width: "100px",
      defaultVisible: true,
      cell: (row) => {
        const config = priorityConfig[row.priority]
        return (
          <span className={`${config.color} text-xs`}>
            {config.label}
          </span>
        )
      },
    },
    {
      id: "targetWarehouses",
      header: t('targetWarehouses'),
      width: "180px",
      defaultVisible: true,
      cell: (row) => (
        <div>
          {row.targetWarehouses.length === 1 ? (
            <span className="text-xs">{row.targetWarehouses[0]}</span>
          ) : (
            <span title={row.targetWarehouses.join(", ")} className="text-xs">
              {t('multiWarehouse')}（{row.targetWarehouses.length}）
            </span>
          )}
        </div>
      ),
    },
    {
      id: "expectedDeliveryDate",
      header: t('expectedDeliveryDate'),
      accessorKey: "expectedDeliveryDate",
      width: "130px",
      defaultVisible: true,
    },
    {
      id: "skuCount",
      header: t('skuCount'),
      accessorKey: "skuCount",
      width: "100px",
      defaultVisible: true,
    },
    {
      id: "totalQty",
      header: t('totalQty'),
      accessorKey: "totalQty",
      width: "100px",
      defaultVisible: true,
      cell: (row) => row.totalQty.toLocaleString(),
    },
    {
      id: "estimatedAmount",
      header: t('estimatedAmount'),
      width: "120px",
      defaultVisible: true,
      cell: (row) => `${row.currency} ${row.estimatedAmount.toLocaleString()}`,
    },
    {
      id: "created",
      header: t('created'),
      width: "150px",
      defaultVisible: true,
      cell: (row) => new Date(row.created).toLocaleString(),
    },
    {
      id: "exceptions",
      header: t('exceptionMark'),
      width: "100px",
      defaultVisible: false,
      cell: (row) => (
        row.exceptions.length > 0 ? (
          <div className="flex items-center gap-xs text-destructive text-xs" title={row.exceptions.join(", ")}>
            <AlertTriangle className="h-4 w-4" />
            <span>{row.exceptions.length}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      id: "businessEntity",
      header: t('businessEntity'),
      accessorKey: "businessEntity",
      width: "120px",
      defaultVisible: false,
    },
    {
      id: "poGenerated",
      header: t('poGenerationStatus'),
      width: "150px",
      defaultVisible: false,
      cell: (row) => {
        const config = poGeneratedConfig[row.poGenerated]
        return (
          <span className={config.color}>
            {config.label}
          </span>
        )
      },
    },
    {
      id: "updated",
      header: t('latestUpdateTime'),
      width: "150px",
      defaultVisible: false,
      cell: (row) => new Date(row.updated).toLocaleString(),
    },
    {
      id: "businessNo",
      header: t('businessNo'),
      accessorKey: "businessNo",
      width: "150px",
      defaultVisible: false,
    },
    {
      id: "currentApprover",
      header: t('currentApprover'),
      accessorKey: "currentApprover",
      width: "120px",
      defaultVisible: false,
      cell: (row) => row.currentApprover || "-",
    },

    {
      id: "budgetProject",
      header: t('budgetProjectCostCenter'),
      accessorKey: "budgetProject",
      width: "180px",
      defaultVisible: false,
    },
    {
      id: "notes",
      header: t('notes'),
      accessorKey: "notes",
      width: "200px",
      defaultVisible: false,
    },
    {
      id: "poInfo",
      header: t('relatedPOInfo'),
      width: "200px",
      defaultVisible: false,
      cell: (row) => {
        // Mock PO data based on status
        if (row.status === "PARTIAL_PO" || row.status === "FULL_PO" || row.status === "CLOSED") {
          const mockPOs = [
            { poNo: "PO202401150001", status: "CONFIRMED", amount: 15000 },
            { poNo: "PO202401150002", status: "PENDING", amount: 8500 }
          ]
          
          return (
            <div className="space-y-1">
              {mockPOs.map((po, index) => (
                <div key={index} className="text-xs">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{po.poNo}</span>
                    <span className={`text-xs ${
                      po.status === "CONFIRMED" ? "text-success" :
                      po.status === "PENDING" ? "text-warning" :
                      "text-text-secondary"
                    }`}>
                      {po.status === "CONFIRMED" ? t('confirmed') :
                       po.status === "PENDING" ? t('pending') : t('unknown')}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    USD {po.amount.toLocaleString()}
                  </div>
                </div>
              ))}
              <div className="text-xs text-primary cursor-pointer hover:underline">
                {t('viewAll')} ({mockPOs.length})
              </div>
            </div>
          )
        }
        return <span className="text-muted-foreground text-xs">-</span>
      },
    },
    {
      id: "actions",
      header: t('actions'),
      width: "80px",
      defaultVisible: true,
      cell: (row) => {
        // Define available actions based on status
        const getAvailableActions = () => {
          switch (row.status) {
            case "DRAFT":
              return [
                { label: t('viewDetails'), action: () => router.push(`/purchase/pr/${row.id}`) },
                { label: t('edit'), action: () => router.push(`/purchase/pr/${row.id}/edit`) },
                { label: t('submit'), action: () => updatePRStatus("SUBMITTED", t('submit'), "submit", row.prNo) },
                { label: t('copy'), action: () => router.push(`/purchase/pr/create?copy=${row.id}`) },
                { label: t('delete'), action: () => updatePRStatus("DELETED", t('delete'), "delete", row.prNo), variant: "destructive" },
              ]
            case "SUBMITTED":
              return [
                { label: t('viewDetails'), action: () => router.push(`/purchase/pr/${row.id}`) },
                { label: t('edit'), action: () => router.push(`/purchase/pr/${row.id}/edit`) },
                { label: t('submitForApproval'), action: () => updatePRStatus("APPROVING", t('submitForApproval'), "submit", row.prNo) },
                { label: t('cancel'), action: () => updatePRStatus("CANCELLED", t('cancel'), "cancel", row.prNo), variant: "destructive" },
              ]
            case "APPROVING":
              return [
                { label: t('viewDetails'), action: () => router.push(`/purchase/pr/${row.id}`) },
                { label: t('approve'), action: () => updatePRStatus("APPROVED", t('approve'), "approve", row.prNo) },
                { label: t('reject'), action: () => updatePRStatus("REJECTED", t('reject'), "reject", row.prNo), variant: "destructive" },
              ]
            case "APPROVED":
              return [
                { label: t('viewDetails'), action: () => router.push(`/purchase/pr/${row.id}`) },
                { label: t('generatePO'), action: () => setShowPODialog(true), prId: row.id },
                { label: t('copy'), action: () => router.push(`/purchase/pr/create?copy=${row.id}`) },
              ]
            case "REJECTED":
              return [
                { label: t('viewDetails'), action: () => router.push(`/purchase/pr/${row.id}`) },
                { label: t('edit'), action: () => router.push(`/purchase/pr/${row.id}/edit`) },
                { label: t('copy'), action: () => router.push(`/purchase/pr/create?copy=${row.id}`) },
              ]
            case "CANCELLED":
              return [
                { label: t('viewDetails'), action: () => router.push(`/purchase/pr/${row.id}`) },
                { label: t('copy'), action: () => router.push(`/purchase/pr/create?copy=${row.id}`) },
              ]
            case "EXCEPTION":
              return [
                { label: t('viewDetails'), action: () => router.push(`/purchase/pr/${row.id}`) },
                { label: t('fix'), action: () => router.push(`/purchase/pr/${row.id}/edit`) },
                { label: t('cancel'), action: () => updatePRStatus("CANCELLED", t('cancel'), "cancel", row.prNo), variant: "destructive" },
              ]
            case "PARTIAL_PO":
              return [
                { label: t('viewDetails'), action: () => router.push(`/purchase/pr/${row.id}`) },
                { label: t('continueGeneratePO'), action: () => setShowPODialog(true), prId: row.id },
                { label: t('cancelUnlinkedItems'), action: () => updatePRStatus("FULL_PO", t('cancelUnlinkedItems'), "cancelUnlinkedPO", row.prNo), variant: "destructive" },
              ]
            case "FULL_PO":
              return [
                { label: t('viewDetails'), action: () => router.push(`/purchase/pr/${row.id}`) },
              ]
            case "CLOSED":
              return [
                { label: t('viewDetails'), action: () => router.push(`/purchase/pr/${row.id}`) },
              ]
            default:
              return [
                { label: t('viewDetails'), action: () => router.push(`/purchase/pr/${row.id}`) },
              ]
          }
        }

        const actions = getAvailableActions()

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
                    onClick={() => {
                      if (action.prId) {
                        // 如果是生成PO操作，设置当前PR并打开对话框
                        setCurrentPRForPO(row)
                        setShowPODialog(true)
                      } else {
                        action.action()
                      }
                    }}
                    className={`text-sm ${
                      action.variant === "destructive" 
                        ? "text-destructive focus:text-destructive focus:bg-destructive/10" 
                        : ""
                    }`}
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
  ], [t, statusConfig, router, setShowPODialog, updatePRStatus])

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
    label: col.header,
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

  // Get selected rows data and their statuses
  const selectedRowsData = React.useMemo(() => {
    return filteredData.filter(row => selectedRows.includes(row.id))
  }, [filteredData, selectedRows])

  const selectedStatuses = React.useMemo(() => {
    return [...new Set(selectedRowsData.map(row => row.status))]
  }, [selectedRowsData])

  // Determine available batch actions based on selected statuses
  const availableBatchActions = React.useMemo(() => {
    if (selectedRows.length === 0) return []

    // If all selected rows have the same status
    if (selectedStatuses.length === 1) {
      const status = selectedStatuses[0]
      switch (status) {
        case "DRAFT":
          return [
            { label: t('batchSubmit'), icon: <Send className="h-4 w-4" />, action: () => console.log("Batch submit", selectedRows) },
            { label: t('batchCancel'), icon: <XCircle className="h-4 w-4" />, action: () => console.log("Batch cancel", selectedRows), variant: "destructive" },
          ]
        case "SUBMITTED":
          return [
            { label: t('batchSubmit'), icon: <Send className="h-4 w-4" />, action: () => console.log("Batch submit", selectedRows) },
            { label: t('batchCancel'), icon: <XCircle className="h-4 w-4" />, action: () => console.log("Batch cancel", selectedRows), variant: "destructive" },
          ]
        case "APPROVING":
          return [
            { label: t('batchApprove'), icon: <Send className="h-4 w-4" />, action: () => console.log("Batch approve", selectedRows) },
            { label: t('batchReject'), icon: <XCircle className="h-4 w-4" />, action: () => console.log("Batch reject", selectedRows), variant: "destructive" },
          ]
        case "APPROVED":
          return [
            { label: t('batchGeneratePO'), icon: <Send className="h-4 w-4" />, action: () => console.log("Batch generate PO", selectedRows) },
          ]
        case "FULL_PO":
          return []
        default:
          return []
      }
    }

    // If selected rows have mixed statuses, only show common actions
    return [
      { label: t('batchExport'), icon: <Download className="h-4 w-4" />, action: () => console.log("Batch export", selectedRows) },
    ]
  }, [selectedRows, selectedStatuses])

  const sidebarItems = createPurchaseSidebarItems(t)

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
              {language === 'zh' ? '采购申请' : 'Purchase Request'}
            </h1>
            <p className="text-sm text-text-secondary mt-sm">
              {language === 'zh' ? 
                '创建和管理采购申请，支持审批流程和PO生成，实现采购需求的标准化管理' : 
                'Create and manage purchase requests with approval workflows and PO generation for standardized procurement management'
              }
            </p>
          </div>
          <div className="flex items-center gap-4">
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => console.log("Export", selectedRows.length > 0 ? selectedRows : "all")}
              className="text-sm font-normal"
            >
              <Download className="mr-2 h-4 w-4" />
              {selectedRows.length > 0 ? `${t('export')} (${selectedRows.length})` : t('export')}
            </Button>

            {/* New PR Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('newPR')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/purchase/pr/create")}>
                  <FilePlus className="mr-2 h-4 w-4" />
                  {t('createManually')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Import from file")}>
                  <Upload className="mr-2 h-4 w-4" />
                  {t('importFromFile')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => console.log("Download template")}>
                  <FileDown className="mr-2 h-4 w-4" />
                  {t('downloadTemplate')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              {t('all')} 
              <Badge 
                variant="secondary" 
                className={cn(
                  "ml-2",
                  activeTab === "all" && "bg-primary-foreground/20 text-primary-foreground border-0"
                )}
              >
                {statusCounts.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="DRAFT">
              {t('DRAFT')} 
              <Badge 
                variant="secondary" 
                className={cn(
                  "ml-2",
                  activeTab === "DRAFT" && "bg-primary-foreground/20 text-primary-foreground border-0"
                )}
              >
                {statusCounts.DRAFT}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="SUBMITTED">
              {t('SUBMITTED')} 
              <Badge 
                variant="secondary" 
                className={cn(
                  "ml-2",
                  activeTab === "SUBMITTED" && "bg-primary-foreground/20 text-primary-foreground border-0"
                )}
              >
                {statusCounts.SUBMITTED}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="APPROVING">
              {t('APPROVING')} 
              <Badge 
                variant="secondary" 
                className={cn(
                  "ml-2",
                  activeTab === "APPROVING" && "bg-primary-foreground/20 text-primary-foreground border-0"
                )}
              >
                {statusCounts.APPROVING}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="APPROVED">
              {t('APPROVED')} 
              <Badge 
                variant="secondary" 
                className={cn(
                  "ml-2",
                  activeTab === "APPROVED" && "bg-primary-foreground/20 text-primary-foreground border-0"
                )}
              >
                {statusCounts.APPROVED}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="REJECTED">
              {t('REJECTED')} 
              <Badge 
                variant="secondary" 
                className={cn(
                  "ml-2",
                  activeTab === "REJECTED" && "bg-primary-foreground/20 text-primary-foreground border-0"
                )}
              >
                {statusCounts.REJECTED}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="CANCELLED">
              {t('CANCELLED')} 
              <Badge 
                variant="secondary" 
                className={cn(
                  "ml-2",
                  activeTab === "CANCELLED" && "bg-primary-foreground/20 text-primary-foreground border-0"
                )}
              >
                {statusCounts.CANCELLED}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="EXCEPTION">
              {t('EXCEPTION')} 
              <Badge 
                variant="secondary" 
                className={cn(
                  "ml-2",
                  activeTab === "EXCEPTION" && "bg-primary-foreground/20 text-primary-foreground border-0"
                )}
              >
                {statusCounts.EXCEPTION}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="PARTIAL_PO">
              {t('PARTIAL_PO')} 
              <Badge 
                variant="secondary" 
                className={cn(
                  "ml-2",
                  activeTab === "PARTIAL_PO" && "bg-primary-foreground/20 text-primary-foreground border-0"
                )}
              >
                {statusCounts.PARTIAL_PO}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="FULL_PO">
              {t('FULL_PO')} 
              <Badge 
                variant="secondary" 
                className={cn(
                  "ml-2",
                  activeTab === "FULL_PO" && "bg-primary-foreground/20 text-primary-foreground border-0"
                )}
              >
                {statusCounts.FULL_PO}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="CLOSED">
              {t('CLOSED')} 
              <Badge 
                variant="secondary" 
                className={cn(
                  "ml-2",
                  activeTab === "CLOSED" && "bg-primary-foreground/20 text-primary-foreground border-0"
                )}
              >
                {statusCounts.CLOSED}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search and Filters */}
        <FilterBar
          searchPlaceholder={t('searchPlaceholder')}
          onSearchChange={setSearchValue}
          filters={filterConfigs}
          onFiltersChange={setActiveFilters}
          columns={columnConfigs}
          onColumnsChange={handleColumnsChange}
          advancedSearchFields={advancedSearchFields}
          onAdvancedSearch={(values, filters) => {
            setAdvancedSearchValues(values)
            setAdvancedSearchFilters(filters || [])
          }}
        />

        {/* Batch Operations Bar */}
        {selectedRows.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {t('selected')} <span className="text-primary">{selectedRows.length}</span> {t('items')}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedRows([])}
                    className="h-8 text-xs"
                  >
                    {t('clearSelection')}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => console.log("Batch export", selectedRows)}
                  >
                    <Download className="h-4 w-4" />
                    {t('batchExport')}
                  </Button>
                  {selectedStatuses.length === 1 && selectedStatuses[0] === "APPROVING" && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => console.log("Batch approve", selectedRows)}
                      >
                        <Send className="h-4 w-4" />
                        {t('batchApprove')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 text-destructive hover:text-destructive"
                        onClick={() => console.log("Batch reject", selectedRows)}
                      >
                        <XCircle className="h-4 w-4" />
                        {t('batchReject')}
                      </Button>
                    </>
                  )}
                  {selectedStatuses.length === 1 && selectedStatuses[0] === "APPROVED" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => console.log("Batch generate PO", selectedRows)}
                    >
                      <Send className="h-4 w-4" />
                      {t('batchGeneratePO')}
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        {t('moreActions')}
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {selectedStatuses.length === 1 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            {t('statusLabel')}: {statusConfig[selectedStatuses[0] as keyof typeof statusConfig]?.label}
                          </div>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {selectedStatuses.length > 1 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            {t('mixedStatus')} ({selectedStatuses.length} {t('types')})
                          </div>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {availableBatchActions.length > 0 ? (
                        availableBatchActions.map((action, index) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={action.action}
                            className={action.variant === "destructive" ? "text-destructive" : ""}
                          >
                            <span className="mr-2">{action.icon}</span>
                            {action.label}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                          {t('noAvailableActions')}
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        <Card>
          <CardContent className="pt-6">
            <DataTable
              data={filteredData}
              columns={visibleColumnsList}
              currentPage={currentPage}
              totalItems={filteredData.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              onSelectionChange={setSelectedRows}
              selectedRows={selectedRows}
              onRowClick={(row) => router.push(`/purchase/pr/${row.id}`)}
              hideColumnControl={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Action Confirmation Dialog */}
      <PRActionConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        action={confirmDialog.action}
        prNo={confirmDialog.prNo}
        onConfirm={handleConfirmAction}
      />

      {/* PO Generation Dialog */}
      {currentPRForPO && (
        <SimplePODialog
          open={showPODialog}
          onOpenChange={setShowPODialog}
          lineItems={currentPRForPO.lineItems || []}
          prNo={currentPRForPO.prNo}
          onConfirm={handlePOGeneration}
        />
      )}
    </MainLayout>
  )
}

export default function PRPage() {
  return <PRPageContent />
}
