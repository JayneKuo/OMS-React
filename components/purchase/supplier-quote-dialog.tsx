"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Building, FileText } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

// 供应商数据接口
interface Supplier {
  id: string
  name: string
  code: string
  contactPerson: string
  email: string
  phone: string
  rating: number
  status: "ACTIVE" | "INACTIVE"
}

// 询价记录接口
interface QuoteRecord {
  id: string
  supplierId: string
  supplierName: string
  quotedPrice: number
  currency: string
  validUntil: string
  leadTime: number // 交期（天数）
  moq: number // 最小起订量
  notes: string
  attachments: string[]
  status: "PENDING" | "RECEIVED" | "EXPIRED"
  quotedAt?: string
}

// 模拟供应商数据
const mockSuppliers: Supplier[] = [
  {
    id: "SUP001",
    name: "Apple Inc.",
    code: "APPLE",
    contactPerson: "John Smith",
    email: "john@apple.com",
    phone: "+1-408-996-1010",
    rating: 5,
    status: "ACTIVE"
  },
  {
    id: "SUP002",
    name: "Samsung Electronics",
    code: "SAMSUNG",
    contactPerson: "Kim Lee",
    email: "kim@samsung.com",
    phone: "+82-2-2255-0114",
    rating: 4,
    status: "ACTIVE"
  },
  {
    id: "SUP003",
    name: "Dell Technologies",
    code: "DELL",
    contactPerson: "Mike Johnson",
    email: "mike@dell.com",
    phone: "+1-800-289-3355",
    rating: 4,
    status: "ACTIVE"
  },
  {
    id: "SUP004",
    name: "Sony Corporation",
    code: "SONY",
    contactPerson: "Tanaka San",
    email: "tanaka@sony.com",
    phone: "+81-3-6748-2111",
    rating: 4,
    status: "ACTIVE"
  }
]

interface SupplierQuoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
  skuCode: string
  quantity: number
  currentSupplier?: string
  currentQuotePrice?: number
  onSave: (data: {
    preferredSupplier: string
    supplierQuotePrice: number
    quoteValidDate: string
    quoteAttachment: string
  }) => void
}

