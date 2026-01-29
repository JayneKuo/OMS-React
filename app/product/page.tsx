"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tabs,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import {
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Plus,
  Boxes,
  Check,
  Copy,
  Download,
  List,
  Tag,
  LayoutTemplate,
  Store,
  ExternalLink,
  Clock,
  Layers,
  Search,
  Filter
} from "lucide-react"
import { toast } from "sonner"
import { BatchEditDialog } from "@/components/product/batch-edit-dialog"
import { BatchPublishDialog } from "@/components/product/batch-publish-dialog"
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { FilterBar, FilterConfig, ActiveFilter } from "@/components/data-table/filter-bar"
import { useI18n } from "@/lib/i18n"
import { SkuMappingDialog } from "@/components/product/sku-mapping-dialog"

// --- Menu Configuration ---
const sidebarItems = [
  { title: "Item Master", href: "/product/item-master", icon: <Boxes className="h-4 w-4" /> },
  { title: "Product List", href: "/product", icon: <List className="h-4 w-4" /> },
  { title: "Brands", href: "/product/brands", icon: <Tag className="h-4 w-4" /> },
  { title: "Categories", href: "/product/categories", icon: <LayoutTemplate className="h-4 w-4" /> },
  {
    title: "Channel Product",
    href: "/product/channel",
    icon: <Store className="h-4 w-4" />,
    children: [
      { title: "Amazon Product List", href: "/product/amazon-product-list" },
      { title: "Shein Product List", href: "/product/shein-product-list" },
      { title: "Shopify Product List", href: "/product/shopify-product-list" },
    ]
  },
]

// --- Types ---
interface SKU {
  id: string
  skuCode: string
  skuId: string
  skuName: string
  skcCode: string
  color: string
  size: string
  price: number
  salePrice: number
  inventory: number
  status: "Active" | "Inactive" | "Out of Stock"
  updated: string
  channelMapping?: { channel: string; channelSku: string }[]
  warehouseMapping?: { warehouse: string; warehouseSku: string }[]
  image?: string
}

interface Product {
  id: string
  spuCode: string
  parentSku: string
  internalItemId: string
  title: string
  image: string
  status: "Published" | "Draft" | "Out of Stock"
  mappingStatus: "Mapped" | "Unmapped"
  category: string
  brand: string
  type: string
  regularPrice: number
  salePrice: number
  inventory: number
  source: string
  channels: string[]
  created: string
  updated: string
  listed: string
  skus: SKU[]
}

// --- Mock Data ---
const mockProducts: Product[] = [
  {
    id: "201205513177568272",
    spuCode: "SPU-88921-X",
    parentSku: "WB-PREM-001",
    internalItemId: "INT-88220",
    title: "Premium Leather Crossbody Bag - Autumn Edition",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&h=240&fit=crop",
    status: "Published",
    mappingStatus: "Mapped",
    category: "Bags & Luggages > Women Bags",
    brand: "LOREAL",
    type: "VARIANTS",
    regularPrice: 129.00,
    salePrice: 99.00,
    inventory: 142,
    source: "MANUAL",
    channels: ["Amazon US", "Shopify Store"],
    created: "2026-01-14 23:30",
    updated: "2026-01-15 09:15",
    listed: "2026-01-15",
    skus: [
      { id: "S001-1", skuCode: "SKU-9921-A1", skuId: "882101", skuName: "Premium Leather Bag - Black", skcCode: "SKC-BLACK-01", color: "Obsidian Black", size: "Standard", price: 129.00, salePrice: 99.00, inventory: 80, status: "Active", updated: "2026-01-15 09:15", channelMapping: [{ channel: "Amazon US", channelSku: "AMZ-BLK-001" }, { channel: "Shopify", channelSku: "SHP-BLK-001" }], warehouseMapping: [{ warehouse: "US-West", warehouseSku: "WH-W-001" }], image: "" },
      { id: "S001-2", skuCode: "SKU-9921-A2", skuId: "882102", skuName: "Premium Leather Bag - Brown", skcCode: "SKC-BROWN-02", color: "Cognac Brown", size: "Standard", price: 135.00, salePrice: 105.00, inventory: 62, status: "Active", updated: "2026-01-14 18:20", channelMapping: [{ channel: "Amazon US", channelSku: "AMZ-BRN-002" }], warehouseMapping: [{ warehouse: "US-West", warehouseSku: "WH-W-002" }], image: "" }
    ]
  },
  {
    id: "201227236357769357",
    spuCode: "SPU-11234-Y",
    parentSku: "DR-SUM-022",
    internalItemId: "INT-88225",
    title: "Summer Breeze Cotton Dress - Floral White",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=240&fit=crop",
    status: "Draft",
    mappingStatus: "Unmapped",
    category: "Clothing > Women > Dresses",
    brand: "-",
    type: "SIMPLE",
    regularPrice: 59.99,
    salePrice: 0,
    inventory: 56,
    source: "MANUAL",
    channels: [],
    created: "2026-01-13 19:01",
    updated: "2026-01-28 16:05",
    listed: "-",
    skus: [
      { id: "S002-1", skuCode: "SKU-2234-B1", skuId: "990101", skuName: "Cotton Dress - White Floral S", skcCode: "SKC-FLORAL-01", color: "White Floral", size: "S", price: 59.99, salePrice: 0, inventory: 20, status: "Active", updated: "2026-01-28 16:05" },
      { id: "S002-2", skuCode: "SKU-2234-B2", skuId: "990102", skuName: "Cotton Dress - White Floral M", skcCode: "SKC-FLORAL-01", color: "White Floral", size: "M", price: 59.99, salePrice: 0, inventory: 36, status: "Active", updated: "2026-01-28 16:05" }
    ]
  }
]

