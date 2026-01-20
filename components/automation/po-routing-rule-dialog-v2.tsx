"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  CheckCircle, 
  X, 
  Warehouse, 
  Package, 
  Route,
  Settings,
  Filter,
  Zap,
  Info,
  Search
} from "lucide-react"
import { toast } from "sonner"

interface RoutingRule {
  id: string
  name: string
  description: string
  enabled: boolean
  priority: number
  conditions: {
    suppliers?: string[]
    warehouses?: string[]
    productCategories?: string[]
    orderSources?: string[]
    orderTypes?: string[]
  }
  actions: {
    autoCreateReceipt: boolean
    autoReceiveVirtualWarehouse: boolean
    pushToWMS: boolean
    wmsEndpoint?: string
    warehouseRouting?: {
      type: "SINGLE" | "SPLIT_BY_SKU" | "SPLIT_BY_QUANTITY"
      warehouses: string[]
    }
  }
  createdAt: string
  updatedAt: string
}

interface PORoutingRuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule: RoutingRule | null
  onSave: (rule: RoutingRule) => void
}

// 可选的条件字段（基于PO单据字段）
const availableConditions = [
  { 
    id: "supplier", 
    label: "供应商", 
    type: "text",
    category: "基本信息"
  },
  { 
    id: "warehouse", 
    label: "目标仓库", 
    type: "select",
    options: ["巴西仓库", "美国仓库", "中国仓库", "欧洲仓库"],
    category: "基本信息"
  },
  { 
    id: "poStatus", 
    label: "PO状态", 
    type: "select",
    options: ["草稿", "待审批", "已审批", "已发送", "部分收货", "已完成", "已取消"],
    category: "基本信息"
  },
  { 
    id: "totalAmount", 
    label: "订单总额", 
    type: "number",
    operators: ["等于", "大于", "小于", "大于等于", "小于等于", "介于"],
    category: "金额信息"
  },
  { 
    id: "currency", 
    label: "币种", 
    type: "select",
    options: ["USD", "CNY", "EUR", "GBP", "JPY", "BRL"],
    category: "金额信息"
  },
  { 
    id: "paymentTerm", 
    label: "付款条款", 
    type: "select",
    options: ["预付款", "货到付款", "30天账期", "60天账期", "90天账期"],
    category: "金额信息"
  },
  { 
    id: "shippingMethod", 
    label: "运输方式", 
    type: "select",
    options: ["海运", "空运", "快递", "陆运", "铁路"],
    category: "物流信息"
  },
  { 
    id: "expectedArrivalDate", 
    label: "预计到货日期", 
    type: "dateRange",
    category: "物流信息"
  },
  { 
    id: "productCategory", 
    label: "产品分类", 
    type: "text",
    category: "产品信息"
  },
  { 
    id: "sku", 
    label: "SKU", 
    type: "text",
    category: "产品信息"
  },
  { 
    id: "itemCount", 
    label: "商品行数", 
    type: "number",
    operators: ["等于", "大于", "小于"],
    category: "产品信息"
  },
  { 
    id: "totalQuantity", 
    label: "总数量", 
    type: "number",
    operators: ["等于", "大于", "小于", "大于等于", "小于等于"],
    category: "产品信息"
  },
  { 
    id: "createdBy", 
    label: "创建人", 
    type: "text",
    category: "其他"
  },
  { 
    id: "tags", 
    label: "标签", 
    type: "text",
    category: "其他"
  }
]