export function SupplierQuoteDialog({
  open,
  onOpenChange,
  productName,
  skuCode,
  quantity,
  currentSupplier = "",
  currentQuotePrice = 0,
  onSave
}: SupplierQuoteDialogProps) {
  const { t } = useI18n()
  const [selectedSupplier, setSelectedSupplier] = React.useState(currentSupplier)
  const [quoteRecords, setQuoteRecords] = React.useState<QuoteRecord[]>([])
  const [showQuoteForm, setShowQuoteForm] = React.useState(false)
  
  // 新询价表单状态
  const [newQuote, setNewQuote] = React.useState({
    supplierId: "",
    quotedPrice: 0,
    currency: "USD",
    validUntil: "",
    leadTime: 0,
    moq: 1,
    notes: "",
    attachments: [] as string[]
  })

  // 重置状态当对话框打开时
  React.useEffect(() => {
    if (open) {
      setSelectedSupplier(currentSupplier)
      // 这里可以加载现有的询价记录
      loadQuoteRecords()
    }
  }, [open, currentSupplier])

  // 加载询价记录（模拟）
  const loadQuoteRecords = () => {
    // 模拟一些询价记录
    const mockQuotes: QuoteRecord[] = [
      {
        id: "Q001",
        supplierId: "SUP001",
        supplierName: "Apple Inc.",
        quotedPrice: 999.00,
        currency: "USD",
        validUntil: "2024-02-15",
        leadTime: 7,
        moq: 1,
        notes: "官方报价，包含保修",
        attachments: ["apple_quote_2024.pdf"],
        status: "RECEIVED",
        quotedAt: "2024-01-15T10:00:00Z"
      },
      {
        id: "Q002",
        supplierId: "SUP002",
        supplierName: "Samsung Electronics",
        quotedPrice: 899.00,
        currency: "USD",
        validUntil: "2024-02-10",
        leadTime: 10,
        moq: 5,
        notes: "批量优惠价格",
        attachments: ["samsung_quote_2024.pdf"],
        status: "RECEIVED",
        quotedAt: "2024-01-12T14:30:00Z"
      }
    ]
    setQuoteRecords(mockQuotes)
  }

  // 添加新询价
  const addQuoteRecord = () => {
    if (!newQuote.supplierId || !newQuote.quotedPrice) {
      alert(t('pleaseSelectSupplierAndPrice' as any))
      return
    }

    const supplier = mockSuppliers.find(s => s.id === newQuote.supplierId)
    if (!supplier) return

    const quote: QuoteRecord = {
      id: `Q${Date.now()}`,
      supplierId: newQuote.supplierId,
      supplierName: supplier.name,
      quotedPrice: newQuote.quotedPrice,
      currency: newQuote.currency,
      validUntil: newQuote.validUntil,
      leadTime: newQuote.leadTime,
      moq: newQuote.moq,
      notes: newQuote.notes,
      attachments: newQuote.attachments,
      status: "RECEIVED",
      quotedAt: new Date().toISOString()
    }

    setQuoteRecords([...quoteRecords, quote])
    setNewQuote({
      supplierId: "",
      quotedPrice: 0,
      currency: "USD",
      validUntil: "",
      leadTime: 0,
      moq: 1,
      notes: "",
      attachments: []
    })
    setShowQuoteForm(false)
  }

  // 选择询价记录
  const selectQuote = (quote: QuoteRecord) => {
    setSelectedSupplier(quote.supplierName)
    onSave({
      preferredSupplier: quote.supplierName,
      supplierQuotePrice: quote.quotedPrice,
      quoteValidDate: quote.validUntil,
      quoteAttachment: quote.attachments[0] || ""
    })
    onOpenChange(false)
  }

  // 保存供应商选择
  const handleSave = () => {
    onSave({
      preferredSupplier: selectedSupplier,
      supplierQuotePrice: currentQuotePrice,
      quoteValidDate: "",
      quoteAttachment: ""
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {t('supplierQuoteManagementTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-auto">
          {/* 商品信息 */}
          <div className="p-3 bg-muted rounded-md">
            <div className="font-medium">{productName}</div>
            <div className="text-sm text-muted-foreground">SKU: {skuCode}</div>
            <div className="text-sm text-muted-foreground">{t('quantityField')}: {quantity}</div>
          </div>

          {/* 询价记录列表 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('supplierQuote')}
              </Label>
              <Button size="sm" onClick={() => setShowQuoteForm(!showQuoteForm)}>
                <Plus className="h-4 w-4 mr-1" />
                {t('addQuote')}
              </Button>
            </div>

            {/* 新增询价表单 */}
            {showQuoteForm && (
              <div className="p-4 border rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>{t('supplierField')}</Label>
                    <Select value={newQuote.supplierId} onValueChange={(value) => setNewQuote({...newQuote, supplierId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectSupplierPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {mockSuppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name} ({supplier.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('quotePrice')}</Label>
                    <div className="flex gap-2">
                      <Select value={newQuote.currency} onValueChange={(value) => setNewQuote({...newQuote, currency: value})}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="CNY">CNY</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={newQuote.quotedPrice}
                        onChange={(e) => setNewQuote({...newQuote, quotedPrice: parseFloat(e.target.value) || 0})}
                        placeholder={t('enterQuotePrice')}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>{t('quoteValidUntil')}</Label>
                    <Input
                      type="date"
                      value={newQuote.validUntil}
                      onChange={(e) => setNewQuote({...newQuote, validUntil: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>{t('leadTime')} ({t('days')})</Label>
                    <Input
                      type="number"
                      value={newQuote.leadTime}
                      onChange={(e) => setNewQuote({...newQuote, leadTime: parseInt(e.target.value) || 0})}
                      placeholder="7"
                    />
                  </div>
                </div>
                <div>
                  <Label>{t('notesField')}</Label>
                  <Textarea
                    value={newQuote.notes}
                    onChange={(e) => setNewQuote({...newQuote, notes: e.target.value})}
                    placeholder={t('enterNotes')}
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addQuoteRecord}>{t('save')}</Button>
                  <Button variant="outline" onClick={() => setShowQuoteForm(false)}>{t('cancel')}</Button>
                </div>
              </div>
            )}

            {/* 询价记录列表 */}
            <div className="space-y-2 max-h-60 overflow-auto">
              {quoteRecords.map((quote) => (
                <div key={quote.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => selectQuote(quote)}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{quote.supplierName}</span>
                        <Badge variant={quote.status === "RECEIVED" ? "default" : "secondary"}>
                          {quote.status === "RECEIVED" ? t('quotedLabel') : t('pendingQuoteLabel')}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {t('quoteLabel')}: {quote.currency} {quote.quotedPrice.toFixed(2)} | 
                        {t('leadTime')}: {quote.leadTime}{t('days')} | 
                        {t('moq')}: {quote.moq} | 
                        {t('validUntil')}: {quote.validUntil}
                      </div>
                      {quote.notes && (
                        <div className="text-xs text-muted-foreground mt-1">{quote.notes}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {quote.currency} {quote.quotedPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {quote.quotedAt && new Date(quote.quotedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {quoteRecords.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>{t('noQuoteRecords')}</p>
                </div>
              )}
            </div>
          </div>

          {/* 供应商选择 */}
          <div className="space-y-2">
            <Label>{t('directSelectSupplier')}</Label>
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectSupplierPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {mockSuppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.name}>
                    <div className="flex items-center gap-2">
                      <span>{supplier.name}</span>
                      <Badge variant="outline">{supplier.code}</Badge>
                      <div className="flex">
                        {Array.from({length: supplier.rating}).map((_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSave}>
            {t('saveSelection')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}