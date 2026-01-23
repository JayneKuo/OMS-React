"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { 
  Plus, 
  Trash2, 
  Filter, 
  Zap, 
  AlertCircle,
  X,
  Warehouse,
  Package,
  Mail,
  Tag,
  AlertTriangle,
  Split,
  GripVertical,
  Shield
} from "lucide-react"
import { toast } from "sonner"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { 
  RoutingRule, 
  RoutingRuleCondition, 
  RuleAction,
  ConditionField,
  ConditionOperator,
  ConditionLogic,
  WorkflowAction
} from "@/lib/types/routing-rule"

interface RuleBuilderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule: RoutingRule | null
  onSave: (rule: RoutingRule) => void
}

const CONDITION_FIELDS: { value: ConditionField; label: string; type: "text" | "number" }[] = [
  { value: "purchaseType", label: "Purchase Type", type: "text" },
  { value: "supplier", label: "Supplier Name", type: "text" },
  { value: "supplierId", label: "Supplier ID", type: "text" },
  { value: "sku", label: "SKU", type: "text" },
  { value: "category", label: "Product Category", type: "text" },
  { value: "brand", label: "Brand", type: "text" },
  { value: "warehouse", label: "Source Warehouse", type: "text" },
  { value: "destinationWarehouse", label: "Destination Warehouse", type: "text" },
  { value: "amount", label: "Order Amount", type: "number" },
  { value: "quantity", label: "Order Quantity", type: "number" },
  { value: "weight", label: "Total Weight", type: "number" },
  { value: "country", label: "Country", type: "text" },
  { value: "region", label: "Region", type: "text" },
  { value: "tags", label: "Tags", type: "text" },
]

const OPERATORS: { value: ConditionOperator; label: string; types: ("text" | "number")[] }[] = [
  { value: "equals", label: "equals", types: ["text", "number"] },
  { value: "notEquals", label: "not equals", types: ["text", "number"] },
  { value: "contains", label: "contains", types: ["text"] },
  { value: "notContains", label: "not contains", types: ["text"] },
  { value: "greaterThan", label: ">", types: ["number"] },
  { value: "lessThan", label: "<", types: ["number"] },
  { value: "greaterThanOrEqual", label: "≥", types: ["number"] },
  { value: "lessThanOrEqual", label: "≤", types: ["number"] },
  { value: "startsWith", label: "starts with", types: ["text"] },
  { value: "endsWith", label: "ends with", types: ["text"] },
]
