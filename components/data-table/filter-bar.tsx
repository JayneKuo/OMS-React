"use client"

import * as React from "react"
import { Search, X, ChevronDown, Filter, SlidersHorizontal, Settings2, SearchX, GripVertical, ListFilter } from "lucide-react"
import { AdvancedSearchDialog, SearchField, AdvancedSearchValues, AdvancedSearchFilter } from "./advanced-search-dialog"
import { BatchSearchPopover, BatchSearchField } from "./batch-search-popover"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

export interface FilterOption {
  id: string
  label: string
  value: string
}

export interface FilterConfig {
  id: string
  label: string
  options?: FilterOption[]
  type?: "single" | "multiple" | "input" | "batch"
  placeholder?: string
}

export interface ActiveFilter {
  filterId: string
  filterLabel: string
  optionId: string
  optionLabel: string
  optionValue: string
}

export interface ColumnConfig {
  id: string
  label: string
  visible: boolean
  defaultVisible?: boolean
}

// Internal component for Batch Filter Popover Content
const BatchFilterPopoverContent = ({
  filter,
  initialValue,
  onApply,
  onCancel,
  onClear
}: {
  filter: FilterConfig;
  initialValue: string;
  onApply: (value: string) => void;
  onCancel: () => void;
  onClear: () => void;
}) => {
  const [value, setValue] = React.useState(initialValue)

  // Calc real-time count
  const items = React.useMemo(() => {
    return value.split(/[,\s\n]+/).filter(v => v.trim() !== "")
  }, [value])

  return (
    <PopoverContent align="start" className="w-80 p-0 shadow-xl border-primary/20">
      <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/30">
        <span className="text-sm font-semibold flex items-center gap-2">
          <ListFilter className="h-4 w-4 text-primary" />
          {filter.label}
        </span>
        {initialValue && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
            onClick={() => {
              setValue("")
              onClear()
            }}
          >
            清空
          </Button>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">批量输入单号</span>
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary/10 text-primary border-primary/20">
              已识别: {items.length} 个
            </Badge>
          </div>
          <div className="relative group/textarea">
            <Textarea
              placeholder={filter.placeholder || "请输入内容，支持逗号、空格或换行分隔..."}
              className="min-h-[140px] text-xs resize-none focus-visible:ring-primary/30 border-muted-foreground/20 pr-8"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
            {value && (
              <button
                onClick={() => setValue("")}
                className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover/textarea:opacity-100 transition-opacity bg-background/80 rounded-md shadow-sm border border-border"
                title="清空文字内容"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground px-1 italic">
            * 粘贴 Excel 列或手动输入，系统自动识别有效位
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-muted/50">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs bg-background"
            onClick={onCancel}
          >
            取消
          </Button>
          <Button
            size="sm"
            className="flex-1 h-8 text-xs shadow-sm bg-primary hover:bg-primary/90"
            onClick={() => onApply(value)}
          >
            搜索
          </Button>
        </div>
      </div>
    </PopoverContent>
  )
}

interface FilterBarProps {
  searchValue?: string // Controlled search value
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  filters?: FilterConfig[]
  onFiltersChange?: (filters: ActiveFilter[]) => void
  savedFilters?: { id: string; name: string; filters: ActiveFilter[] }[]
  onSaveFilter?: (name: string, filters: ActiveFilter[]) => void
  // Column visibility control
  columns?: ColumnConfig[]
  onColumnsChange?: (columns: ColumnConfig[]) => void
  // Advanced search
  advancedSearchFields?: SearchField[]
  onAdvancedSearch?: (values: AdvancedSearchValues, filters: AdvancedSearchFilter[]) => void
  // Batch search
  enableBatchSearch?: boolean
  batchSearchFields?: BatchSearchField[]
  batchSearchVariant?: "default" | "icon"
  onBatchSearch?: (criteria: Record<string, string[]>) => void
  className?: string
}

export function FilterBar({
  searchValue: externalSearchValue,
  searchPlaceholder = "Search...",
  onSearchChange,
  filters = [],
  onFiltersChange,
  savedFilters = [],
  onSaveFilter,
  columns = [],
  onColumnsChange,
  advancedSearchFields = [],
  onAdvancedSearch,
  enableBatchSearch = false,
  batchSearchFields = [{ label: "订单编号", value: "orderNo" }],
  batchSearchVariant = "default",
  onBatchSearch,
  className,
}: FilterBarProps) {
  const [internalSearchValue, setInternalSearchValue] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<ActiveFilter[]>([])
  const [advancedSearchFilters, setAdvancedSearchFilters] = React.useState<AdvancedSearchFilter[]>([])
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const [filterSearches, setFilterSearches] = React.useState<Record<string, string>>({})
  const [moreFiltersSearch, setMoreFiltersSearch] = React.useState("")
  const [visibleFilterCount, setVisibleFilterCount] = React.useState(filters.length)
  const [openPopoverId, setOpenPopoverId] = React.useState<string | null>(null)


  // Use external search value if provided (controlled), otherwise use internal state (uncontrolled)
  const searchValue = externalSearchValue !== undefined ? externalSearchValue : internalSearchValue

  const filterContainerRef = React.useRef<HTMLDivElement>(null)
  const rightActionsRef = React.useRef<HTMLDivElement>(null)

  // Calculate how many filters can fit
  React.useEffect(() => {
    const calculateVisibleFilters = () => {
      if (!filterContainerRef.current || !rightActionsRef.current) return

      const container = filterContainerRef.current.parentElement
      if (!container) return

      const containerWidth = container.offsetWidth
      const searchWidth = 384 // max-w-md = 384px
      const rightActionsWidth = rightActionsRef.current.offsetWidth
      const gap = 8 // gap-2 = 8px
      const moreButtonWidth = 60 // "..." button approximate width
      const filterButtonWidth = 120 // approximate width per filter button

      const availableWidth = containerWidth - searchWidth - rightActionsWidth - (gap * 4) - moreButtonWidth
      const maxFilters = Math.floor(availableWidth / (filterButtonWidth + gap))

      setVisibleFilterCount(Math.max(1, Math.min(maxFilters, filters.length)))
    }

    calculateVisibleFilters()
    window.addEventListener('resize', calculateVisibleFilters)

    return () => window.removeEventListener('resize', calculateVisibleFilters)
  }, [filters.length])

  const handleSearchChange = (value: string) => {
    // Update internal state only if not controlled
    if (externalSearchValue === undefined) {
      setInternalSearchValue(value)
    }
    // Always call the callback
    onSearchChange?.(value)
  }

  const handleFilterToggle = (filter: FilterConfig, option: FilterOption) => {
    setActiveFilters((prev) => {
      const existingIndex = prev.findIndex(
        (f) => f.filterId === filter.id && f.optionId === option.id
      )

      let newFilters: ActiveFilter[]

      if (existingIndex >= 0) {
        // Remove filter
        newFilters = prev.filter((_, index) => index !== existingIndex)
      } else {
        // Add filter
        const newFilter: ActiveFilter = {
          filterId: filter.id,
          filterLabel: filter.label,
          optionId: option.id,
          optionLabel: option.label,
          optionValue: option.value,
        }

        if (filter.type === "single") {
          // Replace existing filter of same type
          newFilters = [
            ...prev.filter((f) => f.filterId !== filter.id),
            newFilter,
          ]
        } else {
          // Add to existing filters
          newFilters = [...prev, newFilter]
        }
      }

      onFiltersChange?.(newFilters)
      return newFilters
    })
  }

  const handleInputChange = (filter: FilterConfig, value: string) => {
    setActiveFilters((prev) => {
      const filteredPrev = prev.filter((f) => f.filterId !== filter.id)
      let newFilters: ActiveFilter[]
      if (value.trim()) {
        newFilters = [
          ...filteredPrev,
          {
            filterId: filter.id,
            filterLabel: filter.label,
            optionId: "input-value",
            optionLabel: value,
            optionValue: value,
          },
        ]
      } else {
        newFilters = filteredPrev
      }
      onFiltersChange?.(newFilters)
      return newFilters
    })
  }

  const handleRemoveFilter = (filter: ActiveFilter) => {
    setActiveFilters((prev) => {
      const newFilters = prev.filter(
        (f) => !(f.filterId === filter.filterId && f.optionId === filter.optionId)
      )
      onFiltersChange?.(newFilters)
      return newFilters
    })
  }

  const handleRemoveAdvancedSearchFilter = (filter: AdvancedSearchFilter) => {
    setAdvancedSearchFilters((prev) => {
      const newFilters = prev.filter(f => f.fieldId !== filter.fieldId)
      // 重新构建 values
      const newValues: AdvancedSearchValues = {}
      newFilters.forEach(f => {
        newValues[f.fieldId] = f.value
      })
      onAdvancedSearch?.(newValues, newFilters)
      return newFilters
    })
  }

  const handleBatchInputChange = (filter: FilterConfig, value: string) => {
    // Split by comma, space or newline and filter empty strings
    const values = value.split(/[,\s\n]+/).filter(v => v.trim() !== "")

    setActiveFilters((prev) => {
      const filteredPrev = prev.filter((f) => f.filterId !== filter.id)
      let newFilters: ActiveFilter[]
      if (values.length > 0) {
        newFilters = [
          ...filteredPrev,
          {
            filterId: filter.id,
            filterLabel: filter.label,
            optionId: "batch-value",
            optionLabel: `批量(${values.length})`,
            optionValue: values.join(","), // Store as comma separated string for filtering logic
          },
        ]
      } else {
        newFilters = filteredPrev
      }
      onFiltersChange?.(newFilters)
      return newFilters
    })
  }

  const handleAdvancedSearch = (values: AdvancedSearchValues, filters: AdvancedSearchFilter[]) => {
    setAdvancedSearchFilters(filters)
    onAdvancedSearch?.(values, filters)
  }

  const handleClearAll = () => {
    setActiveFilters([])
    setAdvancedSearchFilters([])
    handleSearchChange("")
    onSearchChange?.("")
    onFiltersChange?.([])
    onAdvancedSearch?.({}, [])
  }

  const isFilterActive = (filterId: string, optionId: string) => {
    return activeFilters.some(
      (f) => f.filterId === filterId && f.optionId === optionId
    )
  }

  const getActiveFilterCount = (filterId: string) => {
    return activeFilters.filter((f) => f.filterId === filterId).length
  }

  const handleColumnToggle = (columnId: string) => {
    if (!onColumnsChange) return
    const updatedColumns = columns.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    )
    onColumnsChange(updatedColumns)
  }

  const handleClearFilterType = (filterId: string) => {
    setActiveFilters((prev) => {
      const newFilters = prev.filter((f) => f.filterId !== filterId)
      onFiltersChange?.(newFilters)
      return newFilters
    })
  }

  // Drag and drop state for column reordering
  const [draggedColumn, setDraggedColumn] = React.useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = React.useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedColumn(columnId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverColumn(columnId)
  }

  const handleDragEnd = () => {
    setDraggedColumn(null)
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()

    if (!draggedColumn || draggedColumn === targetColumnId || !onColumnsChange) {
      return
    }

    const draggedIndex = columns.findIndex(col => col.id === draggedColumn)
    const targetIndex = columns.findIndex(col => col.id === targetColumnId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newColumns = [...columns]
    const [removed] = newColumns.splice(draggedIndex, 1)
    newColumns.splice(targetIndex, 0, removed)

    onColumnsChange(newColumns)
    setDraggedColumn(null)
    setDragOverColumn(null)
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search and Filter Row */}
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-16" // Increase right padding for batch button and clear button
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchValue && (
              <button
                onClick={() => handleSearchChange("")}
                className="text-muted-foreground hover:text-foreground p-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Embedded Batch Search Trigger */}
            {enableBatchSearch && onBatchSearch && (
              <BatchSearchPopover
                onSearchAction={onBatchSearch}
                fields={batchSearchFields}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    title="批量搜索"
                  >
                    <ListFilter className="h-4 w-4" />
                  </Button>
                }
              />
            )}
          </div>
        </div>

        {/* Removed standalone icon button next to search */}

        {/* Batch Search (Icon only variant placed next to search) */}


        {/* Filter Buttons Container */}
        <div ref={filterContainerRef} className="flex items-center gap-2 flex-1 min-w-0">
          {/* Visible Filter Popovers */}
          {filters.slice(0, visibleFilterCount).map((filter) => {
            if (filter.type === "input") {
              const activeFilter = activeFilters.find((f) => f.filterId === filter.id)
              const inputValue = activeFilter?.optionValue || ""

              return (
                <div key={filter.id} className="relative flex-shrink-0 w-36 group">
                  <Input
                    placeholder={filter.label}
                    value={inputValue}
                    onChange={(e) => handleInputChange(filter, e.target.value)}
                    className="h-9 px-3 pr-8 text-sm bg-background border-dashed focus:border-solid hover:bg-accent/50 transition-all border-muted-foreground/30 focus:border-primary"
                  />
                  {inputValue && (
                    <button
                      onClick={() => handleInputChange(filter, "")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )
            }

            const activeCount = getActiveFilterCount(filter.id)
            const hasActiveFilters = activeCount > 0
            const filterSearch = filterSearches[filter.id] || ""

            // Filter options based on search
            const filteredOptions = (filter.options || []).filter(option =>
              option.label.toLowerCase().includes(filterSearch.toLowerCase())
            )

            return (
              <Popover
                key={filter.id}
                open={openPopoverId === filter.id}
                onOpenChange={(open) => setOpenPopoverId(open ? filter.id : null)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "gap-2 whitespace-nowrap flex-shrink-0 transition-all",
                      hasActiveFilters && "border-primary/50 bg-primary/5"
                    )}
                  >
                    {filter.label}
                    {activeCount > 0 && (
                      <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px] bg-primary text-primary-foreground border-none">
                        {filter.type === "batch"
                          ? `项(${activeFilters.find(f => f.filterId === filter.id)?.optionValue.split(",").length || 0})`
                          : activeCount}
                      </Badge>
                    )}
                    {hasActiveFilters ? (
                      <X
                        className="h-3.5 w-3.5 ml-1 opacity-40 hover:opacity-100 hover:text-destructive transition-all"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleClearFilterType(filter.id)
                        }}
                      />
                    ) : (
                      <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", openPopoverId === filter.id && "rotate-180")} />
                    )}
                  </Button>
                </PopoverTrigger>

                {filter.type === "batch" ? (
                  <BatchFilterPopoverContent
                    filter={filter}
                    initialValue={activeFilters.find(f => f.filterId === filter.id)?.optionValue?.replace(/,/g, "\n") || ""}
                    onApply={(val) => {
                      handleBatchInputChange(filter, val)
                      setOpenPopoverId(null)
                    }}
                    onCancel={() => setOpenPopoverId(null)}
                    onClear={() => {
                      handleClearFilterType(filter.id)
                      setOpenPopoverId(null)
                    }}
                  />
                ) : (
                  <PopoverContent align="start" className="w-80 p-0">
                    <div className="flex items-center justify-between px-3 py-2 border-b">
                      <span className="text-sm font-semibold">{filter.label}</span>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleClearFilterType(filter.id)}
                        >
                          清空
                        </Button>
                      )}
                    </div>

                    <div className="p-3 space-y-3">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder={`搜索 ${filter.label.toLowerCase()}...`}
                          value={filterSearch}
                          onChange={(e) => setFilterSearches(prev => ({ ...prev, [filter.id]: e.target.value }))}
                          className="h-8 pl-7 pr-7 text-xs"
                        />
                        {filterSearch && (
                          <button
                            onClick={() => setFilterSearches(prev => ({ ...prev, [filter.id]: "" }))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="p-1 max-h-[300px] overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                          filteredOptions.map((option) => (
                            <label
                              key={option.id}
                              className="flex items-center gap-2 px-2 py-2 hover:bg-primary-hover/10 hover:text-primary rounded-sm cursor-pointer transition-colors"
                            >
                              <Checkbox
                                checked={isFilterActive(filter.id, option.id)}
                                onCheckedChange={() => handleFilterToggle(filter, option)}
                              />
                              <span className="text-sm flex-1">{option.label}</span>
                            </label>
                          ))
                        ) : (
                          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                            无搜索结果
                          </div>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                )}
              </Popover>
            )
          })}

          {/* More Filters Dropdown */}
          {filters.length > visibleFilterCount && (() => {
            // Filter hidden filters based on search - search both filter names and option labels
            const hiddenFilters = filters.slice(visibleFilterCount)
            const filteredHiddenFilters = moreFiltersSearch
              ? hiddenFilters.filter(f => {
                const searchLower = moreFiltersSearch.toLowerCase()
                // Match filter name
                if (f.label.toLowerCase().includes(searchLower)) {
                  return true
                }
                // Match any option label (if they exist)
                return (f.options || []).some(opt =>
                  opt.label.toLowerCase().includes(searchLower)
                )
              })
              : hiddenFilters

            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1 whitespace-nowrap flex-shrink-0">
                    <Filter className="h-4 w-4" />
                    更多
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                      {hiddenFilters.length}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>更多筛选</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Search input for more filters */}
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="搜索筛选项..."
                        value={moreFiltersSearch}
                        onChange={(e) => {
                          e.stopPropagation()
                          setMoreFiltersSearch(e.target.value)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 pl-7 pr-7 text-sm"
                      />
                      {moreFiltersSearch && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setMoreFiltersSearch("")
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {filteredHiddenFilters.length > 0 ? (
                    filteredHiddenFilters.map((filter) => {
                      const activeCount = getActiveFilterCount(filter.id)
                      const hasActiveFilters = activeCount > 0
                      const filterSearch = filterSearches[filter.id] || ""

                      // Check if this filter matches by option content
                      const searchLower = moreFiltersSearch.toLowerCase()
                      const matchedByOption = moreFiltersSearch &&
                        !filter.label.toLowerCase().includes(searchLower) &&
                        (filter.options || []).some(opt => opt.label.toLowerCase().includes(searchLower))

                      // Filter options based on search - use moreFiltersSearch if matched by option
                      const effectiveSearch = matchedByOption ? moreFiltersSearch : filterSearch
                      const filteredOptions = (filter.options || []).filter(option =>
                        option.label.toLowerCase().includes(effectiveSearch.toLowerCase())
                      )

                      // Show match count if matched by option
                      const matchCount = matchedByOption ? filteredOptions.length : 0

                      return (
                        <DropdownMenuSub key={filter.id}>
                          <DropdownMenuSubTrigger className="flex items-center justify-between">
                            <span>{filter.label}</span>
                            <div className="flex items-center gap-1">
                              {matchCount > 0 && (
                                <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs bg-primary/10 text-primary">
                                  {matchCount}
                                </Badge>
                              )}
                              {activeCount > 0 && (
                                <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                                  {activeCount}
                                </Badge>
                              )}
                            </div>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent className="w-64 p-0 max-h-[400px]">
                              <div className="flex items-center justify-between px-3 py-2 border-b sticky top-0 bg-popover z-10">
                                <span className="text-sm font-semibold">{filter.label}</span>
                                {hasActiveFilters && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      // Clear all filters for this filter type
                                      setActiveFilters((prev) => {
                                        const newFilters = prev.filter((f) => f.filterId !== filter.id)
                                        onFiltersChange?.(newFilters)
                                        return newFilters
                                      })
                                    }}
                                  >
                                    Clear
                                  </Button>
                                )}
                              </div>

                              {/* Search input for filter options */}
                              <div className="p-2 border-b sticky top-[41px] bg-popover z-10">
                                <div className="relative">
                                  <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    placeholder={`Search ${filter.label.toLowerCase()}...`}
                                    value={effectiveSearch}
                                    onChange={(e) => {
                                      e.stopPropagation()
                                      setFilterSearches(prev => ({ ...prev, [filter.id]: e.target.value }))
                                      // Clear parent search if user starts typing in child
                                      if (matchedByOption) {
                                        setMoreFiltersSearch("")
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-8 pl-7 pr-7 text-sm"
                                  />
                                  {effectiveSearch && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setFilterSearches(prev => ({ ...prev, [filter.id]: "" }))
                                        if (matchedByOption) {
                                          setMoreFiltersSearch("")
                                        }
                                      }}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="p-1 max-h-[300px] overflow-y-auto">
                                {filteredOptions.length > 0 ? (
                                  filteredOptions.map((option) => (
                                    <label
                                      key={option.id}
                                      className="flex items-center gap-2 px-2 py-2 hover:bg-primary-hover/10 hover:text-primary rounded-sm cursor-pointer transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Checkbox
                                        checked={isFilterActive(filter.id, option.id)}
                                        onCheckedChange={() => handleFilterToggle(filter, option)}
                                      />
                                      <span className="text-sm flex-1">{option.label}</span>
                                    </label>
                                  ))
                                ) : (
                                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                    No results found
                                  </div>
                                )}
                              </div>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      )
                    })
                  ) : (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      未找到匹配的筛选项
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          })()}
        </div>

        {/* Right side actions */}
        <div ref={rightActionsRef} className="flex items-center gap-2 flex-shrink-0">
          {/* Batch Search */}
          {/* Batch Search (Default/Text variant placed in right actions) */}


          {/* Advanced Search */}
          {advancedSearchFields.length > 0 && onAdvancedSearch && (
            <AdvancedSearchDialog
              fields={advancedSearchFields}
              onSearch={handleAdvancedSearch}
              trigger={
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  <SearchX className="mr-2 h-4 w-4" />
                  高级搜索
                  {advancedSearchFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                      {advancedSearchFilters.length}
                    </Badge>
                  )}
                </Button>
              }
            />
          )}

          {/* Column Visibility Control */}
          {columns.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[280px] max-h-[400px] overflow-y-auto">
                <DropdownMenuLabel className="flex items-center justify-between py-2">
                  <span>Toggle columns</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // Restore to default visibility settings
                      const updatedColumns = columns.map(col => ({
                        ...col,
                        visible: col.defaultVisible !== false
                      }))
                      onColumnsChange?.(updatedColumns)
                    }}
                  >
                    Restore Defaults
                  </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-1">
                  {columns.map((column) => (
                    <div
                      key={column.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, column.id)}
                      onDragOver={(e) => handleDragOver(e, column.id)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, column.id)}
                      className={cn(
                        "flex items-center gap-2 px-2 py-2 rounded-sm cursor-move transition-colors",
                        "hover:bg-primary-hover/10 hover:text-primary",
                        draggedColumn === column.id && "opacity-50",
                        dragOverColumn === column.id && "border-t-2 border-primary"
                      )}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <label className="flex items-center gap-2 flex-1 cursor-pointer">
                        <Checkbox
                          checked={column.visible}
                          onCheckedChange={() => handleColumnToggle(column.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-sm flex-1">{column.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  Saved
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Saved Filters</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {savedFilters.map((saved) => (
                  <DropdownMenuItem
                    key={saved.id}
                    onClick={() => {
                      setActiveFilters(saved.filters)
                      onFiltersChange?.(saved.filters)
                    }}
                  >
                    {saved.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Active Filters Pills */}
      {(activeFilters.length > 0 || advancedSearchFilters.length > 0 || searchValue) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">已选筛选:</span>

          {searchValue && (
            <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
              搜索: {searchValue}
              <button
                onClick={() => handleSearchChange("")}
                className="ml-1 hover:bg-primary/30 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {activeFilters.map((filter, index) => (
            <Badge key={`${filter.filterId}-${filter.optionId}-${index}`} className="gap-1 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
              {filter.filterLabel}: {filter.optionLabel}
              <button
                onClick={() => handleRemoveFilter(filter)}
                className="ml-1 hover:bg-primary/30 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {advancedSearchFilters.map((filter, index) => (
            <Badge key={`advanced-${filter.fieldId}-${index}`} className="gap-1 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
              {filter.fieldLabel}: {filter.displayValue}
              <button
                onClick={() => handleRemoveAdvancedSearchFilter(filter)}
                className="ml-1 hover:bg-primary/30 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-6 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
          >
            清除全部
          </Button>
        </div>
      )}
    </div>
  )
}
