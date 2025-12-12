"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export interface SearchField {
  id: string
  label: string
  placeholder?: string
}

export interface AdvancedSearchValues {
  [key: string]: string
}

interface AdvancedSearchDialogProps {
  fields: SearchField[]
  onSearch: (values: AdvancedSearchValues) => void
  trigger?: React.ReactNode
}

export function AdvancedSearchDialog({
  fields,
  onSearch,
  trigger,
}: AdvancedSearchDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [values, setValues] = React.useState<AdvancedSearchValues>({})

  const handleValueChange = (fieldId: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleClear = () => {
    setValues({})
  }

  const handleSearch = () => {
    // Filter out empty values
    const filteredValues = Object.entries(values).reduce((acc, [key, value]) => {
      if (value.trim()) {
        acc[key] = value.trim()
      }
      return acc
    }, {} as AdvancedSearchValues)
    
    onSearch(filteredValues)
    setOpen(false)
  }

  const hasValues = Object.values(values).some(v => v.trim())

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Search className="mr-2 h-4 w-4" />
            Advanced Search
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Advanced Search</DialogTitle>
          <DialogDescription>
            Search by specific fields for more precise results
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {fields.map((field) => (
            <div key={field.id} className="grid gap-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              <div className="relative">
                <Input
                  id={field.id}
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                  value={values[field.id] || ""}
                  onChange={(e) => handleValueChange(field.id, e.target.value)}
                  className="pr-8"
                />
                {values[field.id] && (
                  <button
                    onClick={() => handleValueChange(field.id, "")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={!hasValues}
          >
            Clear All
          </Button>
          <Button onClick={handleSearch}>
            Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
