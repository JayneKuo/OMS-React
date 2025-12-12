"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, ShoppingCart, Truck, Package, CheckCircle, Plus, Trash2, Save, Send, ArrowLeft, ShoppingBag, Settings, Building, AlertTriangle } from "lucide-react"
import { ProductSelectionDialog } from "@/components/purchase/product-selection-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useI18n } from "@/components/i18n-provider"
import { useRouter } from "next/navigation"

const sidebarItems = [
  { title: "PR (Purchase Request)", href: "/purchase/pr", icon: <FileText className="h-4 w-4" /> },
  { title: "PO (Purchase Order)", href: "/purchase/po", icon: <ShoppingCart className="h-4 w-4" /> },
  { title: "ASN (Advance Ship Notice)", href: "/purchase/asn", icon: <Truck className="h-4 w-4" /> },
  { title: "Receipts", href: "/purchase/receipts", icon: <Package className="h-4 w-4" /> },
  { title: "Receipt Confirm", href: "/purchase/receipt-confirm", icon: <CheckCircle className="h-4 w-4" /> },
]

// PO Line Item Interface
interface POLineItem {
  id: string
  lineNo: number
  productId: string
  skuCode: string
  productName: string
  specifications: string
  quantity: number
  uom: string
  currency: string
  unitPrice: number
  lineAmount: number
  expectedDeliveryDate: string
  notes: string
  isFromPR: boolean // 标识是否来自PR转单
}

// Mock PO Data for editing
const mockPOData = {
  id: "1",
  orderNo: "PO202403150001",
  originalPoNo: "EXT-PO-2024-001",
  referenceNo: "REF202403150001",
  status: "DRAFT",
  dataSource: "MANUAL", // MANUAL | PR_CONVERSION | API_IMPORT
  currency: "USD",
  purchaseType: "REGULAR",
  
  supplierInfo: {
    supplierName: "ABC Suppliers Inc.",
    contactPerson: "John Smith",
    contactPhone: "+1-555-0123",
    contactEmail: "john.smith@abcsuppliers.com",
  },
  
  deliveryInfo: {
    targetWarehouse: "WH001",
    warehouseAddress: "1234 Warehouse St, Los Angeles, CA 90001",
    expectedDeliveryDate: "2024-01-25",
    shippingMethod: "AIR",
    freightTerms: "PREPAID",
    incoterm: "FOB",
  },
  
  lineItems: [
    {
      id: "1",
      lineNo: 1,
      productId: "PROD001",
      skuCode: "SKU001",
      productName: "iPhone 15 Pro",
      specifications: "256GB, Natural Titanium",
      quantity: 100,
      uom: "PCS",
      currency: "USD",
      unitPrice: 50.00,
      lineAmount: 5000.00,
      expectedDeliveryDate: "2024-01-25",
      notes: "",
      isFromPR: true,
    },
    {
      id: "2",
      lineNo: 2,
      productId: "PROD002",
      skuCode: "SKU002",
      productName: "MacBook Pro",
      specifications: "14-inch, M3 Pro, 512GB SSD",
      quantity: 50,
      uom: "PCS",
      currency: "USD",
      unitPrice: 150.00,
      lineAmount: 7500.00,
      expectedDeliveryDate: "2024-01-25",
      notes: "",
      isFromPR: false,
    },
  ],
  
  notes: "Handle with care - fragile items",
}

interface POEditPageProps {
  params: {
    id: string
  }
}

