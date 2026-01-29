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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
    MoreHorizontal,
    ChevronDown,
    ChevronRight,
    RefreshCw,
    Plus,
    Search,
    Filter,
    ArrowUpDown,
    Columns,
    Copy,
    ExternalLink,
    Tag,
    Trash2,
    Store,
    List,
    LayoutTemplate,
    Boxes,
    Layers
} from "lucide-react"
import { toast } from "sonner"
import { BatchEditDialog } from "@/components/product/batch-edit-dialog"
import {
    TooltipProvider
} from "@/components/ui/tooltip"
import { FilterBar, FilterConfig, ActiveFilter } from "@/components/data-table/filter-bar"
import { SkuMappingDialog } from "@/components/product/sku-mapping-dialog"

// --- Menu Configuration (Sidebar) ---
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
        id: "ITEM-7729182",
        spuCode: "SPU-10028",
        parentSku: "P-SKU-9901",
        internalItemId: "INT-88220",
        title: "2024 夏季新款法式复古碎花连衣裙高腰显瘦 A 字裙",
        image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=200&h=250&fit=crop",
        status: "Published",
        mappingStatus: "Mapped",
        category: "女装 > 连衣裙",
        brand: "Zara",
        type: "普通商品",
        regularPrice: 299.00,
        salePrice: 199.00,
        inventory: 1250,
        source: "ERP同步",
        channels: ["Shein Global", "TikTok US"],
        created: "2024-03-10",
        updated: "2024-03-25",
        listed: "2024-03-11",
        skus: [
            { id: "SKU-A1", skuCode: "S24-RED-S", skuId: "882101", skuName: "法式碎花裙 - 红色 S码", skcCode: "C01", color: "红色", size: "S", price: 299, salePrice: 199, inventory: 500, status: "Active", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100&h=100&fit=crop" },
            { id: "SKU-A2", skuCode: "S24-RED-M", skuId: "882102", skuName: "法式碎花裙 - 红色 M码", skcCode: "C01", color: "红色", size: "M", price: 299, salePrice: 199, inventory: 750, status: "Active" }
        ]
    },
    {
        id: "ITEM-7729185",
        spuCode: "SPU-10035",
        parentSku: "P-SKU-9905",
        internalItemId: "INT-88225",
        title: "极简百搭纯棉白色短袖 T 恤女宽松落肩上衣",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=250&fit=crop",
        status: "Published",
        mappingStatus: "Unmapped",
        category: "女装 > 恤",
        brand: "Uniqlo",
        type: "基础款",
        regularPrice: 99.00,
        salePrice: 0,
        inventory: 85,
        source: "手动创建",
        channels: ["Shein US"],
        created: "2024-03-15",
        updated: "2024-03-25",
        listed: "2024-03-16",
        skus: [
            { id: "SKU-B1", skuCode: "WHT-F", skuId: "990101", skuName: "纯棉白T - 均码", skcCode: "W01", color: "白色", size: "均码", price: 99, salePrice: 0, inventory: 85, status: "Active" }
        ]
    }
]

// --- Design System Components ---

const PrimaryText = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <span className={cn("text-sm font-medium text-foreground tracking-tight", className)}>
        {children}
    </span>
)

const SecondaryText = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <span className={cn("text-xs text-muted-foreground tracking-normal", className)}>
        {children}
    </span>
)

const CopyableId = ({ text, label }: { text: string, label?: string }) => (
    <div
        className="group/id flex items-center gap-1.5 cursor-pointer max-w-fit rounded px-1 -ml-1 hover:bg-muted transition-colors"
        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(text); toast.success("Copied") }}
    >
        {label && <span className="text-[10px] text-muted-foreground font-medium">{label}:</span>}
        <span className="text-[11px] font-mono text-primary group-hover/id:underline underline-offset-2">{text}</span>
        <Copy className="h-2.5 w-2.5 opacity-0 group-hover/id:opacity-100 text-primary transition-opacity" />
    </div>
)

const StatusBadge = ({ status }: { status: "Published" | "Draft" | "Mapped" | "Unmapped" | string }) => {
    const styles: Record<string, string> = {
        "Published": "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200",
        "Draft": "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200",
        "Mapped": "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200",
        "Unmapped": "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200"
    }
    return (
        <Badge variant="outline" className={cn("h-5 px-1.5 text-[10px] font-medium border rounded pointer-events-none", styles[status] || "bg-muted text-muted-foreground border-border")}>
            {status}
        </Badge>
    )
}

