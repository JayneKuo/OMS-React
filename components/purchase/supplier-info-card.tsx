"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Building, MapPin, Calendar, Truck, Package, Edit } from "lucide-react"

// 供应商信息接口
interface SupplierInfo {
  supplierId?: string
  supplierName?: string
  supplierCode?: string
  contactPerson?: string
  contactPhone?: string
  contactEmail?: string
  address?: string
  expectedDeliveryDate?: string
  shippingDate?: string
  targetWarehouse?: string
  warehouseName?: string
  warehouseAddress?: string
  deliveryTerms?: string // 交货条款
  paymentTerms?: string // 付款条款
  notes?: string
}

// 仓库数据
const mockWarehouses = [
  { id: "WH001", name: "Main Warehouse - Los Angeles", code: "LA-MAIN", address: "1234 Main St, Los Angeles, CA 90001" },
  { id: "WH002", name: "East Distribution Center - New York", code: "NY-EAST", address: "5678 East Ave, New York, NY 10001" },
  { id: "WH003", name: "West Fulfillment Center - Seattle", code: "SEA-WEST", address: "9012 West Blvd, Seattle, WA 98001" },
  { id: "WH004", name: "Central Warehouse - Chicago", code: "CHI-CENTRAL", address: "3456 Central Rd, Chicago, IL 60601" },
]

interface SupplierInfoCardProps {
  lineNo: number
  productName: string
  skuCode: string
  supplierInfo: SupplierInfo
  onSupplierInfoChange: (info: SupplierInfo) => void
  isEditable?: boolean
}

