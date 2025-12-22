"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  allowCustom?: boolean
  disabled?: boolean
  className?: string
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select or enter...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  allowCustom = true,
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const selectedOption = options.find(option => option.value === value)
  
  // 当popover打开时，重置搜索值
  React.useEffect(() => {
    if (open) {
      setSearchValue("")
    }
  }, [open])

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === "__CUSTOM__") {
      // 用户选择使用自定义值
      if (searchValue.trim()) {
        onValueChange?.(searchValue.trim())
        setSearchValue("")
        setOpen(false)
      }
      return
    }
    // 找到对应的选项，使用其value
    const option = options.find(opt => 
      opt.value === selectedValue || 
      opt.label === selectedValue ||
      opt.value.toLowerCase() === selectedValue.toLowerCase() ||
      opt.label.toLowerCase() === selectedValue.toLowerCase()
    )
    if (option) {
      onValueChange?.(option.value)
      setSearchValue("")
      setOpen(false)
    } else {
      // 如果没有找到匹配项，直接使用选中的值（可能是自定义输入）
      onValueChange?.(selectedValue)
      setSearchValue("")
      setOpen(false)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && allowCustom && searchValue.trim()) {
      // 如果输入了自定义值，按Enter直接使用
      const customValue = searchValue.trim()
      if (!options.find(opt => opt.value === customValue)) {
        onValueChange?.(customValue)
        setSearchValue("")
        setOpen(false)
      }
    }
  }

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options
    const searchLower = searchValue.toLowerCase()
    return options.filter(option =>
      option.label.toLowerCase().includes(searchLower) ||
      option.value.toLowerCase().includes(searchLower)
    )
  }, [options, searchValue])

  const displayValue = selectedOption ? selectedOption.label : value || ""

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <span className="truncate">
            {displayValue || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
            onKeyDown={handleInputKeyDown}
          />
          <CommandList>
            <CommandEmpty>
              {allowCustom && searchValue.trim() ? (
                <div className="py-2">
                  <div className="text-sm text-muted-foreground mb-2">{emptyText}</div>
                  <CommandItem
                    value="__CUSTOM__"
                    onSelect={() => {
                      if (searchValue.trim()) {
                        onValueChange?.(searchValue.trim())
                        setSearchValue("")
                        setOpen(false)
                      }
                    }}
                    className="text-primary font-medium"
                  >
                    <Check className="mr-2 h-4 w-4 opacity-0" />
                    Use "{searchValue.trim()}"
                  </CommandItem>
                </div>
              ) : (
                emptyText
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    // CommandItem的onSelect接收的currentValue就是value属性的值
                    // 直接使用option.value，因为currentValue应该等于option.value
                    onValueChange?.(option.value)
                    setSearchValue("")
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

