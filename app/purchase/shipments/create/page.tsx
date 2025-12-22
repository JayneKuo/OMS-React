"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Send, Plus, Package, Truck, MapPin, Building2, Clock, FileText } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { createPurchaseSidebarItems } from "@/lib/purchase-sidebar-items"

// Shipment Line Item Interface
interface ShipmentLineItem {
  id: string
  poNo: string
  poLineNo: number
  sku: string
  itemName: string
  specifications?: string
  orderedQty: number
  previouslyShipped: number
  remainingQty: number
  shippedQty: number
  uom: string
}

// Mock PO data for auto-fill
const mockPOData = {
  "1": {
    orderNo: "PO202403150001",
    supplierName: "ABC Suppliers Inc.",
    supplierCode: "SUP001",
    supplierAddress: "456 Supplier Ave, New York, NY 10001",
    contactPerson: "John Smith",
    contactPhone: "+1-555-0123",
    contactEmail: "john.smith@abcsuppliers.com",
    warehouseName: "Main Warehouse",
    warehouseAddress: "1234 Warehouse St, Los Angeles, CA 90001",
    lineItems: [
      {
        id: "1",
        poNo: "PO202403150001",
        poLineNo: 1,
        sku: "SKU001",
        itemName: "iPhone 15 Pro",
        specifications: "256GB, Natural Titanium",
        orderedQty: 100,
        previouslyShipped: 0,
        remainingQty: 100,
        shippedQty: 0,
        uom: "PCS"
      },
      {
        id: "2",
        poNo: "PO202403150001",
        poLineNo: 2,
        sku: "SKU002",
        itemName: "MacBook Pro",
        specifications: "14-inch, M3 Pro, 512GB SSD",
        orderedQty: 50,
        previouslyShipped: 0,
        remainingQty: 50,
        shippedQty: 0,
        uom: "PCS"
      }
    ]
  }
}