export function SupplierInfoCard({
  lineNo,
  productName,
  skuCode,
  supplierInfo,
  onSupplierInfoChange,
  isEditable = true
}: SupplierInfoCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [editMode, setEditMode] = React.useState(false)

  const selectedWarehouse = mockWarehouses.find(w => w.id === supplierInfo.targetWarehouse)

  const updateField = (field: keyof SupplierInfo, value: string) => {
    if (field === 'targetWarehouse') {
      const warehouse = mockWarehouses.find(w => w.id === value)
      onSupplierInfoChange({
        ...supplierInfo,
        [field]: value,
        warehouseName: warehouse?.name || '',
        warehouseAddress: warehouse?.address || ''
      })
    } else {
      onSupplierInfoChange({
        ...supplierInfo,
        [field]: value
      })
    }
  }

  return (
    <Card className="mt-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building className="h-4 w-4" />
            供应商信息 - 行 {lineNo}
            <Badge variant="outline" className="text-xs">{skuCode}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            {isEditable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditMode(!editMode)}
              >
                <Edit className="h-3 w-3 mr-1" />
                {editMode ? '完成' : '编辑'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? '收起' : '展开'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* 供应商基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                供应商名称
              </Label>
              {editMode ? (
                <Input
                  value={supplierInfo.supplierName || ''}
                  onChange={(e) => updateField('supplierName', e.target.value)}
                  placeholder="输入供应商名称"
                  className="h-8 text-sm"
                />
              ) : (
                <div className="text-sm py-1 px-2 bg-muted rounded">
                  {supplierInfo.supplierName || '-'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>供应商编码</Label>
              {editMode ? (
                <Input
                  value={supplierInfo.supplierCode || ''}
                  onChange={(e) => updateField('supplierCode', e.target.value)}
                  placeholder="供应商编码"
                  className="h-8 text-sm"
                />
              ) : (
                <div className="text-sm py-1 px-2 bg-muted rounded">
                  {supplierInfo.supplierCode || '-'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>联系人</Label>
              {editMode ? (
                <Input
                  value={supplierInfo.contactPerson || ''}
                  onChange={(e) => updateField('contactPerson', e.target.value)}
                  placeholder="联系人姓名"
                  className="h-8 text-sm"
                />
              ) : (
                <div className="text-sm py-1 px-2 bg-muted rounded">
                  {supplierInfo.contactPerson || '-'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>联系电话</Label>
              {editMode ? (
                <Input
                  value={supplierInfo.contactPhone || ''}
                  onChange={(e) => updateField('contactPhone', e.target.value)}
                  placeholder="联系电话"
                  className="h-8 text-sm"
                />
              ) : (
                <div className="text-sm py-1 px-2 bg-muted rounded">
                  {supplierInfo.contactPhone || '-'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>联系邮箱</Label>
              {editMode ? (
                <Input
                  value={supplierInfo.contactEmail || ''}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                  placeholder="联系邮箱"
                  className="h-8 text-sm"
                />
              ) : (
                <div className="text-sm py-1 px-2 bg-muted rounded">
                  {supplierInfo.contactEmail || '-'}
                </div>
              )}
            </div>
          </div>

          {/* 地址信息 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              供应商地址
            </Label>
            {editMode ? (
              <Textarea
                value={supplierInfo.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="供应商详细地址"
                rows={2}
                className="text-sm"
              />
            ) : (
              <div className="text-sm py-2 px-3 bg-muted rounded min-h-[60px]">
                {supplierInfo.address || '-'}
              </div>
            )}
          </div>

          {/* 时间和仓库信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                期望收货时间
              </Label>
              {editMode ? (
                <Input
                  type="date"
                  value={supplierInfo.expectedDeliveryDate || ''}
                  onChange={(e) => updateField('expectedDeliveryDate', e.target.value)}
                  className="h-8 text-sm"
                />
              ) : (
                <div className="text-sm py-1 px-2 bg-muted rounded">
                  {supplierInfo.expectedDeliveryDate || '-'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Truck className="h-3 w-3" />
                发货时间
              </Label>
              {editMode ? (
                <Input
                  type="date"
                  value={supplierInfo.shippingDate || ''}
                  onChange={(e) => updateField('shippingDate', e.target.value)}
                  className="h-8 text-sm"
                />
              ) : (
                <div className="text-sm py-1 px-2 bg-muted rounded">
                  {supplierInfo.shippingDate || '-'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                收货仓库
              </Label>
              {editMode ? (
                <Select 
                  value={supplierInfo.targetWarehouse || ''} 
                  onValueChange={(value) => updateField('targetWarehouse', value)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="选择仓库" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockWarehouses.map(warehouse => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm py-1 px-2 bg-muted rounded">
                  {selectedWarehouse?.name || '-'}
                </div>
              )}
            </div>
          </div>

          {/* 仓库地址 */}
          {selectedWarehouse && (
            <div className="space-y-2">
              <Label>仓库地址</Label>
              <div className="text-sm py-2 px-3 bg-blue-50 rounded border border-blue-200">
                {selectedWarehouse.address}
              </div>
            </div>
          )}

          {/* 交货和付款条款 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>交货条款</Label>
              {editMode ? (
                <Select 
                  value={supplierInfo.deliveryTerms || ''} 
                  onValueChange={(value) => updateField('deliveryTerms', value)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="选择交货条款" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FOB">FOB (Free On Board)</SelectItem>
                    <SelectItem value="CIF">CIF (Cost, Insurance, Freight)</SelectItem>
                    <SelectItem value="EXW">EXW (Ex Works)</SelectItem>
                    <SelectItem value="DDP">DDP (Delivered Duty Paid)</SelectItem>
                    <SelectItem value="FCA">FCA (Free Carrier)</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm py-1 px-2 bg-muted rounded">
                  {supplierInfo.deliveryTerms || '-'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>付款条款</Label>
              {editMode ? (
                <Select 
                  value={supplierInfo.paymentTerms || ''} 
                  onValueChange={(value) => updateField('paymentTerms', value)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="选择付款条款" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NET30">NET 30 (30天付款)</SelectItem>
                    <SelectItem value="NET60">NET 60 (60天付款)</SelectItem>
                    <SelectItem value="COD">COD (货到付款)</SelectItem>
                    <SelectItem value="PREPAID">预付款</SelectItem>
                    <SelectItem value="LC">信用证</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm py-1 px-2 bg-muted rounded">
                  {supplierInfo.paymentTerms || '-'}
                </div>
              )}
            </div>
          </div>

          {/* 备注 */}
          <div className="space-y-2">
            <Label>备注说明</Label>
            {editMode ? (
              <Textarea
                value={supplierInfo.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="供应商相关备注..."
                rows={2}
                className="text-sm"
              />
            ) : (
              <div className="text-sm py-2 px-3 bg-muted rounded min-h-[60px]">
                {supplierInfo.notes || '-'}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}