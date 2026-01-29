"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export default function TestComboboxPage() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  const skus = ["AMZ-US-12345", "AMZ-UK-67890", "SHOP-67890", "EBAY-11111"]

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Combobox Test</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Testing if combobox selection works
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Selected Value: {value || "None"}</p>
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[400px] justify-between"
            >
              {value || "Select SKU..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput placeholder="Search SKU..." />
              <CommandList>
                <CommandEmpty>No SKU found.</CommandEmpty>
                <CommandGroup>
                  {skus.map((sku) => (
                    <CommandItem
                      key={sku}
                      value={sku}
                      onSelect={() => {
                        console.log('Selected:', sku)
                        setValue(sku)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === sku ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {sku}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
