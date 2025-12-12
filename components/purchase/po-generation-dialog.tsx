"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Package, Truck, CreditCard, FileText, MapPin, Calendar } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

interface LineItem {
  id: string
  lineNo: number
  skuCode: string
  skuName: string
  specifications: string
  quantity: number
  unit: string
  estimatedUnitPrice: number
  supplier?: string
  supplierCode?: string
  targetWarehouse?: string
  expectedDeliveryDate?: string
  businessPurpose?: string
  projectNo?: string
  notes?: string
}

interface POGenerationData {
  selectedItems: string[]
  supplierInfo: {
    name: string
    code: string
    contact: string
    phone: string
    email: string
  }
  shippingAddress: {
    country: string
    state: string
    city: string
    address1: string
    address2: string
    zipCode: string
    contact: string
    phone: string
  }
  paymentMethod: string
  shippingMethod: string
  tradeTerms: string
  buyerNotes: string
  latestShipDate: string
}

interface POGenerationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lineItems: LineItem[]
  prNo: string
  onConfirm: (data: POGenerationData) => void
}

export function POGenerationDialog({
  open,
  onOpenChange,
  lineItems,
  prNo,
  onConfirm,
}: POGenerationDialogProps) {
  const { t } = useI18n()
  const [selectedItems, setSelectedItems] = React.useState<string[]>([])
  const [supplierInfo, setSupplierInfo] = React.useState({
    name: "",
    code: "",
    contact: "",
    phone: "",
    email: "",
  })
  const [shippingAddress, setShippingAddress] = React.useState({
    country: "United States",
    state: "",
    city: "",
    address1: "",
    address2: "",
    zipCode: "",
    contact: "",
    phone: "",
  })
  const [paymentMethod, setPaymentMethod] = React.useState("")
  const [shippingMethod, setShippingMethod] = React.useState("")
  const [tradeTerms, setTradeTerms] = React.useState("")
  const [buyerNotes, setBuyerNotes] = React.useState("")
  const [latestShipDate, setLatestShipDate] = React.useState("")

  // 按供应商分组商品行
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, LineItem[]> = {}
    lineItems.forEach(item => {
      const supplier = item.supplier || t('unspecifiedSupplier')
      if (!groups[supplier]) {
        groups[supplier] = []
      }
      groups[supplier].push(item)
    })
    return groups
  }, [lineItems, t])

  // 检查是否所有必填信息都已填写
  const isFormValid = () => {
    return (
      selectedItems.length > 0 &&
      supplierInfo.name &&
      supplierInfo.contact &&
      shippingAddress.state &&
      shippingAddress.city &&
      shippingAddress.address1 &&
      shippingAddress.contact &&
      paymentMethod &&
      shippingMethod &&
      tradeTerms &&
      latestShipDate
    )
  }

  const handleConfirm = () => {
    if (!isFormValid()) return

    onConfirm({
      selectedItems,
      supplierInfo,
      shippingAddress,
      paymentMethod,
      shippingMethod,
      tradeTerms,
      buyerNotes,
      latestShipDate,
    })
    onOpenChange(false)
  }

  const handleSelectAll = (supplier: string) => {
    const supplierItems = groupedItems[supplier]
    const supplierItemIds = supplierItems.map(item => item.id)
    const allSelected = supplierItemIds.every(id => selectedItems.includes(id))
    
    if (allSelected) {
      setSelectedItems(prev => prev.filter(id => !supplierItemIds.includes(id)))
    } else {
      setSelectedItems(prev => [...new Set([...prev, ...supplierItemIds])])
    }
  }

  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('generatePurchaseOrder')}
          </DialogTitle>
          <DialogDescription>
            {t('prNumberLabel')}: {prNo} - {t('selectItemsAndFillInfo')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 商品行选择 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('selectLineItems')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(groupedItems).map(([supplier, items]) => (
                <div key={supplier} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{supplier}</Badge>
                      <span className="text-sm text-muted-foreground">
                        ({items.length} {t('itemsCount')})
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectAll(supplier)}
                    >
                      {items.every(item => selectedItems.includes(item.id)) ? t('deselectAll') : t('selectAll')}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center space-x-3 p-2 border rounded">
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => handleItemSelect(item.id)}
                        />
                        <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="font-medium">{item.skuCode}</div>
                            <div className="text-muted-foreground">{item.skuName}</div>
                          </div>
                          <div>{item.specifications}</div>
                          <div>{item.quantity} {item.unit}</div>
                          <div>${item.estimatedUnitPrice.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 供应商信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {t('supplierInfo')} *
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierName">{t('supplierNameRequired')}</Label>
                <Input
                  id="supplierName"
                  value={supplierInfo.name}
                  onChange={(e) => setSupplierInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('enterSupplierName')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierCode">{t('supplierCode')}</Label>
                <Input
                  id="supplierCode"
                  value={supplierInfo.code}
                  onChange={(e) => setSupplierInfo(prev => ({ ...prev, code: e.target.value }))}
                  placeholder={t('enterSupplierCode')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierContact">{t('contactPersonRequired')}</Label>
                <Input
                  id="supplierContact"
                  value={supplierInfo.contact}
                  onChange={(e) => setSupplierInfo(prev => ({ ...prev, contact: e.target.value }))}
                  placeholder={t('enterContactName')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierPhone">{t('contactPhone')}</Label>
                <Input
                  id="supplierPhone"
                  value={supplierInfo.phone}
                  onChange={(e) => setSupplierInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder={t('enterContactPhone')}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="supplierEmail">{t('email')}</Label>
                <Input
                  id="supplierEmail"
                  type="email"
                  value={supplierInfo.email}
                  onChange={(e) => setSupplierInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={t('enterEmailAddress')}
                />
              </div>
            </CardContent>
          </Card>

          {/* 发货地址 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('shippingAddress')} *
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">{t('country')}</Label>
                <Select value={shippingAddress.country} onValueChange={(value) => setShippingAddress(prev => ({ ...prev, country: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="China">China</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">{t('stateProvinceRequired')}</Label>
                <Input
                  id="state"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                  placeholder={t('enterStateProvince')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t('cityRequired')}</Label>
                <Input
                  id="city"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                  placeholder={t('enterCity')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">{t('zipCode')}</Label>
                <Input
                  id="zipCode"
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                  placeholder={t('enterZipCode')}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address1">{t('address1Required')}</Label>
                <Input
                  id="address1"
                  value={shippingAddress.address1}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, address1: e.target.value }))}
                  placeholder={t('enterDetailedAddress')}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address2">{t('address2Optional')}</Label>
                <Input
                  id="address2"
                  value={shippingAddress.address2}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, address2: e.target.value }))}
                  placeholder={t('enterSupplementaryAddress')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingContact">{t('shippingContactRequired')}</Label>
                <Input
                  id="shippingContact"
                  value={shippingAddress.contact}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, contact: e.target.value }))}
                  placeholder={t('enterShippingContact')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingPhone">{t('contactPhone')}</Label>
                <Input
                  id="shippingPhone"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder={t('enterContactPhone')}
                />
              </div>
            </CardContent>
          </Card>

          {/* 交易条款 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('tradeTerms')} *</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">{t('paymentMethodRequired')}</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectPaymentMethod')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T/T">{t('telegraphicTransfer')}</SelectItem>
                    <SelectItem value="L/C">{t('letterOfCredit')}</SelectItem>
                    <SelectItem value="D/P">{t('documentsAgainstPayment')}</SelectItem>
                    <SelectItem value="D/A">{t('documentsAgainstAcceptance')}</SelectItem>
                    <SelectItem value="Cash">{t('cash')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingMethod">{t('shippingMethodRequired')}</Label>
                <Select value={shippingMethod} onValueChange={setShippingMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectShippingMethod')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sea">{t('seaTransport')}</SelectItem>
                    <SelectItem value="Air">{t('airTransport')}</SelectItem>
                    <SelectItem value="Express">{t('expressDelivery')}</SelectItem>
                    <SelectItem value="Land">{t('landTransport')}</SelectItem>
                    <SelectItem value="Multimodal">{t('multimodalTransport')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tradeTerms">{t('tradeTermsRequired')}</Label>
                <Select value={tradeTerms} onValueChange={setTradeTerms}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectTradeTerms')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FOB">FOB (Free On Board)</SelectItem>
                    <SelectItem value="CIF">CIF (Cost, Insurance & Freight)</SelectItem>
                    <SelectItem value="CFR">CFR (Cost & Freight)</SelectItem>
                    <SelectItem value="EXW">EXW (Ex Works)</SelectItem>
                    <SelectItem value="DDP">DDP (Delivered Duty Paid)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="latestShipDate">{t('latestShipDateRequired')}</Label>
                <Input
                  id="latestShipDate"
                  type="date"
                  value={latestShipDate}
                  onChange={(e) => setLatestShipDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 买方备注 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('buyerNotes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={buyerNotes}
                onChange={(e) => setBuyerNotes(e.target.value)}
                placeholder={t('enterSpecialRequirements')}
                className="min-h-[80px]"
              />
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={!isFormValid()}>
            {t('generatePOWithItems')} ({selectedItems.length} {t('itemsCount')})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}