export default function POEditPage({ params }: POEditPageProps) {
  const { t } = useI18n()
  const router = useRouter()
  
  // Form State
  const [poData, setPoData] = React.useState(mockPOData)
  const [showProductDialog, setShowProductDialog] = React.useState(false)
  const [nextLineNo, setNextLineNo] = React.useState(Math.max(...mockPOData.lineItems.map(item => item.lineNo)) + 1)

  // Determine edit permissions based on data source and status
  const getEditPermissions = () => {
    const isManualPO = poData.dataSource === "MANUAL"
    const isPRConversion = poData.dataSource === "PR_CONVERSION"
    const isEditable = ["DRAFT", "CREATED"].includes(poData.status)
    
    return {
      canEditSupplier: isManualPO && isEditable,
      canEditWarehouse: isManualPO && isEditable,
      canEditCurrency: isManualPO && isEditable,
      canAddProducts: isManualPO && isEditable,
      canDeleteProducts: isManualPO && isEditable,
      canEditQuantity: isEditable,
      canEditPrice: isManualPO && isEditable, // PR转单的PO可能不允许改价格，看企业规则
      canEditDeliveryDate: isEditable,
      canEditNotes: isEditable,
    }
  }

  const permissions = getEditPermissions()

  // Update basic info
  const updateBasicInfo = (field: string, value: any) => {
    setPoData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Update supplier info
  const updateSupplierInfo = (field: string, value: any) => {
    setPoData(prev => ({
      ...prev,
      supplierInfo: {
        ...prev.supplierInfo,
        [field]: value
      }
    }))
  }

  // Update delivery info
  const updateDeliveryInfo = (field: string, value: any) => {
    setPoData(prev => ({
      ...prev,
      deliveryInfo: {
        ...prev.deliveryInfo,
        [field]: value
      }
    }))
  }

  // Add products from selection dialog
  const handleProductsSelected = (products: any[]) => {
    const newItems: POLineItem[] = products.map(product => ({
      id: `line-${Date.now()}-${product.id}`,
      lineNo: nextLineNo + poData.lineItems.length + products.indexOf(product),
      productId: product.id,
      skuCode: product.sku,
      productName: product.productName,
      specifications: product.specifications,
      quantity: 1,
      uom: product.uom,
      currency: poData.currency,
      unitPrice: product.unitPrice,
      lineAmount: product.unitPrice,
      expectedDeliveryDate: poData.deliveryInfo.expectedDeliveryDate || '',
      notes: "",
      isFromPR: false,
    }))
    
    setPoData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, ...newItems]
    }))
    setNextLineNo(nextLineNo + newItems.length)
  }

  // Remove line item (only for manual PO)
  const removeLineItem = (id: string) => {
    if (!permissions.canDeleteProducts) return
    
    setPoData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id)
    }))
  }

  // Update line item
  const updateLineItem = (id: string, field: keyof POLineItem, value: any) => {
    setPoData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          
          // Recalculate line amount when quantity or unit price changes
          if (field === 'quantity' || field === 'unitPrice') {
            const quantity = field === 'quantity' ? value : updatedItem.quantity
            const unitPrice = field === 'unitPrice' ? value : updatedItem.unitPrice
            updatedItem.lineAmount = quantity * unitPrice
          }
          
          return updatedItem
        }
        return item
      })
    }))
  }

  // Calculate totals
  const totalItems = poData.lineItems.length
  const totalQuantity = poData.lineItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = poData.lineItems.reduce((sum, item) => sum + item.lineAmount, 0)

  // Form validation
  const isFormValid = () => {
    return poData.supplierInfo.supplierName && 
           poData.deliveryInfo.targetWarehouse && 
           poData.deliveryInfo.expectedDeliveryDate &&
           poData.lineItems.length > 0 &&
           poData.lineItems.every(item => item.skuCode && item.quantity > 0 && item.unitPrice > 0)
  }

  // Handle save
  const handleSave = () => {
    if (!isFormValid()) {
      alert("请填写所有必填字段")
      return
    }
    console.log("Save PO:", poData)
    // TODO: API call to save
    router.push(`/purchase/po/${params.id}`)
  }

  // Handle save and send
  const handleSaveAndSend = () => {
    if (!isFormValid()) {
      alert("请填写所有必填字段")
      return
    }
    console.log("Save and send PO:", poData)
    // TODO: API call to save and send
    router.push(`/purchase/po/${params.id}`)
  }

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('editPurchaseOrder')}</h1>
              <p className="text-muted-foreground">{poData.orderNo}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSave} disabled={!isFormValid()}>
              <Save className="mr-2 h-4 w-4" />
              {t('save')}
            </Button>
            <Button size="sm" onClick={handleSaveAndSend} disabled={!isFormValid()}>
              <Send className="mr-2 h-4 w-4" />
              {t('saveAndSend')}
            </Button>
          </div>
        </div>

        {/* Edit Permissions Notice */}
        {!permissions.canEditSupplier && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <div className="font-medium">{t('limitedEditPermissions')}</div>
                  <div className="text-sm text-orange-700">
                    {poData.dataSource === "PR_CONVERSION" 
                      ? t('prConversionEditLimitations')
                      : t('statusEditLimitations')
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="poNumber">{t('poNo')}</Label>
                <Input
                  id="poNumber"
                  value={poData.orderNo}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalPoNo">{t('originalPoNo')}</Label>
                <Input
                  id="originalPoNo"
                  value={poData.originalPoNo}
                  onChange={(e) => updateBasicInfo('originalPoNo', e.target.value)}
                  placeholder={t('enterOriginalPoNo')}
                  disabled={!permissions.canEditSupplier}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceNo">{t('referenceNo')}</Label>
                <Input
                  id="referenceNo"
                  value={poData.referenceNo}
                  onChange={(e) => updateBasicInfo('referenceNo', e.target.value)}
                  placeholder={t('enterReferenceNo')}
                  disabled={!permissions.canEditSupplier}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">{t('currency')} *</Label>
                <Select 
                  value={poData.currency} 
                  onValueChange={(value) => updateBasicInfo('currency', value)}
                  disabled={!permissions.canEditCurrency}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="CNY">CNY</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseType">{t('purchaseType')}</Label>
                <Select 
                  value={poData.purchaseType} 
                  onValueChange={(value) => updateBasicInfo('purchaseType', value)}
                  disabled={!permissions.canEditSupplier}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectPurchaseType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGULAR">{t('regularPurchase')}</SelectItem>
                    <SelectItem value="REPLENISHMENT">{t('stockReplenishment')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supplier & Delivery Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {t('supplierAndDeliveryInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Supplier Information */}
            <div className="space-y-4">
              <Label className="text-base font-medium">{t('supplierInfo')}</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplierName">{t('supplierName')} *</Label>
                  <Input
                    id="supplierName"
                    value={poData.supplierInfo.supplierName}
                    onChange={(e) => updateSupplierInfo('supplierName', e.target.value)}
                    placeholder={t('enterSupplierName')}
                    disabled={!permissions.canEditSupplier}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">{t('contactPerson')}</Label>
                  <Input
                    id="contactPerson"
                    value={poData.supplierInfo.contactPerson}
                    onChange={(e) => updateSupplierInfo('contactPerson', e.target.value)}
                    placeholder={t('enterContactPerson')}
                    disabled={!permissions.canEditSupplier}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">{t('contactPhone')}</Label>
                  <Input
                    id="contactPhone"
                    value={poData.supplierInfo.contactPhone}
                    onChange={(e) => updateSupplierInfo('contactPhone', e.target.value)}
                    placeholder={t('enterContactPhone')}
                    disabled={!permissions.canEditSupplier}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">{t('contactEmail')}</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={poData.supplierInfo.contactEmail}
                    onChange={(e) => updateSupplierInfo('contactEmail', e.target.value)}
                    placeholder={t('enterContactEmail')}
                    disabled={!permissions.canEditSupplier}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Delivery Information */}
            <div className="space-y-4">
              <Label className="text-base font-medium">{t('deliveryInfo')}</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetWarehouse">{t('targetWarehouse')} *</Label>
                  <Select 
                    value={poData.deliveryInfo.targetWarehouse} 
                    onValueChange={(value) => updateDeliveryInfo('targetWarehouse', value)}
                    disabled={!permissions.canEditWarehouse}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectTargetWarehouse')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WH001">Main Warehouse - Los Angeles</SelectItem>
                      <SelectItem value="WH002">East Distribution Center - New York</SelectItem>
                      <SelectItem value="WH003">West Fulfillment Center - Seattle</SelectItem>
                      <SelectItem value="WH004">Central Warehouse - Chicago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expectedDeliveryDate">{t('expectedDeliveryDate')} *</Label>
                  <Input
                    id="expectedDeliveryDate"
                    type="date"
                    value={poData.deliveryInfo.expectedDeliveryDate}
                    onChange={(e) => updateDeliveryInfo('expectedDeliveryDate', e.target.value)}
                    disabled={!permissions.canEditDeliveryDate}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shippingMethod">{t('shippingMethod')}</Label>
                  <Select 
                    value={poData.deliveryInfo.shippingMethod} 
                    onValueChange={(value) => updateDeliveryInfo('shippingMethod', value)}
                    disabled={!permissions.canEditSupplier}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectShippingMethod')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AIR">{t('airTransport')}</SelectItem>
                      <SelectItem value="OCEAN">{t('seaTransport')}</SelectItem>
                      <SelectItem value="TRUCK">{t('landTransport')}</SelectItem>
                      <SelectItem value="EXPRESS">{t('expressDelivery')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Lines */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('productLines')}</CardTitle>
              {permissions.canAddProducts && (
                <Button onClick={() => setShowProductDialog(true)}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {t('addProduct')}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {poData.lineItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>{t('noProductLines')}</p>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">{t('lineNo')}</TableHead>
                      <TableHead className="min-w-[200px]">{t('productInfo')}</TableHead>
                      <TableHead className="w-[100px]">{t('quantity')}</TableHead>
                      <TableHead className="w-[80px]">{t('unit')}</TableHead>
                      <TableHead className="w-[120px]">{t('unitPrice')}</TableHead>
                      <TableHead className="w-[120px]">{t('lineAmount')}</TableHead>
                      <TableHead className="w-[150px]">{t('expectedDeliveryDate')}</TableHead>
                      <TableHead className="min-w-[120px]">{t('notes')}</TableHead>
                      <TableHead className="w-[60px]">{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {poData.lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {item.lineNo}
                            </Badge>
                            {item.isFromPR && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                PR
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{item.productName}</div>
                            <div className="text-xs text-muted-foreground">SKU: {item.skuCode}</div>
                            <div className="text-xs text-muted-foreground">{item.specifications}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                            className="w-full text-sm h-8"
                            disabled={!permissions.canEditQuantity}
                          />
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={item.uom} 
                            onValueChange={(value) => updateLineItem(item.id, "uom", value)}
                            disabled={item.isFromPR}
                          >
                            <SelectTrigger className="w-full h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PCS">PCS</SelectItem>
                              <SelectItem value="SET">SET</SelectItem>
                              <SelectItem value="BOX">BOX</SelectItem>
                              <SelectItem value="PACK">PACK</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                            className="w-full text-sm h-8"
                            placeholder="0.00"
                            disabled={!permissions.canEditPrice}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-right py-1 px-2 bg-blue-50 rounded">
                            {poData.currency} {item.lineAmount.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={item.expectedDeliveryDate}
                            onChange={(e) => updateLineItem(item.id, "expectedDeliveryDate", e.target.value)}
                            className="w-full text-sm h-8"
                            disabled={!permissions.canEditDeliveryDate}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.notes}
                            onChange={(e) => updateLineItem(item.id, "notes", e.target.value)}
                            className="w-full text-sm h-8"
                            placeholder={t('enterNotes')}
                            disabled={!permissions.canEditNotes}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(item.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            disabled={!permissions.canDeleteProducts || item.isFromPR}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  
                  {/* Summary Row */}
                  <tfoot className="bg-muted/50 border-t-2">
                    <tr>
                      <td className="px-4 py-3 font-medium text-sm">{t('summary')}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium">{totalItems} {t('products')}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="font-bold text-blue-600">{totalQuantity.toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-bold text-green-600">
                          {poData.currency} {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>{t('notes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={poData.notes}
              onChange={(e) => setPoData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder={t('enterAdditionalNotes')}
              rows={4}
              disabled={!permissions.canEditNotes}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            {t('cancel')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} disabled={!isFormValid()}>
            <Save className="mr-2 h-4 w-4" />
            {t('save')}
          </Button>
          <Button size="sm" onClick={handleSaveAndSend} disabled={!isFormValid()}>
            <Send className="mr-2 h-4 w-4" />
            {t('saveAndSend')}
          </Button>
        </div>

        {/* Product Selection Dialog */}
        {permissions.canAddProducts && (
          <ProductSelectionDialog
            open={showProductDialog}
            onOpenChange={setShowProductDialog}
            onProductsSelected={handleProductsSelected}
          />
        )}
      </div>
    </MainLayout>
  )
}