"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Settings2 } from "lucide-react"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface Column<T> {
  id: string
  header: string
  accessorKey?: keyof T
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  width?: string
  defaultVisible?: boolean
}

interface DataTableProps<T> {
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
  hideColumnControl?: boolean
}

export function DataTable<T extends { id?: string | number }>({
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
  hideColumnControl = false,
}: DataTableProps<T>) {
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(
    new Set(columns.filter(col => col.defaultVisible !== false).map(col => col.id))
  )

  const hasSelection = onSelectionChange !== undefined

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

  const toggleColumn = (columnId: string) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(columnId)) {
        newSet.delete(columnId)
      } else {
        newSet.add(columnId)
      }
      return newSet
    })
  }

  const visibleColumnsList = hideColumnControl ? columns : columns.filter(col => visibleColumns.has(col.id))

  return (
    <div className="space-y-4">
      {/* Column Visibility Control */}
      {!hideColumnControl && (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={visibleColumns.has(column.id)}
                  onCheckedChange={() => toggleColumn(column.id)}
                >
                  {column.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Table with sticky columns */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
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
                {visibleColumnsList.map((column, index) => {
                  const isFirst = index === 0
                  const isLast = index === visibleColumnsList.length - 1
                  const leftOffset = hasSelection && isFirst ? '50px' : '0'
                  const isSticky = isFirst || isLast
                  
                  return (
                    <TableHead 
                      key={column.id} 
                      style={{ 
                        width: column.width,
                        left: isFirst ? leftOffset : undefined,
                      }}
                      className={isSticky ? `sticky ${isLast ? 'right-0' : ''} bg-background z-10 shadow-[${isFirst ? '2px' : '-2px'}_0_4px_-2px_rgba(0,0,0,0.1)]` : ''}
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
                  <TableCell colSpan={visibleColumnsList.length + (hasSelection ? 1 : 0)} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumnsList.length + (hasSelection ? 1 : 0)} className="h-24 text-center">
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
                        <TableCell className="sticky left-0 bg-background z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectRow(row.id!, !!checked)}
                            aria-label="Select row"
                          />
                        </TableCell>
                      )}
                      {visibleColumnsList.map((column, colIndex) => {
                        const isFirst = colIndex === 0
                        const isLast = colIndex === visibleColumnsList.length - 1
                        const leftOffset = hasSelection && isFirst ? '50px' : '0'
                        const isSticky = isFirst || isLast
                        
                        return (
                          <TableCell 
                            key={column.id}
                            style={{
                              left: isFirst ? leftOffset : undefined,
                            }}
                            className={isSticky ? `sticky ${isLast ? 'right-0' : ''} bg-background z-10 shadow-[${isFirst ? '2px' : '-2px'}_0_4px_-2px_rgba(0,0,0,0.1)]` : ''}
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
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
                  onPageChange(1) // Reset to first page when changing page size
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
