"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Column } from "./data-table"

interface DataTableWithStickyHeaderProps<T> {
  data: T[]
  columns: Column<T>[]
  pageSize?: number
  currentPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  onRowClick?: (row: T) => void
  onSelectionChange?: (selectedIds: (string | number)[]) => void
  selectedRows?: (string | number)[]
  loading?: boolean
  emptyMessage?: string
}

export function DataTableWithStickyHeader<T extends { id?: string | number }>({
  data,
  columns,
  pageSize = 10,
  currentPage,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  onSelectionChange,
  selectedRows = [],
  loading = false,
  emptyMessage = "No data available",
}: DataTableWithStickyHeaderProps<T>) {
  const hasSelection = onSelectionChange !== undefined
  const tableRef = React.useRef<HTMLDivElement>(null)
  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  const paginationRef = React.useRef<HTMLDivElement>(null)
  const [isSticky, setIsSticky] = React.useState(false)
  const [isPaginationSticky, setIsPaginationSticky] = React.useState(false)
  const [showScrollTop, setShowScrollTop] = React.useState(false)
  const [stickyStyles, setStickyStyles] = React.useState<React.CSSProperties>({})
  const [paginationStickyStyles, setPaginationStickyStyles] = React.useState<React.CSSProperties>({})
  const [headerHeight, setHeaderHeight] = React.useState(56)

  // 监听滚动，实现表头吸顶、分页吸底和回到顶部按钮显示
  React.useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current || !tableContainerRef.current || !paginationRef.current) return
      
      const scrollContainer = tableRef.current.closest('main')
      if (!scrollContainer) return
      
      const containerRect = tableContainerRef.current.getBoundingClientRect()
      const paginationRect = paginationRef.current.getBoundingClientRect()
      
      // 动态计算header高度：基础header(56px) + 可能的第二行导航
      const header = document.querySelector('header')
      const currentHeaderHeight = header ? header.offsetHeight : 56
      setHeaderHeight(currentHeaderHeight)
      
      // 表头吸顶：当表格顶部滚动到header下方时
      if (containerRect.top < currentHeaderHeight && containerRect.bottom > currentHeaderHeight + 100) {
        setIsSticky(true)
        setStickyStyles({
          left: `${containerRect.left}px`,
          width: `${containerRect.width}px`,
        })
      } else {
        setIsSticky(false)
        setStickyStyles({})
      }
      
      // 分页吸底：只有当分页栏的顶部滚动到视口底部以下时才显示
      // 这样可以避免在内容较少、分页栏本身就在视口内时出现吸底
      const viewportHeight = window.innerHeight
      if (paginationRect.top > viewportHeight && containerRect.top < viewportHeight) {
        setIsPaginationSticky(true)
        setPaginationStickyStyles({
          left: `${containerRect.left}px`,
          width: `${containerRect.width}px`,
        })
      } else {
        setIsPaginationSticky(false)
        setPaginationStickyStyles({})
      }
      
      // 滚动超过300px时显示回到顶部按钮
      setShowScrollTop(scrollContainer.scrollTop > 300)
    }

    // 找到滚动容器（main标签）
    const scrollContainer = tableRef.current?.closest('main')
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
      window.addEventListener('resize', handleScroll) // 窗口大小改变时重新计算
      handleScroll() // 初始检查
      
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleScroll)
      }
    }
  }, [])

  // 回到顶部
  const scrollToTop = () => {
    const scrollContainer = tableRef.current?.closest('main')
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Handle row selection
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    if (checked) {
      const allIds = data.map(row => row.id).filter((id): id is string | number => id !== undefined)
      onSelectionChange(allIds)
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectRow = (rowId: string | number, checked: boolean) => {
    if (!onSelectionChange) return
    if (checked) {
      onSelectionChange([...selectedRows, rowId])
    } else {
      onSelectionChange(selectedRows.filter(id => id !== rowId))
    }
  }

  const isAllSelected = data.length > 0 && data.every(row => row.id && selectedRows.includes(row.id))
  const isSomeSelected = selectedRows.length > 0 && !isAllSelected

  const totalPages = Math.ceil(totalItems / pageSize)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="space-y-4">
      {/* Sticky Header - 只在吸顶时显示 */}
      {isSticky && (
        <div 
          className="fixed z-50 shadow-md bg-background"
          style={{
            ...stickyStyles,
            top: `${headerHeight}px`
          }}
        >
          <div className="border-b overflow-hidden">
            <div className="overflow-x-auto">
              <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHeader>
                  <TableRow>
                    {hasSelection && (
                      <TableHead className="sticky left-0 bg-background z-20 w-[50px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all"
                          className={isSomeSelected ? "data-[state=checked]:bg-primary" : ""}
                        />
                      </TableHead>
                    )}
                    {columns.map((column, index) => {
                      const isFirst = index === 0
                      const isLast = index === columns.length - 1
                      const leftOffset = hasSelection && isFirst ? '50px' : '0'
                      const isStickyCol = isFirst || isLast
                      
                      return (
                        <TableHead 
                          key={column.id} 
                          style={{ 
                            width: column.width,
                            left: isFirst ? leftOffset : undefined,
                          }}
                          className={isStickyCol ? `sticky ${isLast ? 'right-0' : ''} bg-background z-20 shadow-[${isFirst ? '2px' : '-2px'}_0_4px_-2px_rgba(0,0,0,0.1)]` : ''}
                        >
                          {column.header}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                </TableHeader>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Table with sticky header on page scroll */}
      <div ref={tableContainerRef} className="rounded-md border overflow-hidden relative">
        <div ref={tableRef} className="overflow-x-auto">
          <Table style={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHeader>
              <TableRow>
                {hasSelection && (
                  <TableHead className="sticky left-0 bg-background z-10 w-[50px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                      className={isSomeSelected ? "data-[state=checked]:bg-primary" : ""}
                    />
                  </TableHead>
                )}
                {columns.map((column, index) => {
                  const isFirst = index === 0
                  const isLast = index === columns.length - 1
                  const leftOffset = hasSelection && isFirst ? '50px' : '0'
                  const isStickyCol = isFirst || isLast
                  
                  return (
                    <TableHead 
                      key={column.id} 
                      style={{ 
                        width: column.width,
                        left: isFirst ? leftOffset : undefined,
                      }}
                      className={isStickyCol ? `sticky ${isLast ? 'right-0' : ''} bg-background z-10 shadow-[${isFirst ? '2px' : '-2px'}_0_4px_-2px_rgba(0,0,0,0.1)]` : ''}
                    >
                      {column.header}
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (hasSelection ? 1 : 0)} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (hasSelection ? 1 : 0)} className="h-24 text-center">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => {
                  const isSelected = row.id ? selectedRows.includes(row.id) : false
                  return (
                    <TableRow
                      key={row.id || index}
                      className={onRowClick ? "cursor-pointer" : ""}
                      data-state={isSelected ? "selected" : undefined}
                    >
                      {hasSelection && row.id && (
                        <TableCell className="sticky left-0 bg-inherit z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectRow(row.id!, !!checked)}
                            aria-label="Select row"
                          />
                        </TableCell>
                      )}
                      {columns.map((column, colIndex) => {
                        const isFirst = colIndex === 0
                        const isLast = colIndex === columns.length - 1
                        const leftOffset = hasSelection && isFirst ? '50px' : '0'
                        const isStickyCol = isFirst || isLast
                        
                        return (
                          <TableCell 
                            key={column.id}
                            style={{
                              width: column.width,
                              left: isFirst ? leftOffset : undefined,
                            }}
                            className={isStickyCol ? `sticky ${isLast ? 'right-0' : ''} bg-inherit z-10 shadow-[${isFirst ? '2px' : '-2px'}_0_4px_-2px_rgba(0,0,0,0.1)]` : ''}
                            onClick={() => onRowClick?.(row)}
                          >
                            {column.cell
                              ? column.cell(row)
                              : column.accessorKey
                              ? String(row[column.accessorKey] ?? "")
                              : ""}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className={`fixed right-8 z-[60] h-12 w-12 rounded-full shadow-lg transition-all ${
            isPaginationSticky ? 'bottom-24' : 'bottom-8'
          }`}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {/* Sticky Pagination - 只在吸底时显示 */}
      {isPaginationSticky && (
        <div 
          className="fixed bottom-0 z-[45] bg-background border-t shadow-[0_-2px_8px_rgba(0,0,0,0.1)] py-4"
          style={paginationStickyStyles}
        >
          <div className="flex items-center justify-between px-4">
            <div className="text-sm text-muted-foreground">
              {selectedRows.length > 0 && (
                <span>{selectedRows.length} of {totalItems} row(s) selected</span>
              )}
            </div>
            <div className="flex items-center gap-6">
              {onPageSizeChange && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      onPageSizeChange(Number(value))
                      onPageChange(1)
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Showing {startItem} to {endItem} of {totalItems} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div ref={paginationRef} className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedRows.length > 0 && (
            <span>{selectedRows.length} of {totalItems} row(s) selected</span>
          )}
        </div>
        <div className="flex items-center gap-6">
          {onPageSizeChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  onPageSizeChange(Number(value))
                  onPageChange(1)
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {totalItems} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
