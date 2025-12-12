"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Package } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

// 商品数据接口
interface Product {
  id: string
  sku: string
  productName: string
  specifications: string
  uom: string // 单位
  unitPrice: number // 单价
  costPrice: number // 成本价
  category: string
  brand: string
  inStock: boolean
  // 追溯管理标识
  requiresSerialNumber: boolean // 是否需要序列号管理
  requiresLotNumber: boolean // 是否需要批次号管理
  shelfLife?: number // 保质期（天数）
}

// 模拟商品数据
const mockProducts: Product[] = [
  {
    id: "PROD001",
    sku: "SKU001",
    productName: "iPhone 15 Pro",
    specifications: "256GB Space Black",
    uom: "PCS",
    unitPrice: 999.00,
    costPrice: 750.00,
    category: "手机",
    brand: "Apple",
    inStock: true,
    requiresSerialNumber: true, // 手机需要序列号管理
    requiresLotNumber: false,
  },
  {
    id: "PROD002",
    sku: "SKU002",
    productName: "MacBook Pro",
    specifications: "14-inch M3 Pro 512GB",
    uom: "PCS",
    unitPrice: 1999.00,
    costPrice: 1500.00,
    category: "笔记本",
    brand: "Apple",
    inStock: true,
    requiresSerialNumber: true, // 笔记本需要序列号管理
    requiresLotNumber: false,
  },
  {
    id: "PROD003",
    sku: "SKU003",
    productName: "AirPods Pro",
    specifications: "2nd Generation with MagSafe",
    uom: "PCS",
    unitPrice: 249.00,
    costPrice: 180.00,
    category: "耳机",
    brand: "Apple",
    inStock: true,
    requiresSerialNumber: true, // 耳机需要序列号管理
    requiresLotNumber: false,
  },
  {
    id: "PROD004",
    sku: "SKU004",
    productName: "iPad Air",
    specifications: "11-inch Wi-Fi 256GB Blue",
    uom: "PCS",
    unitPrice: 749.00,
    costPrice: 550.00,
    category: "平板",
    brand: "Apple",
    inStock: true,
    requiresSerialNumber: true, // 平板需要序列号管理
    requiresLotNumber: false,
  },
  {
    id: "PROD005",
    sku: "SKU005",
    productName: "Apple Watch Series 9",
    specifications: "GPS 45mm Midnight Aluminum",
    uom: "PCS",
    unitPrice: 429.00,
    costPrice: 320.00,
    category: "智能手表",
    brand: "Apple",
    inStock: true,
    requiresSerialNumber: true, // 智能手表需要序列号管理
    requiresLotNumber: false,
  },
  {
    id: "PROD006",
    sku: "SKU006",
    productName: "Samsung Galaxy S24",
    specifications: "256GB Phantom Black",
    uom: "PCS",
    unitPrice: 899.00,
    costPrice: 680.00,
    category: "手机",
    brand: "Samsung",
    inStock: true,
    requiresSerialNumber: true, // 手机需要序列号管理
    requiresLotNumber: false,
  },
  {
    id: "PROD007",
    sku: "SKU007",
    productName: "Dell XPS 13",
    specifications: "13.4-inch Intel i7 16GB 512GB",
    uom: "PCS",
    unitPrice: 1299.00,
    costPrice: 980.00,
    category: "笔记本",
    brand: "Dell",
    inStock: false,
    requiresSerialNumber: true, // 笔记本需要序列号管理
    requiresLotNumber: false,
  },
  {
    id: "PROD008",
    sku: "SKU008",
    productName: "Sony WH-1000XM5",
    specifications: "Wireless Noise Canceling Headphones",
    uom: "PCS",
    unitPrice: 399.00,
    costPrice: 300.00,
    category: "耳机",
    brand: "Sony",
    inStock: true,
    requiresSerialNumber: false, // 普通耳机不需要序列号
    requiresLotNumber: false,
  },
  {
    id: "PROD009",
    sku: "SKU009",
    productName: "Microsoft Surface Pro 9",
    specifications: "13-inch Intel i5 8GB 256GB",
    uom: "PCS",
    unitPrice: 1099.00,
    costPrice: 830.00,
    category: "平板",
    brand: "Microsoft",
    inStock: true,
    requiresSerialNumber: true, // 平板需要序列号管理
    requiresLotNumber: false,
  },
  {
    id: "PROD010",
    sku: "SKU010",
    productName: "Logitech MX Master 3S",
    specifications: "Wireless Performance Mouse",
    uom: "PCS",
    unitPrice: 99.00,
    costPrice: 75.00,
    category: "配件",
    brand: "Logitech",
    inStock: true,
    requiresSerialNumber: false, // 鼠标不需要序列号
    requiresLotNumber: false,
  },
]

interface ProductSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductsSelected: (products: Product[]) => void
  selectedProductIds?: string[]
}

export function ProductSelectionDialog({
  open,
  onOpenChange,
  onProductsSelected,
  selectedProductIds = []
}: ProductSelectionDialogProps) {
  console.log("ProductSelectionDialog rendered, open:", open)
  const { t } = useI18n()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>(selectedProductIds)

  // 过滤商品
  const filteredProducts = mockProducts.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.specifications.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 处理商品选择
  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id))
    }
  }

  // 确认选择
  const handleConfirm = () => {
    const selected = mockProducts.filter(p => selectedProducts.includes(p.id))
    onProductsSelected(selected)
    onOpenChange(false)
  }

  // 重置选择
  const handleReset = () => {
    setSelectedProducts([])
    setSearchTerm("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('selectProducts')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* 搜索栏 */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchProductsPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleReset}>
              {t('reset')}
            </Button>
          </div>

          {/* 统计信息 */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              {t('totalProducts').replace('{0}', filteredProducts.length.toString()).replace('{1}', selectedProducts.length.toString())}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedProducts.length === filteredProducts.length ? t('deselectAll') : t('selectAll')}
            </Button>
          </div>

          {/* 商品列表 */}
          <div className="flex-1 overflow-auto border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-12">{t('select')}</TableHead>
                  <TableHead>{t('skuCode')}</TableHead>
                  <TableHead>{t('productName')}</TableHead>
                  <TableHead>{t('specifications')}</TableHead>
                  <TableHead>{t('brand')}</TableHead>
                  <TableHead>{t('category')}</TableHead>
                  <TableHead>{t('unit')}</TableHead>
                  <TableHead className="text-right">{t('unitPrice')}</TableHead>
                  <TableHead className="text-right">{t('costPrice')}</TableHead>
                  <TableHead>{t('stockStatus')}</TableHead>
                  <TableHead>{t('traceabilityManagement')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className={selectedProducts.includes(product.id) ? "bg-muted/50" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => handleProductToggle(product.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell className="font-medium">{product.productName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {product.specifications}
                    </TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.uom}</TableCell>
                    <TableCell className="text-right font-mono">
                      ${product.unitPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${product.costPrice.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.inStock ? "default" : "secondary"}>
                        {product.inStock ? t('inStock') : t('outOfStock')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {product.requiresSerialNumber && (
                          <Badge variant="outline" className="text-xs">
                            SN
                          </Badge>
                        )}
                        {product.requiresLotNumber && (
                          <Badge variant="outline" className="text-xs">
                            LOT
                          </Badge>
                        )}
                        {!product.requiresSerialNumber && !product.requiresLotNumber && (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleConfirm} disabled={selectedProducts.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              {t('addSelectedProducts').replace('{0}', selectedProducts.length.toString())}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}