export default function CreateShipmentPage() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const sidebarItems = createPurchaseSidebarItems(t)
  
  // Get PO ID from URL parameters
  const poId = searchParams.get('poId')
  const poData = poId ? mockPOData[poId as keyof typeof mockPOData] : null

  // Form state
  const [formData, setFormData] = React.useState({
    // Basic Info
    shipmentNo: '',
    shipmentType: 'OUTBOUND',
    mode: 'TRUCK',
    carrier: '',
    serviceLevel: '',
    trackingNo: '',
    
    // Origin (Supplier)
    originName: poData?.supplierName || '',
    originContactPerson: poData?.contactPerson || '',
    originContactPhone: poData?.contactPhone || '',
    originContactEmail: poData?.contactEmail || '',
    originAddress: poData?.supplierAddress || '',
    
    // Destination (Warehouse)
    destinationName: poData?.warehouseName || '',
    destinationAddress: poData?.warehouseAddress || '',
    
    // Timeline
    plannedPickupDate: '',
    plannedDeliveryDate: '',
    
    // Package Info
    packages: 1,
    totalWeight: 0,
    totalVolume: 0,
    
    // Notes
    notes: ''
  })

  // Line items state
  const [lineItems, setLineItems] = React.useState<ShipmentLineItem[]>(
    poData?.lineItems || []
  )

  // Auto-generate shipment number
  React.useEffect(() => {
    if (!formData.shipmentNo) {
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      setFormData(prev => ({
        ...prev,
        shipmentNo: `SH${timestamp}${randomNum}`
      }))
    }
  }, [])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLineItemChange = (id: string, field: string, value: number) => {
    setLineItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const handleSave = () => {
    console.log('Saving shipment:', { formData, lineItems })
    // TODO: Implement save logic
  }

  const handleSubmit = () => {
    console.log('Submitting shipment:', { formData, lineItems })
    // TODO: Implement submit logic
    router.push('/purchase/shipments')
  }

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('createNewShipment')}</h1>
              {poData && (
                <p className="text-muted-foreground">
                  {t('fromPO')}: {poData.orderNo} - {poData.supplierName}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {t('save')}
            </Button>
            <Button onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-2" />
              {t('submit')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Form - Takes 3 columns on XL screens */}
          <div className="xl:col-span-3 space-y-6">
            {/* Basic Information - Optimized 2x3 grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  {t('basicInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="shipmentNo">{t('shipmentNo')}</Label>
                    <Input
                      id="shipmentNo"
                      value={formData.shipmentNo}
                      onChange={(e) => handleInputChange('shipmentNo', e.target.value)}
                      placeholder={t('systemGenerated')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shipmentType">{t('shipmentType')}</Label>
                    <Select value={formData.shipmentType} onValueChange={(value) => handleInputChange('shipmentType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OUTBOUND">{t('outbound')}</SelectItem>
                        <SelectItem value="INBOUND">{t('inbound')}</SelectItem>
                        <SelectItem value="INTERNAL">{t('internal')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="mode">{t('transportMode')}</Label>
                    <Select value={formData.mode} onValueChange={(value) => handleInputChange('mode', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRUCK">{t('truck')}</SelectItem>
                        <SelectItem value="AIR">{t('air')}</SelectItem>
                        <SelectItem value="OCEAN">{t('ocean')}</SelectItem>
                        <SelectItem value="RAIL">{t('rail')}</SelectItem>
                        <SelectItem value="EXPRESS">{t('express')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="carrier">{t('carrier')}</Label>
                    <Input
                      id="carrier"
                      value={formData.carrier}
                      onChange={(e) => handleInputChange('carrier', e.target.value)}
                      placeholder={t('selectCarrier')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceLevel">{t('serviceLevel')}</Label>
                    <Input
                      id="serviceLevel"
                      value={formData.serviceLevel}
                      onChange={(e) => handleInputChange('serviceLevel', e.target.value)}
                      placeholder={t('selectServiceLevel')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="trackingNo">{t('trackingNo')}</Label>
                    <Input
                      id="trackingNo"
                      value={formData.trackingNo}
                      onChange={(e) => handleInputChange('trackingNo', e.target.value)}
                      placeholder={t('addTrackingNo')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Origin & Destination Information - Combined for better layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Origin Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {t('originInfo')} ({t('supplierName')})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="originName">{t('supplierName')}</Label>
                    <Input
                      id="originName"
                      value={formData.originName}
                      onChange={(e) => handleInputChange('originName', e.target.value)}
                      readOnly={!!poData}
                      className={poData ? "bg-muted" : ""}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="originContactPerson">{t('contactPerson')}</Label>
                      <Input
                        id="originContactPerson"
                        value={formData.originContactPerson}
                        onChange={(e) => handleInputChange('originContactPerson', e.target.value)}
                        readOnly={!!poData}
                        className={poData ? "bg-muted" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="originContactPhone">{t('contactPhone')}</Label>
                      <Input
                        id="originContactPhone"
                        value={formData.originContactPhone}
                        onChange={(e) => handleInputChange('originContactPhone', e.target.value)}
                        readOnly={!!poData}
                        className={poData ? "bg-muted" : ""}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="originContactEmail">{t('contactEmail')}</Label>
                    <Input
                      id="originContactEmail"
                      value={formData.originContactEmail}
                      onChange={(e) => handleInputChange('originContactEmail', e.target.value)}
                      readOnly={!!poData}
                      className={poData ? "bg-muted" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="originAddress">{t('address')}</Label>
                    <Textarea
                      id="originAddress"
                      value={formData.originAddress}
                      onChange={(e) => handleInputChange('originAddress', e.target.value)}
                      readOnly={!!poData}
                      className={poData ? "bg-muted" : ""}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Destination Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {t('destinationInfo')} ({t('warehouse')})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="destinationName">{t('warehouseName')}</Label>
                    <Input
                      id="destinationName"
                      value={formData.destinationName}
                      onChange={(e) => handleInputChange('destinationName', e.target.value)}
                      readOnly={!!poData}
                      className={poData ? "bg-muted" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="destinationAddress">{t('warehouseAddress')}</Label>
                    <Textarea
                      id="destinationAddress"
                      value={formData.destinationAddress}
                      onChange={(e) => handleInputChange('destinationAddress', e.target.value)}
                      readOnly={!!poData}
                      className={poData ? "bg-muted" : ""}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline & Package Information - Combined for better layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {t('timeline')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="plannedPickupDate">{t('plannedPickupDate')}</Label>
                    <Input
                      id="plannedPickupDate"
                      type="datetime-local"
                      value={formData.plannedPickupDate}
                      onChange={(e) => handleInputChange('plannedPickupDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="plannedDeliveryDate">{t('plannedDeliveryDate')}</Label>
                    <Input
                      id="plannedDeliveryDate"
                      type="datetime-local"
                      value={formData.plannedDeliveryDate}
                      onChange={(e) => handleInputChange('plannedDeliveryDate', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Package Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {t('packageInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="packages">{t('packages')}</Label>
                    <Input
                      id="packages"
                      type="number"
                      value={formData.packages}
                      onChange={(e) => handleInputChange('packages', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="totalWeight">{t('totalWeight')} (kg)</Label>
                      <Input
                        id="totalWeight"
                        type="number"
                        step="0.1"
                        value={formData.totalWeight}
                        onChange={(e) => handleInputChange('totalWeight', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalVolume">{t('totalVolume')} (m³)</Label>
                      <Input
                        id="totalVolume"
                        type="number"
                        step="0.01"
                        value={formData.totalVolume}
                        onChange={(e) => handleInputChange('totalVolume', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('notes')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder={t('enterNotes')}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Line Items - Takes 1 column on XL screens */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t('shipmentLines')}</CardTitle>
                {poData && (
                  <p className="text-sm text-muted-foreground">
                    {t('fromPO')}: <span className="font-medium">{poData.orderNo}</span>
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                {lineItems.length > 0 ? (
                  <div className="space-y-3">
                    {lineItems.map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg space-y-3 bg-muted/30 dark:bg-muted/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">{item.sku}</Badge>
                              <span className="text-xs text-muted-foreground">
                                #{item.poLineNo}
                              </span>
                            </div>
                            <div className="font-medium text-sm leading-tight">{item.itemName}</div>
                            {item.specifications && (
                              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.specifications}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('orderedQty')}:</span>
                            <span className="font-medium">{item.orderedQty}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('remainingQty')}:</span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">{item.remainingQty}</span>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor={`shipped-${item.id}`} className="text-xs font-medium">
                            {t('shippedQty')} <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`shipped-${item.id}`}
                            type="number"
                            value={item.shippedQty}
                            onChange={(e) => handleLineItemChange(item.id, 'shippedQty', parseInt(e.target.value) || 0)}
                            max={item.remainingQty}
                            className="mt-1 h-8"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    ))}
                    
                    {/* Summary */}
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                        {t('summary')}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-blue-700 dark:text-blue-300">{t('totalItems')}:</span>
                          <span className="font-medium">{lineItems.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700 dark:text-blue-300">{t('totalQty')}:</span>
                          <span className="font-medium">{lineItems.reduce((sum, item) => sum + item.shippedQty, 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">{t('noLineItems')}</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      <Plus className="h-4 w-4 mr-2" />
                      {t('addLineItem')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}