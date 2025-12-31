"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable, Column } from "@/components/data-table/data-table"
import { FilterBar } from "@/components/data-table/filter-bar"
import { SearchField, AdvancedSearchValues } from "@/components/data-table/advanced-search-dialog"
import { OrderNumberCell } from "@/components/ui/order-number-cell"
import { Download, Plus, ShoppingCart } from "lucide-react"
import { useState, useMemo } from "react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

// Mock data
const mockOrders = [
  { id: '1', orderNo: 'PO-2024-001', supplier: '供应商A', amount: 8234.50, status: 'pending', date: '2024-12-25' },
  { id: '2', orderNo: 'PO-2024-002', supplier: '供应商B', amount: 5678.90, status: 'processing', date: '2024-12-24' },
  { id: '3', orderNo: 'PO-2024-003', supplier: '供应商C', amount: 12456.00, status: 'shipped', date: '2024-12-23' },
  { id: '4', orderNo: 'PO-2024-004', supplier: '供应商A', amount: 3456.78, status: 'completed', date: '2024-12-22' },
  { id: '5', orderNo: 'PO-2024-005', supplier: '供应商D', amount: 9876.54, status: 'completed', date: '2024-12-21' },
  { id: '6', orderNo: 'PO-2024-006', supplier: '供应商B', amount: 15678.00, status: 'pending', date: '2024-12-20' },
  { id: '7', orderNo: 'PO-2024-007', supplier: '供应商E', amount: 23456.80, status: 'processing', date: '2024-12-19' },
  { id: '8', orderNo: 'PO-2024-008', supplier: '供应商C', amount: 18900.00, status: 'shipped', date: '2024-12-18' },
  { id: '9', orderNo: 'PO-2024-009', supplier: '供应商F', amount: 45678.90, status: 'pending', date: '2024-12-17' },
  { id: '10', orderNo: 'PO-2024-010', supplier: '供应商A', amount: 34567.00, status: 'processing', date: '2024-12-16' },
]

const statusConfig = {
  pending: { label: '待处理', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
  processing: { label: '处理中', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
  shipped: { label: '已发货', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
}

export default function BatchSearchDemo() {
  const [searchValue, setSearchValue] = useState("")
  const [advancedSearchValues, setAdvancedSearchValues] = useState<AdvancedSearchValues>({})
  const [advancedSearchFilters, setAdvancedSearchFilters] = useState<any[]>([])
  const [filteredData, setFilteredData] = useState(mockOrders)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([])

  // Advanced search fields with batch support
  const advancedSearchFields: SearchField[] = [
    { 
      id: "orderNo", 
      label: "采购单号", 
      placeholder: "PO-2024-001\nPO-2024-002\nPO-2024-003",
      type: "batch",
      maxItems: 100
    },
    { id: "supplier", label: "供应商名称", placeholder: "e.g., 供应商A" },
  ]

  // Filter data
  useMemo(() => {
    let filtered = mockOrders

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
    } else if (searchValue) {
      // Regular search
      const searchLower = searchValue.toLowerCase()
      filtered = filtered.filter(o => 
        o.orderNo.toLowerCase().includes(searchLower) ||
        o.supplier.toLowerCase().includes(searchLower)
      )
    }

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchValue, advancedSearchValues])

  const handleAdvancedSearch = (values: AdvancedSearchValues, filters: any[]) => {
    setAdvancedSearchValues(values)
    setAdvancedSearchFilters(filters || [])
    setSearchValue("") // Clear regular search
    
    const batchFields = filters.filter(f => Array.isArray(f.value))
    if (batchFields.length > 0) {
      const totalCount = batchFields.reduce((sum, f) => sum + (f.value as string[]).length, 0)
      toast.success("批量搜索成功", { 
        description: `搜索 ${totalCount} 个订单号，找到 ${filteredData.length} 条匹配记录` 
      })
    }
  }

  const columns: Column<typeof mockOrders[0]>[] = [
    {
      id: "orderNo",
      header: "采购单号",
      accessorKey: "orderNo",
      width: "150px",
      defaultVisible: true,
      cell: (row) => <OrderNumberCell orderNumber={row.orderNo} />,
    },
    {
      id: "supplier",
      header: "供应商",
      accessorKey: "supplier",
      width: "200px",
      defaultVisible: true,
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
      header: "金额",
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
  ]

  return (
    <MainLayout moduleName="批量搜索演示">
      <Toaster />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">采购单管理</h1>
            <p className="text-sm text-muted-foreground mt-2">支持批量搜索采购单号</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              新建采购单
            </Button>
          </div>
        </div>

        {/* Filter Bar with Advanced Search (includes batch) */}
        <FilterBar
          searchPlaceholder="搜索采购单号、供应商..."
          onSearchChange={setSearchValue}
          advancedSearchFields={advancedSearchFields}
          onAdvancedSearch={handleAdvancedSearch}
        />

        {/* Show advanced search info */}
        {advancedSearchFilters.length > 0 && (
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium">
                    高级搜索: <span className="text-blue-600 dark:text-blue-400">{advancedSearchFilters.length}</span> 个条件
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAdvancedSearchValues({})
                    setAdvancedSearchFilters([])
                  }}
                  className="h-8 text-xs"
                >
                  清除高级搜索
                </Button>
              </div>
              <div className="mt-2 space-y-1">
                {advancedSearchFilters.map((filter, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    <span className="font-medium">{filter.fieldLabel}:</span>{" "}
                    {Array.isArray(filter.value) ? (
                      <span>
                        {filter.value.length} 个订单号
                        <div className="mt-1 flex flex-wrap gap-1">
                          {filter.value.slice(0, 10).map((num: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs font-mono">
                              {num}
                            </Badge>
                          ))}
                          {filter.value.length > 10 && (
                            <Badge variant="outline" className="text-xs">
                              +{filter.value.length - 10} 更多
                            </Badge>
                          )}
                        </div>
                      </span>
                    ) : (
                      <span className="font-mono">{filter.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        <Card>
          <CardContent className="pt-6">
            <DataTable
              data={filteredData}
              columns={columns}
              currentPage={currentPage}
              totalItems={filteredData.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              onSelectionChange={setSelectedRows}
              selectedRows={selectedRows}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
