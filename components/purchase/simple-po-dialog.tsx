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
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Package, MapPin } from "lucide-react"
import { TranslationKey } from "@/lib/i18n"
import { useI18n } from "@/components/i18n-provider"

// 默认翻译文本
const defaultTexts: Record<string, string> = {
  poGenerationDialog: '生成采购订单 (PO)',
  prNo: 'PR编号',
  selectItems: '选择商品行',
  supplierInfo: '供应商信息',
  supplierName: '供应商名称',
  supplierCode: '供应商代码',
  contact: '联系人',
  phone: '联系电话',
  email: '邮箱',
  shippingAddress: '发货地址',
  tradeTerms: '交易条款',
  buyerNotes: '买方备注',
  cancel: '取消',
  generatePO: '生成PO',
}

// 安全的useI18n hook，当没有Provider时使用默认值
function useSafeI18n() {
  try {
    return useI18n()
  } catch {
    // 如果没有Provider，返回默认的中文文本
    return {
      t: (key: TranslationKey) => {
        return defaultTexts[key] || key
      }
    }
  }
}

interface LineItem {
  id: string
  lineNo: number
  skuCode: string
  skuName?: string
  productName?: string
  specifications: string
  quantity: number
  unit?: string
  uom?: string
  estimatedUnitPrice?: number
  unitPrice?: number
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
  supplierInfos: Record<string, {
    name: string
    code: string
    contact: string
    phone: string
    email: string
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
  }>
}

interface SimplePODialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lineItems: LineItem[]
  prNo: string
  onConfirm: (data: POGenerationData) => void
  isContinueGeneration?: boolean // 是否是继续生成PO
}