// --- Components ---
const CopyableId = ({ text, label }: { text: string; label: string }) => (
  <div className="flex items-center gap-1.5 group/copy">
    <span className="text-[10px] text-muted-foreground font-medium">{label}:</span>
    <span className="text-[11px] font-mono text-primary group-hover/copy:underline underline-offset-2">{text}</span>
    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(text); toast.success("已复制") }} className="opacity-0 group-hover/copy:opacity-100 hover:text-primary transition-all p-0.5"><Copy className="h-2.5 w-2.5 text-primary" /></button>
  </div>
)

export default function ProductListPage() {
  const { t } = useI18n()
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [isBatchEditOpen, setIsBatchEditOpen] = React.useState(false)
  const [isBatchPublishOpen, setIsBatchPublishOpen] = React.useState(false)
  const [batchType, setBatchType] = React.useState<"price" | "inventory">("price")
  const [searchValue, setSearchValue] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<ActiveFilter[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set())
  const [mappingDialogOpen, setMappingDialogOpen] = React.useState(false)
  const [selectedSkuForMapping, setSelectedSkuForMapping] = React.useState<{ code: string; name: string } | null>(null)

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const filterConfigs: FilterConfig[] = [
    { id: "status", label: "Status", type: "single", options: [{ id: "Published", label: "Published", value: "Published" }, { id: "Draft", label: "Draft", value: "Draft" }] },
    { id: "category", label: "Category", type: "multiple", options: [{ id: "bags", label: "Bags", value: "bags" }, { id: "clothing", label: "Clothing", value: "clothing" }] },
    { id: "parentSku", label: "Parent SKU", type: "batch", placeholder: "Enter Parent SKU..." },
    { id: "sku", label: "SKU", type: "batch", placeholder: "Enter SKU..." },
    { id: "skc", label: "SKC", type: "batch", placeholder: "Enter SKC..." },
    { id: "productId", label: "Product ID", type: "batch", placeholder: "Enter Product ID..." },
    { id: "skuCode", label: "SKU Code", type: "batch", placeholder: "Enter SKU Code..." }
  ]

  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) {
      toast.error("错误", { description: "请先选择商品" })
      return
    }
    if (action === "price" || action === "inventory") {
      setBatchType(action)
      setIsBatchEditOpen(true)
    } else {
      toast.info(`执行: ${action}`)
    }
  }

  const selectedProducts = React.useMemo(() => mockProducts.filter(p => selectedIds.includes(p.id)), [selectedIds])

  return (
    <TooltipProvider>
      <MainLayout sidebarItems={sidebarItems} moduleName="Product">
        <div className="space-y-6">
          {/* Header Area */}
          <div className="px-1 flex justify-between items-end">
            <div>
              <h1 className="text-[28px] font-bold text-foreground leading-tight">Product List</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage core product data, SPU/SKU mappings, and global synchronization status.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-9 font-bold"><Download className="h-4 w-4 mr-2" /> 导出</Button>
              <Button size="sm" className="h-9 font-bold"><Plus className="h-4 w-4 mr-2" /> 新增商品</Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            {/* Status Tabs Bar - 参考UI规范 */}
            <div className="flex items-center gap-2 mb-4">
              <TabsList className="bg-transparent h-auto p-0 gap-2">
                <TabsTrigger value="all" className="h-9 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-transparent text-sm font-medium text-muted-foreground hover:text-foreground transition-all">
                  All <span className="ml-1.5 font-semibold">218</span>
                </TabsTrigger>
                <TabsTrigger value="draft" className="h-9 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-transparent text-sm font-medium text-muted-foreground hover:text-foreground transition-all">
                  Draft <span className="ml-1.5 font-semibold">138</span>
                </TabsTrigger>
                <TabsTrigger value="active" className="h-9 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-transparent text-sm font-medium text-muted-foreground hover:text-foreground transition-all">
                  Active <span className="ml-1.5 font-semibold">57</span>
                </TabsTrigger>
                <TabsTrigger value="inactive" className="h-9 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-transparent text-sm font-medium text-muted-foreground hover:text-foreground transition-all">
                  Inactive <span className="ml-1.5 font-semibold">23</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <Card className="border-none shadow-xl shadow-muted/50 overflow-hidden ring-1 ring-border/50">
              <CardContent className="p-0">
                <div className="p-4 space-y-4">
                  <FilterBar searchPlaceholder="Search Product ID, Parent SKU, SKU, SKC, SKU Code..." onSearchChange={setSearchValue} filters={filterConfigs} onFiltersChange={setActiveFilters} />

                  {/* Batch Actions Bar */}
                  {selectedIds.length > 0 && (
                    <div className="flex items-center justify-between p-2.5 px-6 bg-primary/5 border border-primary/20 rounded-xl animate-in slide-in-from-top-2">
                      <div className="flex items-center gap-4 text-sm font-bold text-primary">
                        <span>已选 <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs mx-1">{selectedIds.length}</span> 项商品</span>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="h-8 text-xs font-bold underline">取消选择</Button>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 font-bold"
                          onClick={() => setIsBatchPublishOpen(true)}
                        >
                          批量上架
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 font-bold">更多 <ChevronDown className="h-3 w-3 ml-1" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleBulkAction("price")}>修改价格</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction("inventory")}>修改库存</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )}

                  <div className="border border-border/50 rounded-xl overflow-hidden shadow-sm bg-card">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-border">
                          <TableHead className="w-[50px] px-4">
                            <div className="flex items-center justify-center">
                              <Checkbox
                                checked={selectedIds.length === mockProducts.length && mockProducts.length > 0}
                                onCheckedChange={() => selectedIds.length === mockProducts.length ? setSelectedIds([]) : setSelectedIds(mockProducts.map(p => p.id))}
                              />
                            </div>
                          </TableHead>
                          <TableHead className="w-[320px] font-medium text-xs text-muted-foreground py-4">{t('productDetailInfo')}</TableHead>
                          <TableHead className="w-[120px] font-medium text-xs text-muted-foreground">{t('status')}</TableHead>
                          <TableHead className="w-[100px] font-medium text-xs text-muted-foreground">Type</TableHead>
                          <TableHead className="w-[180px] font-medium text-xs text-muted-foreground">{t('category')}</TableHead>
                          <TableHead className="w-[120px] font-medium text-xs text-muted-foreground text-right">Price</TableHead>
                          <TableHead className="w-[120px] font-medium text-xs text-muted-foreground">Mapping</TableHead>
                          <TableHead className="w-[120px] font-medium text-xs text-muted-foreground">Source</TableHead>
                          <TableHead className="w-[160px] font-medium text-xs text-muted-foreground">Channels</TableHead>
                          <TableHead className="w-[140px] font-medium text-xs text-muted-foreground">Date</TableHead>
                          <TableHead className="w-[60px] font-medium text-xs text-muted-foreground">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={i}><TableCell colSpan={12} className="h-32 text-center text-muted-foreground italic font-medium">数据加载�?..</TableCell></TableRow>
                          ))
                        ) : mockProducts.map((p) => {
                          const isExpanded = expandedRows.has(p.id)
                          // Calculate price range from SKUs
                          const skuPrices = p.skus.map(sku => sku.price)
                          const minPrice = Math.min(...skuPrices)
                          const maxPrice = Math.max(...skuPrices)
                          const hasPriceRange = minPrice !== maxPrice
                          
                          return (
                            <React.Fragment key={p.id}>
                              <TableRow className={cn("group hover:bg-primary/10 transition-colors border-b-border/50", selectedIds.includes(p.id) && "bg-accent/30")}>
                                <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-center">
                                    <Checkbox checked={selectedIds.includes(p.id)} onCheckedChange={() => setSelectedIds(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])} />
                                  </div>
                                </TableCell>
                                {/* Info Box: Image + Title + IDs (纵向展示) */}
                                <TableCell className="py-4 px-2">
                                  <div className="flex gap-4">
                                    <div className="relative h-16 w-16 shrink-0 rounded-lg border border-border overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                                      <img src={p.image} className="h-full w-full object-cover" />
                                      {p.skus.length > 0 && (
                                        <button onClick={(e) => toggleExpand(p.id, e)} className="absolute bottom-1 right-1 h-5 w-5 bg-card shadow-sm rounded-md flex items-center justify-center border border-border hover:bg-primary hover:text-primary-foreground transition-colors">
                                          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                        </button>
                                      )}
                                    </div>
                                    <div className="flex flex-col gap-1 min-w-0 flex-1 justify-center">
                                      <h4 className="font-medium text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors leading-tight" title={p.title}>{p.title}</h4>
                                      <div className="flex flex-col gap-0.5 mt-1">
                                        <CopyableId text={p.parentSku} label="Seller Parent SKU" />
                                        <CopyableId text={p.id} label="Product ID" />
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                          <span className="text-[10px] text-muted-foreground font-medium">Brand:</span>
                                          <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] font-medium h-4 px-1.5 rounded-sm border-none">{p.brand}</Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={cn("w-fit h-5 px-1.5 text-[10px] font-bold border-none rounded-sm", p.status === "Published" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-muted text-muted-foreground")}>{p.status}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className={cn("text-[10px] font-medium h-5 px-1.5 rounded-sm border-none", p.type === "VARIANTS" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" : "bg-muted text-muted-foreground")}>
                                    {p.type === "VARIANTS" ? "Multi" : "Single"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    <div className="text-xs text-foreground">{p.category}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex flex-col gap-0.5">
                                    {hasPriceRange ? (
                                      <>
                                        <span className="text-sm font-bold text-foreground">${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}</span>
                                      </>
                                    ) : (
                                      <span className="text-sm font-bold text-foreground">${p.regularPrice.toFixed(2)}</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={cn("w-fit h-5 px-1.5 text-[10px] font-medium border rounded", p.mappingStatus === "Mapped" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200" : "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200")}>
                                    {p.mappingStatus}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 w-fit px-1.5 py-0.5 rounded-sm">
                                    <Layers className="h-3 w-3" /> {p.source}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {p.channels.length > 0 ? p.channels.map(c => (
                                      <Badge key={c} className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-[9px] px-1 h-4 font-medium">{c}</Badge>
                                    )) : <span className="text-[9px] text-muted-foreground italic">No Channels</span>}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1 text-[10px] text-muted-foreground">
                                    <div>Created: {p.created}</div>
                                    <div>Updated: {p.updated}</div>
                                  </div>
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-36">
                                      <DropdownMenuItem className="gap-2"><ExternalLink className="h-3.5 w-3.5" /> 详情</DropdownMenuItem>
                                      <DropdownMenuItem className="gap-2"><Copy className="h-3.5 w-3.5" /> 复制</DropdownMenuItem>
                                      <DropdownMenuItem className="text-destructive gap-2"><Tag className="h-3.5 w-3.5" /> 删除</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>

                              {/* SKU Expansion - Aligned with parent columns */}
                              {isExpanded && p.skus.map((sku, idx) => (
                                <TableRow key={sku.id} className="hover:bg-primary/10 border-b border-border/50 group/sku">
                                  <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-center">
                                      <Checkbox 
                                        checked={selectedIds.includes(sku.id)} 
                                        onCheckedChange={() => setSelectedIds(prev => prev.includes(sku.id) ? prev.filter(id => id !== sku.id) : [...prev, sku.id])} 
                                      />
                                    </div>
                                  </TableCell>
                                  {/* SKU Info - aligned with Product Info */}
                                  <TableCell className="py-3 px-2">
                                    <div className="flex gap-4 pl-8">
                                      <div className="relative h-12 w-10 shrink-0 rounded border border-border/50 overflow-hidden shadow-sm bg-muted/30">
                                        <img src={sku.image || p.image} className="h-full w-full object-cover" />
                                      </div>
                                      <div className="flex flex-col gap-1 min-w-0 flex-1 justify-center">
                                        <h5 className="font-medium text-foreground text-xs line-clamp-1">{sku.skuName}</h5>
                                        <div className="flex flex-col gap-0.5">
                                          <CopyableId text={sku.skcCode} label="SKU ID" />
                                          <CopyableId text={sku.skuCode} label="Seller SKU" />
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  {/* Status */}
                                  <TableCell>
                                    <Badge variant="outline" className={cn("w-fit h-5 px-1.5 text-[9px] font-medium border-none rounded-sm", sku.status === "Active" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400")}>{sku.status}</Badge>
                                  </TableCell>
                                  {/* Type - empty for SKU */}
                                  <TableCell>
                                    <span className="text-[10px] text-muted-foreground italic">-</span>
                                  </TableCell>
                                  {/* Category - show specs */}
                                  <TableCell>
                                    <div className="text-[10px] text-muted-foreground">{sku.color} / {sku.size}</div>
                                  </TableCell>
                                  {/* Price - show both regular and sale price */}
                                  <TableCell className="text-right">
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-sm font-bold text-foreground">${sku.price.toFixed(2)}</span>
                                      {sku.salePrice > 0 && (
                                        <span className="text-xs font-semibold text-destructive">${sku.salePrice.toFixed(2)}</span>
                                      )}
                                    </div>
                                  </TableCell>
                                  {/* Mapping */}
                                  <TableCell>
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setSelectedSkuForMapping({ code: sku.skuCode, name: sku.skuName });
                                        setMappingDialogOpen(true);
                                      }}
                                      className="flex items-center gap-1.5 text-[10px] font-medium text-primary hover:underline transition-colors opacity-80 hover:opacity-100"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      View Mapping
                                    </button>
                                  </TableCell>
                                  {/* Source - inherited */}
                                  <TableCell>
                                    <span className="text-[9px] text-muted-foreground italic">-</span>
                                  </TableCell>
                                  {/* Channels - inherited */}
                                  <TableCell>
                                    <span className="text-[9px] text-muted-foreground italic">-</span>
                                  </TableCell>
                                  {/* Date - empty for SKU */}
                                  <TableCell>
                                    <span className="text-[10px] text-muted-foreground italic">-</span>
                                  </TableCell>
                                  <TableCell />
                                </TableRow>
                              ))}
                            </React.Fragment>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Tabs>
        </div>
        <BatchEditDialog open={isBatchEditOpen} onOpenChange={setIsBatchEditOpen} type={batchType} selectedProducts={selectedProducts} />
        <BatchPublishDialog
          open={isBatchPublishOpen}
          onOpenChange={setIsBatchPublishOpen}
          selectedProducts={mockProducts.filter(p => selectedIds.includes(p.id))}
        />
        <SkuMappingDialog 
          open={mappingDialogOpen} 
          onOpenChange={setMappingDialogOpen}
          skuCode={selectedSkuForMapping?.code || ""}
          skuName={selectedSkuForMapping?.name || ""}
        />
      </MainLayout>
    </TooltipProvider>
  )
}
