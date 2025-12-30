"use client"

import * as React from "react"
import { Search, X, ChevronDown, Filter, SlidersHorizontal, Settings2, SearchX, GripVertical } from "lucide-react"
import { AdvancedSearchDialog, SearchField, AdvancedSearchValues } from "./advanced-search-dialog"
import { Input } from "@/components/ui/input"
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
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface FilterOption {
  id: string
  label: string
  value: string
}

export interface FilterConfig {
  id: string
  label: string
  options: FilterOption[]
  type?: "single" | "multiple"
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

interface FilterBarProps {
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
  onAdvancedSearch?: (values: AdvancedSearchValues) => void
  className?: string
}

export function FilterBar({
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
  className,
}: FilterBarProps) {
  const [searchValue, setSearchValue] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<ActiveFilter[]>([])
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const [filterSearches, setFilterSearches] = React.useState<Record<string, string>>({})

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
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

  const handleRemoveFilter = (filter: ActiveFilter) => {
    setActiveFilters((prev) => {
      const newFilters = prev.filter(
        (f) => !(f.filterId === filter.filterId && f.optionId === filter.optionId)
      )
      onFiltersChange?.(newFilters)
      return newFilters
    })
  }

  const handleClearAll = () => {
    setActiveFilters([])
    setSearchValue("")
    onSearchChange?.("")
    onFiltersChange?.([])
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
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2 flex-1">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchValue && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Popovers */}
        {filters.map((filter) => {
          const activeCount = getActiveFilterCount(filter.id)
          const hasActiveFilters = activeCount > 0
          const filterSearch = filterSearches[filter.id] || ""
          
          // Filter options based on search
          const filteredOptions = filter.options.filter(option =>
            option.label.toLowerCase().includes(filterSearch.toLowerCase())
          )
          
          return (
            <Popover key={filter.id}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  {filter.label}
                  {activeCount > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                      {activeCount}
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 p-0">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                  <span className="text-sm font-semibold">{filter.label}</span>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => {
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
                {filter.options.length > 5 && (
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder={`Search ${filter.label.toLowerCase()}...`}
                        value={filterSearch}
                        onChange={(e) => setFilterSearches(prev => ({ ...prev, [filter.id]: e.target.value }))}
                        className="h-8 pl-7 pr-7 text-sm"
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
                  </div>
                )}
                
                <div className="p-1 max-h-[300px] overflow-y-auto">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center gap-2 px-2 py-2 hover:bg-primary-hover/10 rounded-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isFilterActive(filter.id, option.id)}
                          onChange={() => handleFilterToggle(filter, option)}
                          className="h-4 w-4 rounded border-primary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
              </PopoverContent>
            </Popover>
          )
        })}

        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Advanced Search */}
          {advancedSearchFields.length > 0 && onAdvancedSearch && (
            <AdvancedSearchDialog
              fields={advancedSearchFields}
              onSearch={onAdvancedSearch}
              trigger={
                <Button variant="outline" size="sm">
                  <SearchX className="mr-2 h-4 w-4" />
                  Advanced
                </Button>
              }
            />
          )}
          
          {/* Column Visibility Control */}
          {columns.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
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
                    className="h-7 px-2 text-xs hover:bg-primary-hover/10"
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
                        "hover:bg-primary-hover/10",
                        draggedColumn === column.id && "opacity-50",
                        dragOverColumn === column.id && "border-t-2 border-primary"
                      )}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <label className="flex items-center gap-2 flex-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={column.visible}
                          onChange={() => handleColumnToggle(column.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded border-primary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
                <Button variant="outline" size="sm">
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
      {(activeFilters.length > 0 || searchValue) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {searchValue && (
            <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
              Search: {searchValue}
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

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-6 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
