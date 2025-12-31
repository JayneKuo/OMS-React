"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, Column } from "@/components/data-table/data-table"
import { DataTableWithStickyHeader } from "@/components/data-table/data-table-with-sticky-header"
import { FilterBar, FilterConfig, ActiveFilter } from "@/components/data-table/filter-bar"
import { SearchField, AdvancedSearchValues } from "@/components/data-table/advanced-search-dialog"
import { OrderNumberCell } from "@/components/ui/order-number-cell"
import { 
  Download, Plus, Package, ArrowLeft, RefreshCw, Edit, Send,
  FileText, Building, Clock, MapPin, Phone, Truck, ShoppingCart, Home, User, Info, Sun, Moon,
  MoreVertical, Eye, Trash2, X
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useMemo, useEffect } from "react"
import { useTheme } from "next-themes"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

// Generate 100 mock orders
const generateMockOrders = () => {
  const customers = [
    '北京科技有限公司', '上海贸易公司', '深圳电子厂', '广州物流中心', '成都制造有限公司',
    '杭州互联网科技', '南京医疗器械公司', '武汉光电研究所', '西安航天科技', '天津港务集团',
    '重庆汽车制造', '苏州工业园区', '青岛海运集团', '大连化工有限', '长沙建材公司',
    '郑州食品加工', '济南机械制造', '福州电子商务', '厦门进出口贸易', '合肥新能源科技'
  ]
  
  const suppliers = [
    'ABC Suppliers Inc.', 'Global Trading Co.', 'Tech Distributors Ltd.', 'Premium Goods Supply',
    'Reliable Parts Co.', 'Digital Solutions Ltd.', 'MedTech Supplies', 'Optics International',
    'Aerospace Components', 'Marine Equipment Co.', 'Industrial Materials Ltd.', 'Smart Tech Supply',
    'Quality Products Inc.', 'Express Logistics Co.', 'Advanced Manufacturing'
  ]
  
  const addresses = [
    '北京市朝阳区建国路88号SOHO现代城A座1001室',
    '上海市浦东新区陆家嘴环路1000号',
    '深圳市南山区科技园南区深圳湾科技生态园',
    '广州市天河区珠江新城花城大道85号',
    '成都市高新区天府大道中段1366号',
    '杭州市西湖区文三路90号东部软件园',
    '南京市江宁区秣周东路9号',
    '武汉市洪山区珞喻路1037号',
    '西安市高新区锦业路1号',
    '天津市滨海新区新港二号路'
  ]
  
  const statuses: Array<'pending' | 'processing' | 'shipped' | 'completed'> = ['pending', 'processing', 'shipped', 'completed']
  
  const orders = []
  for (let i = 1; i <= 100; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const customer = customers[Math.floor(Math.random() * customers.length)]
    const supplier = suppliers[Math.floor(Math.random() * suppliers.length)]
    const address = addresses[Math.floor(Math.random() * addresses.length)]
    const amount = Math.floor(Math.random() * 50000) + 1000
    const items = Math.floor(Math.random() * 20) + 1
    const daysAgo = Math.floor(Math.random() * 90)
    const date = new Date(2024, 11, 31 - daysAgo).toISOString().split('T')[0]
    
    orders.push({
      id: String(i),
      orderNo: `ORD-2024-${String(1000 + i).padStart(4, '0')}`,
      customer,
      status,
      amount,
      date,
      items,
      address,
      supplier
    })
  }
  
  return orders
}

const mockOrders = generateMockOrders()