export function SimplePODialog({
  open,
  onOpenChange,
  lineItems,
  prNo,
  onConfirm,
  isContinueGeneration = false,
}: SimplePODialogProps) {
  const { t } = useSafeI18n()
  const [selectedItems, setSelectedItems] = React.useState<string[]>([])
  // 按供应商管理供应商信息，包括各自的发货地址和交易条款
  const [supplierInfos, setSupplierInfos] = React.useState<Record<string, {
    name: string
    code: string
    contact: string
    phone: string
    email: string
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
  }>>({})

  // 按供应商分组商品行
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, LineItem[]> = {}
    lineItems.forEach(item => {
      const supplier = item.supplier || "未指定供应商"
      if (!groups[supplier]) {
        groups[supplier] = []
      }
      groups[supplier].push(item)
    })
    return groups
  }, [lineItems])

  // 获取选中商品涉及的供应商
  const selectedSuppliers = React.useMemo(() => {
    const suppliers = new Set<string>()
    selectedItems.forEach(itemId => {
      const item = lineItems.find(item => item.id === itemId)
      if (item) {
        suppliers.add(item.supplier || "未指定供应商")
      }
    })
    return Array.from(suppliers)
  }, [selectedItems, lineItems])

  // 检查是否所有必填信息都已填写
  const isFormValid = () => {
    if (selectedItems.length === 0) return false
    
    // 检查每个选中供应商的信息是否完整
    return selectedSuppliers.every(supplier => {
      const info = supplierInfos[supplier]
      return info && info.name && info.contact && 
             info.shippingAddress.state && info.shippingAddress.city && 
             info.shippingAddress.address1 && info.shippingAddress.contact &&
             info.paymentMethod && info.shippingMethod && info.tradeTerms && info.latestShipDate
    })
  }

  const handleConfirm = () => {
    if (!isFormValid()) {
      alert(t('fillAllRequiredFields') || "请填写所有必填字段，包括每个供应商的详细信息")
      return
    }

    onConfirm({
      selectedItems,
      supplierInfos,
    })
    onOpenChange(false)
  }

  // 更新特定供应商的基本信息
  const updateSupplierInfo = (supplier: string, field: string, value: string) => {
    setSupplierInfos(prev => ({
      ...prev,
      [supplier]: {
        ...prev[supplier],
        [field]: value
      }
    }))
  }

  // 更新特定供应商的发货地址信息
  const updateSupplierShippingAddress = (supplier: string, field: string, value: string) => {
    setSupplierInfos(prev => ({
      ...prev,
      [supplier]: {
        ...prev[supplier],
        shippingAddress: {
          ...prev[supplier]?.shippingAddress,
          [field]: value
        }
      }
    }))
  }

  // 获取特定供应商的信息
  const getSupplierInfo = (supplier: string) => {
    return supplierInfos[supplier] || {
      name: supplier === "未指定供应商" ? "" : supplier,
      code: "",
      contact: "",
      phone: "",
      email: "",
      shippingAddress: {
        country: "United States",
        state: "",
        city: "",
        address1: "",
        address2: "",
        zipCode: "",
        contact: "",
        phone: "",
      },
      paymentMethod: "",
      shippingMethod: "",
      tradeTerms: "",
      buyerNotes: "",
      latestShipDate: "",
    }
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
            {isContinueGeneration ? t('continueGeneratePODialog') : t('poGenerationDialog')}
          </DialogTitle>
          <DialogDescription>
            {t('prNo')}: {prNo} - 请选择商品行并补充必要信息
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 商品行选择 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('selectItems')}</CardTitle>
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
                            <div className="text-muted-foreground">{item.skuName || item.productName}</div>
                          </div>
                          <div>{item.specifications}</div>
                          <div>{item.quantity} {item.unit || item.uom}</div>
                          <div>${(item.estimatedUnitPrice || item.unitPrice || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 供应商信息 - 根据选中的供应商动态显示 */}
          {selectedSuppliers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {t('supplierInfo')} * ({selectedSuppliers.length} 个供应商)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedSuppliers.map((supplier) => {
                  const info = getSupplierInfo(supplier)
                  return (
                    <div key={supplier} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline">{supplier}</Badge>
                        <span className="text-sm text-muted-foreground">
                          ({lineItems.filter(item => (item.supplier || "未指定供应商") === supplier && selectedItems.includes(item.id)).length} {t('itemsCount')})
                        </span>
                      </div>
                      
                      {/* 供应商基本信息 */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm">{t('supplierInfo')}</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t('supplierName')} *</Label>
                            <Input
                              value={info.name}
                              onChange={(e) => updateSupplierInfo(supplier, "name", e.target.value)}
                              placeholder={t('enterSupplierName')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('supplierCode')}</Label>
                            <Input
                              value={info.code}
                              onChange={(e) => updateSupplierInfo(supplier, "code", e.target.value)}
                              placeholder={t('enterSupplierCode')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('contact')} *</Label>
                            <Input
                              value={info.contact}
                              onChange={(e) => updateSupplierInfo(supplier, "contact", e.target.value)}
                              placeholder={t('enterContactName')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('phone')}</Label>
                            <Input
                              value={info.phone}
                              onChange={(e) => updateSupplierInfo(supplier, "phone", e.target.value)}
                              placeholder={t('enterContactPhone')}
                            />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label>{t('email')}</Label>
                            <Input
                              type="email"
                              value={info.email}
                              onChange={(e) => updateSupplierInfo(supplier, "email", e.target.value)}
                              placeholder={t('enterEmailAddress')}
                            />
                          </div>
                        </div>

                        {/* 发货地址信息 */}
                        <div className="space-y-4 border-t pt-4">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {t('shippingAddress')} *
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>{t('country')}</Label>
                              <Select 
                                value={info.shippingAddress.country} 
                                onValueChange={(value) => updateSupplierShippingAddress(supplier, "country", value)}
                              >
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
                              <Label>{t('stateProvinceRequired')}</Label>
                              <Input
                                value={info.shippingAddress.state}
                                onChange={(e) => updateSupplierShippingAddress(supplier, "state", e.target.value)}
                                placeholder={t('enterStateProvince')}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{t('cityRequired')}</Label>
                              <Input
                                value={info.shippingAddress.city}
                                onChange={(e) => updateSupplierShippingAddress(supplier, "city", e.target.value)}
                                placeholder={t('enterCity')}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{t('zipCode')}</Label>
                              <Input
                                value={info.shippingAddress.zipCode}
                                onChange={(e) => updateSupplierShippingAddress(supplier, "zipCode", e.target.value)}
                                placeholder={t('postalCode')}
                              />
                            </div>
                            <div className="space-y-2 col-span-2">
                              <Label>{t('address1Required')}</Label>
                              <Input
                                value={info.shippingAddress.address1}
                                onChange={(e) => updateSupplierShippingAddress(supplier, "address1", e.target.value)}
                                placeholder={t('streetAddress')}
                              />
                            </div>
                            <div className="space-y-2 col-span-2">
                              <Label>{t('address2Optional')}</Label>
                              <Input
                                value={info.shippingAddress.address2}
                                onChange={(e) => updateSupplierShippingAddress(supplier, "address2", e.target.value)}
                                placeholder={t('apartmentFloorInfo')}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{t('shippingContactRequired')}</Label>
                              <Input
                                value={info.shippingAddress.contact}
                                onChange={(e) => updateSupplierShippingAddress(supplier, "contact", e.target.value)}
                                placeholder={t('enterShippingContact')}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{t('contactPhone')}</Label>
                              <Input
                                value={info.shippingAddress.phone}
                                onChange={(e) => updateSupplierShippingAddress(supplier, "phone", e.target.value)}
                                placeholder={t('enterContactPhone')}
                              />
                            </div>
                          </div>
                        </div>

                        {/* 交易条款 */}
                        <div className="space-y-4 border-t pt-4">
                          <h4 className="font-medium text-sm">{t('tradeTerms')} *</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>{t('paymentMethodRequired')}</Label>
                              <Select 
                                value={info.paymentMethod} 
                                onValueChange={(value) => updateSupplierInfo(supplier, "paymentMethod", value)}
                              >
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
                              <Label>{t('shippingMethodRequired')}</Label>
                              <Select 
                                value={info.shippingMethod} 
                                onValueChange={(value) => updateSupplierInfo(supplier, "shippingMethod", value)}
                              >
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
                              <Label>{t('tradeTermsRequired')}</Label>
                              <Select 
                                value={info.tradeTerms} 
                                onValueChange={(value) => updateSupplierInfo(supplier, "tradeTerms", value)}
                              >
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
                              <Label>{t('latestShipDateRequired')}</Label>
                              <Input
                                type="date"
                                value={info.latestShipDate}
                                onChange={(e) => updateSupplierInfo(supplier, "latestShipDate", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* 买方备注 */}
                        <div className="space-y-4 border-t pt-4">
                          <h4 className="font-medium text-sm">{t('buyerNotes')}</h4>
                          <Textarea
                            value={info.buyerNotes}
                            onChange={(e) => updateSupplierInfo(supplier, "buyerNotes", e.target.value)}
                            placeholder={t('enterSpecialRequirements')}
                            className="min-h-[80px]"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}




        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={!isFormValid()}>
            {t('generatePO')} ({selectedItems.length} {t('itemsCount')})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}