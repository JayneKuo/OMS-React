"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"

interface AdvancedSearchProps {
  placeholder?: string
  onSearch: (terms: string[]) => void
  supportMultiple?: boolean
}

export function AdvancedSearch({ 
  placeholder = "Search...", 
  onSearch,
  supportMultiple = true 
}: AdvancedSearchProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [searchTerms, setSearchTerms] = React.useState<string[]>([])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault()
      addSearchTerm(inputValue.trim())
    }
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
    if (value.includes(",")) {
      const terms = value.split(",").map(t => t.trim()).filter(Boolean)
      terms.forEach(term => addSearchTerm(term))
      setInputValue("")
    }
  }

  const addSearchTerm = (term: string) => {
    if (supportMultiple) {
      const newTerms = [...searchTerms, term]
      setSearchTerms(newTerms)
      onSearch(newTerms)
      setInputValue("")
    } else {
      setSearchTerms([term])
      onSearch([term])
    }
  }

  const removeTerm = (index: number) => {
    const newTerms = searchTerms.filter((_, i) => i !== index)
    setSearchTerms(newTerms)
    onSearch(newTerms)
  }

  const clearAll = () => {
    setSearchTerms([])
    setInputValue("")
    onSearch([])
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-20"
        />
        {(searchTerms.length > 0 || inputValue) && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
            onClick={clearAll}
          >
            Clear
          </Button>
        )}
      </div>
      {supportMultiple && searchTerms.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {searchTerms.map((term, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {term}
              <button
                onClick={() => removeTerm(index)}
                className="ml-1 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {supportMultiple && (
        <p className="text-xs text-muted-foreground">
          Press Enter or use comma (,) to add multiple search terms
        </p>
      )}
    </div>
  )
}