const statusConfig = {
  pending: { label: '待处理', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
  processing: { label: '处理中', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
  shipped: { label: '已发货', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
}

const sidebarItems = [
  { title: "仪表盘", href: "#", icon: <Home className="h-4 w-4" /> },
  { title: "订单管理", href: "/real-layout-demo", icon: <ShoppingCart className="h-4 w-4" /> },
  { title: "产品管理", href: "#", icon: <Package className="h-4 w-4" /> },
  { title: "物流管理", href: "#", icon: <Truck className="h-4 w-4" /> },
  { title: "客户管理", href: "#", icon: <User className="h-4 w-4" /> },
]

export default function RealLayoutDemo() {
  const [mounted, setMounted] = useState(false)
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [showSpecs, setShowSpecs] = useState(false)
  const [listType, setListType] = useState<"current" | "history">("current") // 一级Tab：当前/历史
  const [activeTab, setActiveTab] = useState("all") // 二级Tab：状态
  const [searchValue, setSearchValue] = useState("")
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [advancedSearchValues, setAdvancedSearchValues] = useState<AdvancedSearchValues>({})
  const [advancedSearchFilters, setAdvancedSearchFilters] = useState<any[]>([])
  const [filteredData, setFilteredData] = useState(mockOrders)
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set())
  const { theme, setTheme } = useTheme()

  // 等待客户端挂载
  useEffect(() => {
    setMounted(true)
  }, [])

  const selectedOrder = mockOrders.find(o => o.id === selectedOrderId)

  // Filter data based on tab, search, and filters
  useMemo(() => {
    let filtered = mockOrders

    // List type filter (current vs history)
    if (listType === "history") {
      // 历史订单：只显示已完成和已取消的订单（假设completed是历史状态）
      filtered = filtered.filter(o => o.status === "completed")
    } else {
      // 当前订单：排除已完成的订单
      filtered = filtered.filter(o => o.status !== "completed")
    }

    // Tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter(o => o.status === activeTab)
    }

    // Search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase()
      filtered = filtered.filter(o => 
        o.orderNo.toLowerCase().includes(searchLower) ||
        o.customer.toLowerCase().includes(searchLower)
      )
    }

    // Active filters
    activeFilters.forEach(filter => {
      if (filter.filterId === "status") {
        filtered = filtered.filter(o => o.status === filter.optionValue)
      } else if (filter.filterId === "customer") {
        filtered = filtered.filter(o => o.customer === filter.optionValue)
      }
    })

    // Advanced search
    if (Object.keys(advancedSearchValues).length > 0) {
      filtered = filtered.filter(o => {
        return Object.entries(advancedSearchValues).every(([key, value]) => {
          // 处理批量搜索（数组）
          if (Array.isArray(value)) {
            const orderValue = o[key as keyof typeof o]
            if (typeof orderValue === 'string') {
              return value.some(v => orderValue.toLowerCase().includes(v.toLowerCase()))
            }
            return false
          }
          // 处理普通搜索（字符串）
          const orderValue = o[key as keyof typeof o]
          if (typeof orderValue === 'string') {
            return orderValue.toLowerCase().includes(value.toLowerCase())
          }
          return false
        })
      })
    }

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [activeTab, searchValue, activeFilters, advancedSearchValues, listType]) // 添加listType依赖

  // Paginated data - 根据当前页和每页数量切片数据
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  // Status counts - 根据listType计算
  const statusCounts = useMemo(() => {
    const dataToCount = listType === "history" 
      ? mockOrders.filter(o => o.status === "completed")
      : mockOrders.filter(o => o.status !== "completed")
    
    const counts: Record<string, number> = {
      all: dataToCount.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      completed: 0,
    }
    dataToCount.forEach(order => {
      counts[order.status] = (counts[order.status] || 0) + 1
    })
    return counts
  }, [listType])

  // Filter configs
  const filterConfigs: FilterConfig[] = [
    {
      id: "status",
      label: "状态",
      type: "multiple",
      options: [
        { id: "pending", label: "待处理", value: "pending" },
        { id: "processing", label: "处理中", value: "processing" },
        { id: "shipped", label: "已发货", value: "shipped" },
        { id: "completed", label: "已完成", value: "completed" },
      ],
    },
    {
      id: "customer",
      label: "客户",
      type: "multiple",
      options: mockOrders.map(o => ({ id: o.customer, label: o.customer, value: o.customer })),
    },
    {
      id: "supplier",
      label: "供应商",
      type: "multiple",
      options: mockOrders.map(o => ({ id: o.supplier, label: o.supplier, value: o.supplier })),
    },
    {
      id: "amount",
      label: "订单金额",
      type: "multiple",
      options: [
        { id: "0-5000", label: "0-5000元", value: "0-5000" },
        { id: "5000-10000", label: "5000-10000元", value: "5000-10000" },
        { id: "10000-20000", label: "10000-20000元", value: "10000-20000" },
        { id: "20000-50000", label: "20000-50000元", value: "20000-50000" },
        { id: "50000+", label: "50000元以上", value: "50000+" },
      ],
    },
    {
      id: "items",
      label: "商品数量",
      type: "multiple",
      options: [
        { id: "1-5", label: "1-5件", value: "1-5" },
        { id: "6-10", label: "6-10件", value: "6-10" },
        { id: "11-15", label: "11-15件", value: "11-15" },
        { id: "16-20", label: "16-20件", value: "16-20" },
        { id: "20+", label: "20件以上", value: "20+" },
      ],
    },
    {
      id: "date",
      label: "创建时间",
      type: "multiple",
      options: [
        { id: "today", label: "今天", value: "today" },
        { id: "yesterday", label: "昨天", value: "yesterday" },
        { id: "last7days", label: "最近7天", value: "last7days" },
        { id: "last30days", label: "最近30天", value: "last30days" },
        { id: "last90days", label: "最近90天", value: "last90days" },
      ],
    },
    {
      id: "region",
      label: "地区",
      type: "multiple",
      options: [
        { id: "beijing", label: "北京", value: "beijing" },
        { id: "shanghai", label: "上海", value: "shanghai" },
        { id: "guangzhou", label: "广州", value: "guangzhou" },
        { id: "shenzhen", label: "深圳", value: "shenzhen" },
        { id: "chengdu", label: "成都", value: "chengdu" },
        { id: "hangzhou", label: "杭州", value: "hangzhou" },
        { id: "nanjing", label: "南京", value: "nanjing" },
        { id: "wuhan", label: "武汉", value: "wuhan" },
      ],
    },
    {
      id: "paymentMethod",
      label: "支付方式",
      type: "multiple",
      options: [
        { id: "alipay", label: "支付宝", value: "alipay" },
        { id: "wechat", label: "微信支付", value: "wechat" },
        { id: "bank", label: "银行转账", value: "bank" },
        { id: "credit", label: "信用卡", value: "credit" },
        { id: "cod", label: "货到付款", value: "cod" },
      ],
    },
    {
      id: "shippingMethod",
      label: "配送方式",
      type: "multiple",
      options: [
        { id: "express", label: "快递配送", value: "express" },
        { id: "standard", label: "标准配送", value: "standard" },
        { id: "pickup", label: "自提", value: "pickup" },
        { id: "sameday", label: "当日达", value: "sameday" },
      ],
    },
    {
      id: "priority",
      label: "优先级",
      type: "multiple",
      options: [
        { id: "urgent", label: "紧急", value: "urgent" },
        { id: "high", label: "高", value: "high" },
        { id: "normal", label: "普通", value: "normal" },
        { id: "low", label: "低", value: "low" },
      ],
    },
    {
      id: "source",
      label: "订单来源",
      type: "multiple",
      options: [
        { id: "web", label: "网站", value: "web" },
        { id: "mobile", label: "移动端", value: "mobile" },
        { id: "api", label: "API", value: "api" },
        { id: "manual", label: "手动创建", value: "manual" },
        { id: "import", label: "批量导入", value: "import" },
      ],
    },
    {
      id: "warehouse",
      label: "仓库",
      type: "multiple",
      options: [
        { id: "wh1", label: "北京仓", value: "wh1" },
        { id: "wh2", label: "上海仓", value: "wh2" },
        { id: "wh3", label: "广州仓", value: "wh3" },
        { id: "wh4", label: "深圳仓", value: "wh4" },
        { id: "wh5", label: "成都仓", value: "wh5" },
      ],
    },
  ]

  // Advanced search fields
  const advancedSearchFields: SearchField[] = [
    { 
      id: "orderNo", 
      label: "订单编号", 
      placeholder: "ORD-2024-1001\nORD-2024-1002\nORD-2024-1003",
      type: "batch",
      maxItems: 100
    },
    { id: "customer", label: "客户名称", placeholder: "e.g., 北京科技有限公司" },
    { id: "supplier", label: "供应商名称", placeholder: "e.g., ABC Suppliers Inc." },
  ]

  // Columns
  const allColumns: Column<typeof mockOrders[0]>[] = [
    {
      id: "orderNo",
      header: "订单编号",
      accessorKey: "orderNo",
      width: "150px",
      defaultVisible: true,
      cell: (row) => (
        <OrderNumberCell 
          orderNumber={row.orderNo} 
          onClick={() => setSelectedOrderId(row.id)}
        />
      ),
    },
    {
      id: "customer",
      header: "客户名称",
      accessorKey: "customer",
      width: "200px",
      defaultVisible: true,
      cell: (row) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[200px] truncate">{row.customer}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{row.customer}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      id: "status",
      header: "状态",
      width: "120px",
      defaultVisible: true,
      cell: (row) => (
        <Badge className={statusConfig[row.status as keyof typeof statusConfig].color}>
          {statusConfig[row.status as keyof typeof statusConfig].label}
        </Badge>
      ),
    },
    {
      id: "amount",
      header: "订单金额",
      width: "120px",
      defaultVisible: true,
      cell: (row) => (
        <div className="text-right font-medium">¥{row.amount.toLocaleString()}</div>
      ),
    },
    {
      id: "date",
      header: "创建时间",
      accessorKey: "date",
      width: "120px",
      defaultVisible: true,
    },
    {
      id: "items",
      header: "商品数量",
      width: "100px",
      defaultVisible: true,
      cell: (row) => <div className="text-center">{row.items}</div>,
    },
    {
      id: "actions",
      header: "操作",
      width: "80px",
      defaultVisible: true,
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedOrderId(row.id)}>
              <Eye className="mr-2 h-4 w-4" />
              查看详情
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("编辑功能", { description: "正在打开编辑页面..." })}>
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("发送成功", { description: `订单 ${row.orderNo} 已发送给客户` })}>
              <Send className="mr-2 h-4 w-4" />
              发送
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => toast.error("删除失败", { description: "您没有权限删除此订单" })}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const visibleColumnsList = useMemo(() => {
    if (visibleColumns.size === 0) {
      return allColumns.filter(col => col.defaultVisible)
    }
    return allColumns.filter(col => visibleColumns.has(col.id))
  }, [visibleColumns])

  const columnConfigs = allColumns.map(col => ({
    id: col.id,
    label: col.header as string,
    visible: visibleColumns.size === 0 ? (col.defaultVisible || false) : visibleColumns.has(col.id),
  }))

  const handleColumnsChange = (columns: Array<{ id: string; visible: boolean }>) => {
    const newVisible = new Set(columns.filter(c => c.visible).map(c => c.id))
    setVisibleColumns(newVisible)
  }

  return (
    <TooltipProvider>
      <Toaster />
      <MainLayout sidebarItems={sidebarItems} moduleName="订单管理">
        {!selectedOrderId ? (
          // List View
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between relative">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">订单管理</h1>
                <p className="text-sm text-muted-foreground mt-2">管理和跟踪所有订单信息</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.info("导出任务已创建", { description: "正在准备导出文件，请稍候..." })}>
                  <Download className="mr-2 h-4 w-4" />
                  导出
                </Button>
                <Button size="sm" onClick={() => toast.success("订单创建成功", { description: "订单 ORD-2024-1011 已成功创建" })}>
                  <Plus className="mr-2 h-4 w-4" />
                  新建订单
                </Button>
              </div>
              {showSpecs && (
                <div className="absolute -bottom-6 left-0 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                  Title: text-3xl (24px) font-semibold | Desc: text-sm (14px) text-muted-foreground mt-2 | Button: size="sm" gap-2
                </div>
              )}
            </div>

            {/* List Type Tabs (一级Tab - 带竖线分隔和底部横线) */}
            <div className="relative">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setListType("current")
                    setActiveTab("all")
                  }}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors",
                    listType === "current"
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  当前订单
                  {listType === "current" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
                <div className="h-4 w-px bg-border" />
                <button
                  onClick={() => {
                    setListType("history")
                    setActiveTab("all")
                  }}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors",
                    listType === "history"
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  历史订单
                  {listType === "history" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              </div>
              {showSpecs && (
                <div className="absolute -bottom-6 left-0 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                  一级Tab: 竖线分隔 | 激活: text-primary + 底部紫色横线(h-0.5) | 未激活: text-muted-foreground
                </div>
              )}
            </div>

            {/* Status Tabs (二级Tab - 标准Tab样式) */}
            <div className="relative">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">
                    全部 <Badge variant="secondary" className={cn("ml-2", activeTab === "all" && "bg-transparent text-primary-foreground border-0")}>{mounted ? statusCounts.all : 0}</Badge>
                  </TabsTrigger>
                  {listType === "current" ? (
                    <>
                      <TabsTrigger value="pending">
                        待处理 <Badge variant="secondary" className={cn("ml-2", activeTab === "pending" && "bg-transparent text-primary-foreground border-0")}>{mounted ? statusCounts.pending : 0}</Badge>
                      </TabsTrigger>
                      <TabsTrigger value="processing">
                        处理中 <Badge variant="secondary" className={cn("ml-2", activeTab === "processing" && "bg-transparent text-primary-foreground border-0")}>{mounted ? statusCounts.processing : 0}</Badge>
                      </TabsTrigger>
                      <TabsTrigger value="shipped">
                        已发货 <Badge variant="secondary" className={cn("ml-2", activeTab === "shipped" && "bg-transparent text-primary-foreground border-0")}>{mounted ? statusCounts.shipped : 0}</Badge>
                      </TabsTrigger>
                    </>
                  ) : (
                    <TabsTrigger value="completed">
                      已完成 <Badge variant="secondary" className={cn("ml-2", activeTab === "completed" && "bg-transparent text-primary-foreground border-0")}>{mounted ? statusCounts.completed : 0}</Badge>
                    </TabsTrigger>
                  )}
                </TabsList>
              </Tabs>
              {showSpecs && (
                <div className="absolute -bottom-6 left-0 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                  二级Tab: 标准Tab样式 | 根据一级Tab显示不同状态 | Badge数量显示
                </div>
              )}
            </div>

            {/* Filter Bar */}
            <div className="relative">
              <FilterBar
                searchPlaceholder="搜索订单编号、客户名称..."
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
              {showSpecs && (
                <div className="absolute -bottom-6 left-0 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                  FilterBar: 搜索框 + 筛选按钮 + 自定义列按钮(最右侧) | 筛选后显示已选筛选条件的Badge(可点击X删除)
                </div>
              )}
            </div>

            {/* Show active filters */}
            {activeFilters.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap relative">
                <span className="text-sm text-muted-foreground">已选筛选:</span>
                {activeFilters.map((filter, index) => (
                  <Badge key={index} className="gap-1 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
                    {filter.optionLabel}
                    <button
                      onClick={() => {
                        setActiveFilters(activeFilters.filter((_, i) => i !== index))
                      }}
                      className="ml-1 hover:bg-primary/30 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveFilters([])}
                  className="h-6 text-xs text-primary hover:text-primary hover:bg-primary/10"
                >
                  清除全部
                </Button>
                {showSpecs && (
                  <div className="absolute -bottom-6 left-0 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                    Active Filters: Badge variant="secondary" | 带X按钮可删除 | 清除全部按钮
                  </div>
                )}
              </div>
            )}

            {/* Batch Operations Bar */}
            {selectedRows.length > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">
                        已选择 <span className="text-primary">{selectedRows.length}</span> 项
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedRows([])}
                        className="h-8 text-xs"
                      >
                        取消选择
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => toast.success("批量导出成功", { description: `已导出 ${selectedRows.length} 条订单数据` })}
                      >
                        <Download className="h-4 w-4" />
                        批量导出
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => toast.success("批量发送成功", { description: `已向 ${selectedRows.length} 个客户发送订单` })}
                      >
                        <Send className="h-4 w-4" />
                        批量发送
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            更多操作
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.info("批量编辑", { description: "正在打开批量编辑对话框..." })}>
                            <Edit className="mr-2 h-4 w-4" />
                            批量编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info("批量打印", { description: `正在准备打印 ${selectedRows.length} 个订单...` })}>
                            <FileText className="mr-2 h-4 w-4" />
                            批量打印
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.warning("批量归档", { description: "归档后订单将移至历史记录" })}>
                            <Package className="mr-2 h-4 w-4" />
                            批量归档
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => toast.error("批量删除失败", { description: "部分订单已发货，无法删除" })}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            批量删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data Table with Sticky Header */}
            <div className="relative">
              <DataTableWithStickyHeader
                data={paginatedData}
                columns={visibleColumnsList}
                currentPage={currentPage}
                totalItems={filteredData.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                onSelectionChange={setSelectedRows}
                selectedRows={selectedRows}
                onRowClick={(row) => setSelectedOrderId(row.id)}
              />
              {showSpecs && (
                <div className="absolute top-2 right-2 bg-black text-white text-xs p-2 rounded max-w-xs z-50">
                  DataTable: 表头吸顶(滚动时fixed) | 订单编号可点击 | 文本截断+Tooltip | 分页在底部
                </div>
              )}
            </div>
          </div>
        ) : (
          // Detail View
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white dark:bg-gray-950 border rounded-lg p-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedOrderId(null)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-bold">{selectedOrder?.orderNo}</h1>
                      <Badge className={statusConfig[selectedOrder?.status as keyof typeof statusConfig].color}>
                        {statusConfig[selectedOrder?.status as keyof typeof statusConfig].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <Building className="h-4 w-4" />
                      <span>供应商: {selectedOrder?.supplier}</span>
                      <span>•</span>
                      <Clock className="h-4 w-4" />
                      <span>创建时间: {selectedOrder?.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>刷新数据</p></TooltipContent>
                  </Tooltip>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />编辑
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.warning("请先保存当前修改", { description: "您有未保存的更改，请先保存后再发送" })}>
                    <Send className="h-4 w-4 mr-2" />发送
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        更多操作
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.success("订单已复制", { description: "订单信息已复制到剪贴板" })}>
                        复制订单
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info("正在生成PDF", { description: "文件生成中，请稍候..." })}>
                        导出PDF
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => toast.error("删除失败", { description: "该订单已发货，无法删除" })}
                      >
                        删除订单
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {showSpecs && (
                <div className="absolute -bottom-6 left-0 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                  Header: p-6 (24px) | Title: text-3xl (24px) font-bold | Desc: text-sm (14px) mt-2 (8px) | Icons: h-4 w-4 (16px) | gap-2/3/4 (8/12/16px)
                </div>
              )}
            </div>

            {/* 4 Cards in Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 relative">
              {/* Order Info Card */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium mb-3">
                    <FileText className="h-4 w-4 text-primary" />
                    订单信息
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">订单编号:</span>
                      <span className="font-medium">{selectedOrder?.orderNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">客户名称:</span>
                      <span className="font-medium">{selectedOrder?.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">订单金额:</span>
                      <span className="font-medium">¥{selectedOrder?.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">商品数量:</span>
                      <span className="font-medium">{selectedOrder?.items} 件</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">创建时间:</span>
                      <span className="font-medium">{selectedOrder?.date}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address Card */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium mb-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    收货地址
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="text-muted-foreground mb-1">收货人</div>
                      <div className="font-medium">{selectedOrder?.customer}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">联系电话</div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">138-0000-0000</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">收货地址</div>
                      <div className="font-medium">{selectedOrder?.address}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Logistics Info Card */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Truck className="h-4 w-4 text-primary" />
                    物流信息
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">物流公司:</span>
                      <span className="font-medium">顺丰速运</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">运单号:</span>
                      <span className="font-medium font-mono">SF1234567890</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">发货时间:</span>
                      <span className="font-medium">{selectedOrder?.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">预计送达:</span>
                      <span className="font-medium">2024-12-28</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">当前状态:</span>
                      <Badge className={statusConfig[selectedOrder?.status as keyof typeof statusConfig].color}>
                        {statusConfig[selectedOrder?.status as keyof typeof statusConfig].label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Source Info Card */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Package className="h-4 w-4 text-primary" />
                    来源信息
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">订单来源:</span>
                      <span className="font-medium">线上商城</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">支付方式:</span>
                      <span className="font-medium">微信支付</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">创建人:</span>
                      <span className="font-medium">系统自动</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">供应商:</span>
                      <span className="font-medium">{selectedOrder?.supplier}</span>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">备注</div>
                      <div className="font-medium">客户要求尽快发货</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {showSpecs && (
                <div className="absolute -bottom-6 left-0 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                  Grid: gap-6 (24px) | Card: pt-6 (24px) space-y-3 (12px) | Title: text-sm (14px) | Icon: h-4 w-4 (16px) | Text: text-xs (12px) | 遵循 8px 增量
                </div>
              )}
            </div>

            {/* Product Details Table */}
            <Card className="relative">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm font-medium mb-4">
                  <Package className="h-4 w-4 text-primary" />
                  商品明细
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">商品名称</th>
                        <th className="text-left p-3 font-medium">规格</th>
                        <th className="text-center p-3 font-medium">数量</th>
                        <th className="text-right p-3 font-medium">单价</th>
                        <th className="text-right p-3 font-medium">小计</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-3">iPhone 15 Pro</td>
                        <td className="p-3 text-muted-foreground">256GB 深空黑色</td>
                        <td className="p-3 text-center">2</td>
                        <td className="p-3 text-right">¥7,999.00</td>
                        <td className="p-3 text-right font-medium">¥15,998.00</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">AirPods Pro 2</td>
                        <td className="p-3 text-muted-foreground">USB-C 充电盒</td>
                        <td className="p-3 text-center">1</td>
                        <td className="p-3 text-right">¥1,899.00</td>
                        <td className="p-3 text-right font-medium">¥1,899.00</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Apple Watch Series 9</td>
                        <td className="p-3 text-muted-foreground">45mm GPS 午夜色</td>
                        <td className="p-3 text-center">1</td>
                        <td className="p-3 text-right">¥3,199.00</td>
                        <td className="p-3 text-right font-medium">¥3,199.00</td>
                      </tr>
                      <tr className="border-t bg-muted/30">
                        <td colSpan={4} className="p-3 text-right font-medium">合计:</td>
                        <td className="p-3 text-right font-bold text-base">¥{selectedOrder?.amount.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
              {showSpecs && (
                <div className="absolute top-2 right-2 bg-black text-white text-xs p-2 rounded max-w-xs z-50">
                  Table: border rounded-lg | thead: bg-muted/50 | text-xs | p-3 | 合计行: bg-muted/30 font-bold
                </div>
              )}
            </Card>

            {/* Operation Records */}
            <Card className="relative">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm font-medium mb-4">
                  <Clock className="h-4 w-4 text-primary" />
                  操作记录
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3 pb-3 border-b">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <div className="h-full w-px bg-border mt-1" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">订单已发货</span>
                        <span className="text-xs text-muted-foreground">2024-12-26 10:30</span>
                      </div>
                      <p className="text-xs text-muted-foreground">操作人: 张三 | 物流公司: 顺丰速运 | 运单号: SF1234567890</p>
                    </div>
                  </div>
                  <div className="flex gap-3 pb-3 border-b">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-muted" />
                      <div className="h-full w-px bg-border mt-1" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">订单已确认</span>
                        <span className="text-xs text-muted-foreground">2024-12-25 16:20</span>
                      </div>
                      <p className="text-xs text-muted-foreground">操作人: 李四 | 备注: 客户要求尽快发货</p>
                    </div>
                  </div>
                  <div className="flex gap-3 pb-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-muted" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">订单已创建</span>
                        <span className="text-xs text-muted-foreground">2024-12-25 14:00</span>
                      </div>
                      <p className="text-xs text-muted-foreground">操作人: 系统自动 | 来源: 线上商城</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              {showSpecs && (
                <div className="absolute top-2 right-2 bg-black text-white text-xs p-2 rounded max-w-xs z-50">
                  Timeline: flex gap-3 | Dot: h-2 w-2 rounded-full | Active: bg-primary | Inactive: bg-muted | Line: w-px bg-border | Title: text-sm font-medium | Time: text-xs text-muted-foreground
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Theme Toggle Buttons - Bottom Center */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="flex gap-2 bg-background border rounded-lg p-2 shadow-lg">
            <Button variant="outline" size="sm" onClick={() => setShowSpecs(!showSpecs)}>
              <Info className="h-4 w-4 mr-2" />
              {showSpecs ? '隐藏规范' : '显示规范'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                toast.success("操作成功", { description: "数据已成功保存到服务器" })
                setTimeout(() => toast.error("操作失败", { description: "网络连接超时，请重试" }), 300)
                setTimeout(() => toast.warning("注意事项", { description: "该操作将影响所有关联订单" }), 600)
                setTimeout(() => toast.info("系统提示", { description: "新版本已发布，建议更新" }), 900)
              }}
            >
              演示 Toast
            </Button>
          </div>
        </div>
      </MainLayout>
    </TooltipProvider>
  )
}