export function PORoutingRuleDialogV2({ open, onOpenChange, rule, onSave }: PORoutingRuleDialogProps) {
  const [formData, setFormData] = React.useState<Partial<RoutingRule>>({
    name: "",
    description: "",
    enabled: true,
    priority: 1,
    conditions: {},
    actions: {
      autoCreateReceipt: false,
      autoReceiveVirtualWarehouse: false,
      pushToWMS: false
    }
  })

  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedFields, setSelectedFields] = React.useState<string[]>([])
  const [fieldValues, setFieldValues] = React.useState<Record<string, any>>({})

  // Initialize form when dialog opens or rule changes
  React.useEffect(() => {
    if (open) {
      if (rule) {
        setFormData(rule)
        // TODO: 初始化已选字段和值
        setSelectedFields([])
        setFieldValues({})
      } else {
        setFormData({
          name: "",
          description: "",
          enabled: true,
          priority: 1,
          conditions: {},
          actions: {
            autoCreateReceipt: false,
            autoReceiveVirtualWarehouse: false,
            pushToWMS: false
          }
        })
        setSelectedFields([])
        setFieldValues({})
      }
    }
  }, [open, rule])

  const handleSave = () => {
    if (!formData.name?.trim()) {
      toast.error("Please enter a rule name")
      return
    }

    const savedRule: RoutingRule = {
      id: rule?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description || "",
      enabled: formData.enabled ?? true,
      priority: formData.priority || 1,
      conditions: fieldValues,
      actions: formData.actions || {
        autoCreateReceipt: false,
        autoReceiveVirtualWarehouse: false,
        pushToWMS: false
      },
      createdAt: rule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onSave(savedRule)
    toast.success(rule ? "Rule updated successfully" : "Rule created successfully")
  }

  const toggleField = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      setSelectedFields(selectedFields.filter(id => id !== fieldId))
      const newValues = { ...fieldValues }
      delete newValues[fieldId]
      setFieldValues(newValues)
    } else {
      setSelectedFields([...selectedFields, fieldId])
    }
  }

  const updateFieldValue = (fieldId: string, value: any) => {
    setFieldValues({
      ...fieldValues,
      [fieldId]: value
    })
  }

  const removeField = (fieldId: string) => {
    setSelectedFields(selectedFields.filter(id => id !== fieldId))
    const newValues = { ...fieldValues }
    delete newValues[fieldId]
    setFieldValues(newValues)
  }

  const renderFieldInput = (field: typeof availableConditions[0]) => {
    const value = fieldValues[field.id] || {}

    switch (field.type) {
      case "text":
        return (
          <Input
            value={value.value || ""}
            onChange={(e) => updateFieldValue(field.id, { value: e.target.value })}
            placeholder={`输入${field.label}`}
          />
        )

      case "select":
        return (
          <Select
            value={value.value || ""}
            onValueChange={(val) => updateFieldValue(field.id, { value: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder={`选择${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "number":
        return (
          <div className="space-y-2">
            <Select
              value={value.operator || "等于"}
              onValueChange={(op) => updateFieldValue(field.id, { ...value, operator: op })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {field.operators?.map((op) => (
                  <SelectItem key={op} value={op}>
                    {op}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {value.operator === "介于" ? (
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={value.min || ""}
                  onChange={(e) => updateFieldValue(field.id, { ...value, min: e.target.value })}
                  placeholder="最小值"
                />
                <Input
                  type="number"
                  value={value.max || ""}
                  onChange={(e) => updateFieldValue(field.id, { ...value, max: e.target.value })}
                  placeholder="最大值"
                />
              </div>
            ) : (
              <Input
                type="number"
                value={value.value || ""}
                onChange={(e) => updateFieldValue(field.id, { ...value, value: e.target.value })}
                placeholder={`输入${field.label}`}
              />
            )}
          </div>
        )

      case "dateRange":
        return (
          <div className="space-y-2">
            <Input
              type="date"
              value={value.start || ""}
              onChange={(e) => updateFieldValue(field.id, { ...value, start: e.target.value })}
            />
            <Input
              type="date"
              value={value.end || ""}
              onChange={(e) => updateFieldValue(field.id, { ...value, end: e.target.value })}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1200px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>{rule ? "Edit Routing Rule" : "Create Routing Rule"}</DialogTitle>
          <DialogDescription>
            Select conditions and configure actions for purchase order routing
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[calc(90vh-180px)]">
          {/* Left Side - Condition Selector */}
          <div className="w-[320px] flex-shrink-0 border-r overflow-y-auto p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">规则配置</h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    规则名称 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：巴西仓库路由规则"
                    className="h-10"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${formData.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <Label className="text-sm font-medium cursor-pointer">启用规则</Label>
                  </div>
                  <Switch
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Condition Search */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">选择条件</h3>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索条件字段..."
                  className="pl-9 h-10"
                />
              </div>
            </div>

            {/* Condition List */}
            <div className="space-y-4">
              {Object.entries(
                availableConditions.reduce((acc, field) => {
                  if (!acc[field.category]) acc[field.category] = []
                  acc[field.category].push(field)
                  return acc
                }, {} as Record<string, typeof availableConditions>)
              ).map(([category, fields]) => {
                const filteredFields = fields.filter(field => 
                  searchTerm === "" || 
                  field.label.toLowerCase().includes(searchTerm.toLowerCase())
                )
                
                if (filteredFields.length === 0) return null

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded">
                      <div className="w-1 h-4 bg-primary rounded-full" />
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {category}
                      </Label>
                    </div>
                    <div className="space-y-1 pl-2">
                      {filteredFields.map((field) => (
                        <div 
                          key={field.id} 
                          className={`flex items-center space-x-3 p-2 rounded-md hover:bg-accent/50 transition-colors ${
                            selectedFields.includes(field.id) ? 'bg-accent/30' : ''
                          }`}
                        >
                          <Checkbox
                            id={field.id}
                            checked={selectedFields.includes(field.id)}
                            onCheckedChange={() => toggleField(field.id)}
                            className="mt-0.5"
                          />
                          <label
                            htmlFor={field.id}
                            className="text-sm cursor-pointer flex-1 select-none"
                          >
                            {field.label}
                          </label>
                          {selectedFields.includes(field.id) && (
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Side - Selected Conditions & Value Inputs */}
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-muted/30 to-muted/10 space-y-6">
            {/* Selected Conditions with Inputs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-semibold">已选择条件</h3>
                </div>
                <Badge variant={selectedFields.length > 0 ? "default" : "secondary"} className="font-semibold">
                  {selectedFields.length}
                </Badge>
              </div>

              {selectedFields.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 text-center p-8 border-2 border-dashed rounded-lg bg-card/50">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Info className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">未选择任何条件</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      规则将应用于所有PO订单
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedFields.map((fieldId) => {
                    const field = availableConditions.find(f => f.id === fieldId)
                    if (!field) return null

                    return (
                      <Card key={fieldId} className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3 pt-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              {field.label}
                            </CardTitle>
                            <button
                              onClick={() => removeField(fieldId)}
                              className="text-muted-foreground hover:text-destructive transition-colors p-1 hover:bg-destructive/10 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-4">
                          {renderFieldInput(field)}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">设置动作</h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors group">
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <Label className="text-sm font-medium cursor-pointer">自动创建收货单</Label>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                      PO到达时自动创建收货记录
                    </p>
                  </div>
                  <Switch
                    checked={formData.actions?.autoCreateReceipt}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      actions: { ...formData.actions!, autoCreateReceipt: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors group">
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Warehouse className="h-4 w-4 text-green-600" />
                      <Label className="text-sm font-medium cursor-pointer">虚拟仓自动收货</Label>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                      虚拟仓库自动标记为已收货
                    </p>
                  </div>
                  <Switch
                    checked={formData.actions?.autoReceiveVirtualWarehouse}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      actions: { ...formData.actions!, autoReceiveVirtualWarehouse: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors group">
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-purple-600" />
                      <Label className="text-sm font-medium cursor-pointer">推送到WMS</Label>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                      发送数据到外部WMS系统
                    </p>
                  </div>
                  <Switch
                    checked={formData.actions?.pushToWMS}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      actions: { ...formData.actions!, pushToWMS: checked }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            {rule ? "更新规则" : "创建规则"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