const TabButton = ({ active, children, onClick, count }: { active: boolean, children: React.ReactNode, onClick: () => void, count?: number }) => (
    <button
        onClick={onClick}
        className={cn(
            "relative px-1 pb-2.5 text-sm font-medium transition-colors flex items-center gap-2",
            active ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
    >
        {children}
        {count !== undefined && (
            <Badge className={cn("h-4 min-w-[16px] px-1 rounded-sm text-[10px] pointer-events-none", active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                {count}
            </Badge>
        )}
        {active && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-sm w-full" />
        )}
    </button>
)

export default function SheinProductListPage() {
    const [selectedIds, setSelectedIds] = React.useState<string[]>([])
    const [isBatchEditOpen, setIsBatchEditOpen] = React.useState(false)
    const [batchType, setBatchType] = React.useState<"price" | "inventory">("price")
    const [currentTab, setCurrentTab] = React.useState("published")
    const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set())
    const [mappingDialogOpen, setMappingDialogOpen] = React.useState(false)
    const [selectedSkuForMapping, setSelectedSkuForMapping] = React.useState<{ code: string; name: string } | null>(null)
    const [searchValue, setSearchValue] = React.useState("")
    const [activeFilters, setActiveFilters] = React.useState<ActiveFilter[]>([])

    const filterConfigs: FilterConfig[] = [
        { id: "brand", label: "Brand", type: "single", options: [{ id: "zara", label: "Zara", value: "zara" }, { id: "uniqlo", label: "Uniqlo", value: "uniqlo" }] },
        { id: "status", label: "Status", type: "single", options: [{ id: "Published", label: "Published", value: "Published" }, { id: "Draft", label: "Draft", value: "Draft" }] },
        { id: "parentSku", label: "Parent SKU", type: "batch", placeholder: "Enter Parent SKU..." },
        { id: "sku", label: "SKU", type: "batch", placeholder: "Enter SKU..." },
        { id: "skc", label: "SKC", type: "batch", placeholder: "Enter SKC..." },
        { id: "productId", label: "Product ID", type: "batch", placeholder: "Enter Product ID..." },
        { id: "skuCode", label: "SKU Code", type: "batch", placeholder: "Enter SKU Code..." }
    ]

    // 计算选中的产品列表
    const selectedProducts = React.useMemo(() =>
        mockProducts.filter(p => selectedIds.includes(p.id)),
        [selectedIds]
    )

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setExpandedRows(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    return (
        <TooltipProvider>
            <MainLayout sidebarItems={sidebarItems} moduleName="Product">
                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                    body { font-family: 'Inter', 'Satoshi', sans-serif; }
                `}</style>

                <div className="space-y-6">

                    {/* Header Area */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    Shein Product List
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">Manage global inventory and verify Shein mapping status.</p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" size="sm" className="h-9 px-4 font-medium">
                                    <RefreshCw className="h-3.5 w-3.5 mr-2 text-muted-foreground" /> Sync
                                </Button>
                                <Button size="sm" className="h-9 px-4 font-medium shadow-sm">
                                    <Plus className="h-4 w-4 mr-1.5" /> Add Product
                                </Button>
                            </div>
                        </div>

                        {/* Tabs & View Switcher */}
                        <div className="flex items-center justify-between border-b border-border">
                            <div className="flex gap-6">
                                <TabButton active={currentTab === "published"} count={83} onClick={() => setCurrentTab("published")}>Published</TabButton>
                                <TabButton active={currentTab === "drafts"} count={12} onClick={() => setCurrentTab("drafts")}>Drafts</TabButton>
                                <TabButton active={currentTab === "archived"} onClick={() => setCurrentTab("archived")}>Archived</TabButton>
                            </div>
                        </div>

                        {/* Toolbar */}
                        {!selectedIds.length ? (
                            <FilterBar
                                searchPlaceholder="Search Product ID, Parent SKU, SKU, SKC, SKU Code..."
                                onSearchChange={setSearchValue}
                                filters={filterConfigs}
                                onFiltersChange={setActiveFilters}
                            />
                        ) : (
                            // Batch Action Bar
                            <div className="flex items-center justify-between p-2 px-4 bg-primary/5 border border-primary/20 rounded-md animate-in fade-in duration-200">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                            {selectedIds.length}
                                        </div>
                                        <span className="text-sm font-medium text-foreground">Selected</span>
                                    </div>
                                    <Separator orientation="vertical" className="h-4 bg-primary/20" />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedIds([])}
                                        className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline"
                                        onClick={() => { setBatchType('price'); setIsBatchEditOpen(true) }}
                                        className="h-8 border-primary/30 text-primary hover:bg-primary/5 bg-background font-medium"
                                    >
                                        Bulk Edit
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-8 border-primary/30 text-primary hover:bg-primary/5 bg-background font-medium">
                                        Export
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-primary">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-border h-10">
                                    <TableHead className="w-[50px] pl-4 py-2">
                                        <Checkbox
                                            checked={selectedIds.length === mockProducts.length && mockProducts.length > 0}
                                            onCheckedChange={() => selectedIds.length === mockProducts.length ? setSelectedIds([]) : setSelectedIds(mockProducts.map(p => p.id))}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary h-4 w-4"
                                        />
                                    </TableHead>
                                    <TableHead className="w-[320px] py-2 text-xs font-medium text-muted-foreground">Product Information</TableHead>
                                    <TableHead className="w-[120px] py-2 text-xs font-medium text-muted-foreground">SKC</TableHead>
                                    <TableHead className="w-[180px] py-2 text-xs font-medium text-muted-foreground">Category</TableHead>
                                    <TableHead className="w-[120px] py-2 text-xs font-medium text-muted-foreground text-right">Price</TableHead>
                                    <TableHead className="w-[120px] py-2 text-xs font-medium text-muted-foreground">Status</TableHead>
                                    <TableHead className="w-[140px] py-2 text-xs font-medium text-muted-foreground">Date</TableHead>
                                    <TableHead className="w-[60px] py-2 text-xs font-medium text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockProducts.map((p) => {
                                    const isExpanded = expandedRows.has(p.id)
                                    const isSelected = selectedIds.includes(p.id)
                                    // Calculate price range from SKUs
                                    const skuPrices = p.skus.map(sku => sku.price)
                                    const minPrice = Math.min(...skuPrices)
                                    const maxPrice = Math.max(...skuPrices)
                                    const hasPriceRange = minPrice !== maxPrice
                                    
                                    return (
                                        <React.Fragment key={p.id}>
                                            <TableRow
                                                className={cn(
                                                    "group border-b border-border/50 transition-colors hover:bg-primary/10",
                                                    isSelected && "bg-accent/30"
                                                )}
                                            >
                                                <TableCell className="w-[50px] pl-4 py-3 align-top" onClick={e => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => setSelectedIds(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                                                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary h-4 w-4 mt-1"
                                                    />
                                                </TableCell>
                                                {/* Product Information */}
                                                <TableCell className="w-[320px] py-4 px-2">
                                                    <div className="flex gap-4">
                                                        <div className="relative h-16 w-16 shrink-0 rounded-lg border border-border overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                                                            <img src={p.image} className="h-full w-full object-cover" />
                                                            {p.skus.length > 0 && (
                                                                <button
                                                                    onClick={(e) => toggleExpand(p.id, e)}
                                                                    className="absolute bottom-1 right-1 h-5 w-5 bg-card shadow-sm rounded-md flex items-center justify-center border border-border hover:bg-primary hover:text-primary-foreground transition-colors"
                                                                >
                                                                    {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col gap-1 min-w-0 flex-1 justify-center">
                                                            <h4 className="font-medium text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors leading-tight" title={p.title}>{p.title}</h4>
                                                            <div className="flex flex-col gap-0.5 mt-1">
                                                                <CopyableId text={p.parentSku} label="Parent SKU" />
                                                                <CopyableId text={p.spuCode} label="SPU Code" />
                                                                <CopyableId text={p.id} label="Product ID" />
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <span className="text-[10px] text-muted-foreground font-medium">Brand:</span>
                                                                    <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] font-medium h-4 px-1.5 rounded-sm border-none">
                                                                        {p.brand}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                {/* SKC - just show count */}
                                                <TableCell className="w-[120px] py-3 align-top">
                                                    <span className="text-xs font-medium text-foreground">
                                                        {p.skus.length} SKC{p.skus.length > 1 ? 's' : ''}
                                                    </span>
                                                </TableCell>
                                                {/* Category */}
                                                <TableCell className="w-[180px] py-3 align-top">
                                                    <SecondaryText>{p.category}</SecondaryText>
                                                </TableCell>
                                                {/* Price */}
                                                <TableCell className="w-[120px] py-3 align-top text-right">
                                                    <div className="flex flex-col gap-0.5">
                                                        {hasPriceRange ? (
                                                            <span className="text-sm font-semibold text-foreground font-mono">${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}</span>
                                                        ) : (
                                                            <>
                                                                <span className="text-sm font-semibold text-foreground font-mono">${p.regularPrice.toFixed(2)}</span>
                                                                {p.salePrice > 0 && (
                                                                    <span className="text-xs font-semibold text-destructive">${p.salePrice.toFixed(2)}</span>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                {/* Status */}
                                                <TableCell className="w-[120px] py-3 align-top">
                                                    <StatusBadge status={p.status} />
                                                </TableCell>
                                                {/* Dates - remove updated time */}
                                                <TableCell className="w-[140px] py-3 align-top">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-[10px] text-muted-foreground">Created: {p.created}</div>
                                                        {p.listed !== "-" && (
                                                            <div className="text-[10px] text-muted-foreground">Listed: {p.listed}</div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="w-[60px] py-3 align-top" onClick={e => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-[160px]">
                                                            <DropdownMenuItem className="text-sm">View Details</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-sm">Edit</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-sm text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>

                                            {/* Expanded SKC Rows */}
                                            {isExpanded && p.skus.map((sku, idx) => (
                                                <TableRow
                                                    key={sku.id}
                                                    className="hover:bg-primary/10 border-b border-border/50 group/sku transition-colors"
                                                >
                                                    <TableCell className="w-[50px] px-4 py-3" onClick={e => e.stopPropagation()}>
                                                        <Checkbox
                                                            checked={selectedIds.includes(sku.id)}
                                                            onCheckedChange={() => setSelectedIds(prev => prev.includes(sku.id) ? prev.filter(id => id !== sku.id) : [...prev, sku.id])}
                                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary h-4 w-4"
                                                        />
                                                    </TableCell>
                                                    {/* Product Information - SKC Name */}
                                                    <TableCell className="w-[320px] py-3 px-2">
                                                        <div className="flex gap-4 pl-8">
                                                            <div className="relative shrink-0 h-14 w-14 rounded border border-border/50 bg-muted/30 overflow-hidden shadow-sm">
                                                                <img src={sku.image || p.image} className="h-full w-full object-cover" />
                                                            </div>
                                                            <div className="flex flex-col gap-1 min-w-0 justify-center">
                                                                <span className="text-xs font-medium text-foreground line-clamp-1">{sku.skuName}</span>
                                                                <span className="text-[10px] text-muted-foreground">{sku.color} / {sku.size}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    {/* SKC Code */}
                                                    <TableCell className="w-[120px] py-3">
                                                        <CopyableId text={sku.skcCode} />
                                                    </TableCell>
                                                    {/* Category - inherited from parent */}
                                                    <TableCell className="w-[180px] py-3">
                                                        <span className="text-[10px] text-muted-foreground italic">-</span>
                                                    </TableCell>
                                                    {/* Price */}
                                                    <TableCell className="w-[120px] py-3 text-right">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-sm font-semibold text-foreground font-mono">${sku.price.toFixed(2)}</span>
                                                            {sku.salePrice > 0 && (
                                                                <span className="text-xs font-semibold text-destructive">${sku.salePrice.toFixed(2)}</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    {/* Status - Listed/Unlisted */}
                                                    <TableCell className="w-[120px] py-3">
                                                        <div className="flex flex-col gap-2 items-start">
                                                            <Badge variant="outline" className={cn(
                                                                "h-5 px-1.5 text-[10px] font-medium border rounded pointer-events-none",
                                                                sku.status === "Active"
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200"
                                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200"
                                                            )}>
                                                                {sku.status === "Active" ? "Listed" : "Unlisted"}
                                                            </Badge>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedSkuForMapping({ code: sku.skuCode || sku.id, name: sku.skuName });
                                                                    setMappingDialogOpen(true);
                                                                }}
                                                                className="flex items-center gap-1.5 text-[10px] font-medium text-primary hover:underline transition-colors opacity-80 hover:opacity-100"
                                                            >
                                                                <ExternalLink className="h-3 w-3" />
                                                                View Mapping
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                    {/* Dates - empty for SKC rows */}
                                                    <TableCell className="w-[140px] py-3">
                                                        <span className="text-[10px] text-muted-foreground italic">-</span>
                                                    </TableCell>
                                                    <TableCell className="w-[60px] py-3" />
                                                </TableRow>
                                            ))}
                                        </React.Fragment>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-border pt-4">
                        <span className="text-sm text-muted-foreground">
                            Showing <span className="font-medium text-foreground">1-2</span> of 83 items
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground mr-4">Rows per page: 20</span>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
                                <ChevronRight className="h-4 w-4 rotate-180" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                </div>
                <BatchEditDialog open={isBatchEditOpen} onOpenChange={setIsBatchEditOpen} type={batchType} selectedProducts={selectedProducts} />
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
