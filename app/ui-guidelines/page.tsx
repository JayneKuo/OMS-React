"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { 
  Palette, 
  Type, 
  Layout, 
  Layers, 
  Eye,
  Copy,
  Check,
  ChevronDown,
  Settings,
  User,
  Search,
  MoreHorizontal,
  Plus,
  Download,
  CheckCircle,
  AlertCircle,
  X,
  Info,
  Trash2,
  Edit,
  ArrowLeft,
  Share,
  Save,
  Mail,
  Phone,
  MapPin,
  Filter,
  Calendar,
  Clock,
  Bell,
  Star,
  Heart,
  Bookmark,
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns,
  Send,
  Archive
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function UIGuidelinesPage() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState<number>(2)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [showColumnDialog, setShowColumnDialog] = useState(false)

  const copyToClipboard = (text: string, colorName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedColor(colorName)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  // 颜色系统数据
  const primaryColors = [
    { name: "White", hex: "#FFFFFF", rgb: "255, 255, 255", meaning: "清晰" },
    { name: "Black", hex: "#000000", rgb: "0, 0, 0", meaning: "优雅" },
    { name: "Purple", hex: "#6B46C1", rgb: "107, 70, 193", meaning: "创新" },
    { name: "Orange", hex: "#F97316", rgb: "249, 115, 22", meaning: "活力" }
  ]

  const uiThemeColors = [
    { state: "Primary", light: "#753BBD", dark: "#763ABF" },
    { state: "Hover", light: "#9561D0", dark: "#6C38AD" },
    { state: "Active", light: "#A788E1", dark: "#693f9d" },
    { state: "Pressed", light: "#5B2D94", dark: "#5c2a9a" }
  ]

  const semanticColors = [
    { type: "Success", color: "#15803D", light: "#DCFCE7", usage: "确认、完成操作" },
    { type: "Warning", color: "#e79f04", light: "#FEF3C7", usage: "警告、需要注意" },
    { type: "Danger", color: "#F0283C", light: "#FECACA", usage: "错误、危险操作" },
    { type: "Info", color: "#666666", light: "#DEDFE0", usage: "中性信息" }
  ]

  const textColors = [
    { level: "Primary", light: "#181818", dark: "#ffffff", usage: "标题、重要文本" },
    { level: "Regular", light: "#3c3c3c", dark: "#ffffff", usage: "正文文本" },
    { level: "Secondary", light: "#666666", dark: "#999999", usage: "说明、标签" },
    { level: "Placeholder", light: "#666666", dark: "#737373", usage: "输入占位符" },
    { level: "Disabled", light: "#6666665d", dark: "#7373736d", usage: "禁用元素" }
  ]

  // 字体系统数据
  const typeScale = [
    { element: "H1", sizeName: "9x Large", pixels: "128px", useCase: "英雄标题", className: "text-9xl font-black" },
    { element: "H2", sizeName: "8x Large", pixels: "96px", useCase: "页面标题", className: "text-8xl font-bold" },
    { element: "H3", sizeName: "7x Large", pixels: "64px", useCase: "区块标题", className: "text-7xl font-semibold" },
    { element: "H4", sizeName: "6x Large", pixels: "48px", useCase: "子区块标题", className: "text-6xl font-medium" },
    { element: "H5", sizeName: "5x Large", pixels: "36px", useCase: "卡片标题", className: "text-5xl font-medium" },
    { element: "H6", sizeName: "4x Large", pixels: "28px", useCase: "小标题", className: "text-4xl font-medium" },
    { element: "Subtitle 1", sizeName: "3x Large", pixels: "24px", useCase: "引导段落", className: "text-3xl font-normal" },
    { element: "Subtitle 2", sizeName: "2x Large", pixels: "20px", useCase: "次要引导", className: "text-2xl font-normal" },
    { element: "Body 1", sizeName: "Extra Large", pixels: "20px", useCase: "大正文", className: "text-xl font-normal" },
    { element: "Body 2", sizeName: "Large", pixels: "18px", useCase: "标准正文", className: "text-lg font-normal" },
    { element: "Base", sizeName: "Base", pixels: "16px", useCase: "默认文本", className: "text-base font-normal" },
    { element: "Button 1", sizeName: "Small", pixels: "14px", useCase: "按钮、标签", className: "text-sm font-medium" },
    { element: "Button 2", sizeName: "Extra Small", pixels: "12px", useCase: "小标签、说明", className: "text-xs font-medium" }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">AI-Friendly UI 设计规范</h1>
          <p className="text-lg text-muted-foreground">
            基于 Item Design System 的完整设计规范 - 为一致、可访问、美观的界面提供指导
          </p>
        </div>

        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              颜色系统
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              字体排版
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              常用组件
            </TabsTrigger>
            <TabsTrigger value="layouts" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              页面布局
            </TabsTrigger>
            <TabsTrigger value="guidelines" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              设计规范
            </TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            {/* Primary Colors */}
            <Card>
              <CardHeader>
                <CardTitle>主要颜色</CardTitle>
                <CardDescription>定义视觉识别的核心品牌颜色</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {primaryColors.map((color) => (
                    <div key={color.name} className="space-y-3">
                      <div 
                        className="h-20 rounded-lg border cursor-pointer transition-transform hover:scale-105"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => copyToClipboard(color.hex, color.name)}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{color.name}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(color.hex, color.name)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedColor === color.name ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{color.hex}</p>
                        <p className="text-xs text-muted-foreground">RGB: {color.rgb}</p>
                        <Badge variant="secondary" className="text-xs">{color.meaning}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* UI Theme Colors */}
            <Card>
              <CardHeader>
                <CardTitle>UI 主题颜色</CardTitle>
                <CardDescription>交互元素在明暗模式下的颜色</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {uiThemeColors.map((color) => (
                    <div key={color.state} className="space-y-3">
                      <div className="space-y-2">
                        <div 
                          className="h-16 rounded-lg border cursor-pointer transition-transform hover:scale-105"
                          style={{ backgroundColor: color.light }}
                          onClick={() => copyToClipboard(color.light, `${color.state}-light`)}
                        />
                        <div 
                          className="h-16 rounded-lg border cursor-pointer transition-transform hover:scale-105"
                          style={{ backgroundColor: color.dark }}
                          onClick={() => copyToClipboard(color.dark, `${color.state}-dark`)}
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">{color.state}</h4>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">明亮: {color.light}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(color.light, `${color.state}-light`)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedColor === `${color.state}-light` ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">暗黑: {color.dark}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(color.dark, `${color.state}-dark`)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedColor === `${color.state}-dark` ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Semantic Colors */}
            <Card>
              <CardHeader>
                <CardTitle>语义颜色</CardTitle>
                <CardDescription>具有特定含义的用户反馈颜色</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {semanticColors.map((color) => (
                    <div key={color.type} className="space-y-3">
                      <div className="space-y-2">
                        <div 
                          className="h-16 rounded-lg border cursor-pointer transition-transform hover:scale-105"
                          style={{ backgroundColor: color.color }}
                          onClick={() => copyToClipboard(color.color, color.type)}
                        />
                        <div 
                          className="h-8 rounded border cursor-pointer transition-transform hover:scale-105"
                          style={{ backgroundColor: color.light }}
                          onClick={() => copyToClipboard(color.light, `${color.type}-light`)}
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">{color.type}</h4>
                        <p className="text-sm text-muted-foreground">{color.color}</p>
                        <p className="text-xs text-muted-foreground">{color.usage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Text Colors */}
            <Card>
              <CardHeader>
                <CardTitle>文本颜色</CardTitle>
                <CardDescription>不同内容层级的文字颜色</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {textColors.map((color) => (
                    <div key={color.level} className="space-y-3">
                      <div className="space-y-2">
                        <div 
                          className="h-16 rounded-lg border cursor-pointer transition-transform hover:scale-105 flex items-center justify-center"
                          style={{ backgroundColor: color.light, color: color.light === '#ffffff' ? '#000000' : '#ffffff' }}
                          onClick={() => copyToClipboard(color.light, `${color.level}-light`)}
                        >
                          <span className="text-sm font-medium">明亮</span>
                        </div>
                        <div 
                          className="h-16 rounded-lg border cursor-pointer transition-transform hover:scale-105 flex items-center justify-center"
                          style={{ backgroundColor: color.dark, color: color.dark === '#ffffff' ? '#000000' : '#ffffff' }}
                          onClick={() => copyToClipboard(color.dark, `${color.level}-dark`)}
                        >
                          <span className="text-sm font-medium">暗黑</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">{color.level}</h4>
                        <p className="text-xs text-muted-foreground">{color.usage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>字体层级</CardTitle>
                <CardDescription>基于 Satoshi 字体的一致文本尺寸</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {typeScale.map((type) => (
                    <div key={type.element} className="flex items-center justify-between border-b pb-4">
                      <div className="flex-1">
                        <div className={`${type.className} mb-2`}>
                          {type.element} - {type.useCase}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {type.sizeName} • {type.pixels} • {type.className}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(type.className, type.element)}
                        className="ml-4"
                      >
                        {copiedColor === type.element ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Spacing Scale */}
            <Card>
              <CardHeader>
                <CardTitle>间距系统</CardTitle>
                <CardDescription>布局和组件的一致间距标记</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { token: "xs", value: "4px", usage: "紧密间隙", className: "p-1" },
                    { token: "sm", value: "8px", usage: "相关元素", className: "p-2" },
                    { token: "md", value: "16px", usage: "标准间距", className: "p-4" },
                    { token: "lg", value: "24px", usage: "区块间隙", className: "p-6" },
                    { token: "xl", value: "32px", usage: "主要区块", className: "p-8" },
                    { token: "2xl", value: "48px", usage: "页面区块", className: "p-12" },
                    { token: "3xl", value: "64px", usage: "英雄区域", className: "p-16" }
                  ].map((spacing) => (
                    <div key={spacing.token} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-16 text-sm font-mono">{spacing.token}</div>
                      <div className="w-16 text-sm text-muted-foreground">{spacing.value}</div>
                      <div className="flex-1 text-sm">{spacing.usage}</div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="bg-primary/20 border-2 border-primary/40"
                          style={{ width: spacing.value, height: spacing.value }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(spacing.className, spacing.token)}
                        >
                          {copiedColor === spacing.token ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            {/* 基础组件 */}
            <Card>
              <CardHeader>
                <CardTitle>基础组件</CardTitle>
                <CardDescription>按钮、徽章、图标等基础UI元素</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* 按钮组件 */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">按钮组件</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-medium">按钮变体</h5>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Button>主要按钮</Button>
                          <code className="text-sm bg-muted px-2 py-1 rounded">default</code>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button variant="secondary">次要按钮</Button>
                          <code className="text-sm bg-muted px-2 py-1 rounded">secondary</code>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button variant="outline">边框按钮</Button>
                          <code className="text-sm bg-muted px-2 py-1 rounded">outline</code>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button variant="ghost">幽灵按钮</Button>
                          <code className="text-sm bg-muted px-2 py-1 rounded">ghost</code>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button variant="destructive">危险按钮</Button>
                          <code className="text-sm bg-muted px-2 py-1 rounded">destructive</code>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h5 className="font-medium">按钮尺寸和状态</h5>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Button size="sm">小按钮</Button>
                          <Button>默认按钮</Button>
                          <Button size="lg">大按钮</Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button size="icon">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button disabled>禁用按钮</Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            带图标
                          </Button>
                          <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            下载
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 徽章组件 */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">徽章组件</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-medium">基础徽章</h5>
                      <div className="flex flex-wrap gap-3">
                        <Badge>默认</Badge>
                        <Badge variant="secondary">次要</Badge>
                        <Badge variant="outline">边框</Badge>
                        <Badge variant="destructive">危险</Badge>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h5 className="font-medium">语义化徽章</h5>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          成功
                        </Badge>
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          警告
                        </Badge>
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                          <X className="w-3 h-3 mr-1" />
                          错误
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          <Info className="w-3 h-3 mr-1" />
                          信息
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 交互组件 */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">交互组件</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-medium">下拉菜单</h5>
                      <div className="flex gap-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              操作菜单
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <User className="mr-2 h-4 w-4" />
                              个人资料
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              设置
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h5 className="font-medium">对话框</h5>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">打开对话框</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>对话框标题</DialogTitle>
                            <DialogDescription>
                              这是一个示例对话框，展示了标准的对话框布局和样式。
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline">取消</Button>
                            <Button>确认</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 图标和加载状态 */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">图标和加载状态</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-medium">常用图标</h5>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex flex-col items-center gap-2">
                          <User className="h-6 w-6" />
                          <span className="text-xs">User</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Settings className="h-6 w-6" />
                          <span className="text-xs">Settings</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Bell className="h-6 w-6" />
                          <span className="text-xs">Bell</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Calendar className="h-6 w-6" />
                          <span className="text-xs">Calendar</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Clock className="h-6 w-6" />
                          <span className="text-xs">Clock</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Star className="h-6 w-6" />
                          <span className="text-xs">Star</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Heart className="h-6 w-6" />
                          <span className="text-xs">Heart</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Bookmark className="h-6 w-6" />
                          <span className="text-xs">Bookmark</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h5 className="font-medium">加载状态</h5>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Button disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            加载中...
                          </Button>
                          <code className="text-sm bg-muted px-2 py-1 rounded">animate-spin</code>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="icon">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          </Button>
                          <span className="text-sm">刷新中</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <span className="text-sm">数据加载中...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 文件上传和媒体 */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">文件和媒体组件</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-medium">文件类型图标</h5>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex flex-col items-center gap-2 p-3 border rounded-lg">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <span className="text-xs">文档</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-3 border rounded-lg">
                          <ImageIcon className="h-8 w-8 text-green-600" />
                          <span className="text-xs">图片</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-3 border rounded-lg">
                          <Video className="h-8 w-8 text-purple-600" />
                          <span className="text-xs">视频</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-3 border rounded-lg">
                          <Music className="h-8 w-8 text-pink-600" />
                          <span className="text-xs">音频</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h5 className="font-medium">上传按钮</h5>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full gap-2">
                          <Upload className="h-4 w-4" />
                          上传文件
                        </Button>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">点击或拖拽文件到此处</p>
                          <p className="text-xs text-muted-foreground mt-1">支持 JPG, PNG, PDF 格式</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 标签页和分隔符 */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">标签页和分隔符</h4>
                  <div className="space-y-4">
                    <h5 className="font-medium">标签页示例</h5>
                    <Tabs defaultValue="tab1" className="w-full">
                      <TabsList>
                        <TabsTrigger value="tab1">标签 1</TabsTrigger>
                        <TabsTrigger value="tab2">标签 2</TabsTrigger>
                        <TabsTrigger value="tab3">标签 3</TabsTrigger>
                      </TabsList>
                      <TabsContent value="tab1" className="mt-4">
                        <p className="text-sm text-muted-foreground">这是标签 1 的内容</p>
                      </TabsContent>
                      <TabsContent value="tab2" className="mt-4">
                        <p className="text-sm text-muted-foreground">这是标签 2 的内容</p>
                      </TabsContent>
                      <TabsContent value="tab3" className="mt-4">
                        <p className="text-sm text-muted-foreground">这是标签 3 的内容</p>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="space-y-4 mt-6">
                      <h5 className="font-medium">分隔符</h5>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm mb-2">水平分隔符</p>
                          <Separator />
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-sm">垂直分隔符</p>
                          <Separator orientation="vertical" className="h-8" />
                          <p className="text-sm">内容</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 表单组件 */}
            <Card>
              <CardHeader>
                <CardTitle>表单组件</CardTitle>
                <CardDescription>输入框、选择器、文本域等表单元素</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="text-input">文本输入</Label>
                      <Input id="text-input" placeholder="请输入文本..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-input">邮箱输入</Label>
                      <Input id="email-input" type="email" placeholder="user@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-input">密码输入</Label>
                      <Input id="password-input" type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="search-input">搜索输入</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="search-input" placeholder="搜索..." className="pl-9" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="select-demo">选择器</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择选项" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="option1">选项 1</SelectItem>
                          <SelectItem value="option2">选项 2</SelectItem>
                          <SelectItem value="option3">选项 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="textarea-demo">文本域</Label>
                      <Textarea id="textarea-demo" placeholder="请输入多行文本..." rows={3} />
                    </div>
                    <div className="space-y-3">
                      <Label>复选框选项</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="checkbox1" />
                          <Label htmlFor="checkbox1">选项 1</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="checkbox2" />
                          <Label htmlFor="checkbox2">选项 2</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="checkbox3" disabled />
                          <Label htmlFor="checkbox3">禁用选项</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 数据展示组件 */}
            <Card>
              <CardHeader>
                <CardTitle>数据展示组件</CardTitle>
                <CardDescription>表格、卡片、进度条等数据展示元素</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 数据表格 */}
                <div className="space-y-4">
                  <h5 className="font-medium">数据表格</h5>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>姓名</TableHead>
                        <TableHead>邮箱</TableHead>
                        <TableHead>角色</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">张三</TableCell>
                        <TableCell>zhangsan@example.com</TableCell>
                        <TableCell>管理员</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">活跃</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                查看
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <Separator />

                {/* 卡片和进度条 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="font-medium">信息卡片</h5>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                            <User className="h-6 w-6 text-primary-foreground" />
                          </div>
                          <div>
                            <h4 className="font-semibold">用户信息</h4>
                            <p className="text-sm text-muted-foreground">显示用户相关数据</p>
                          </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>完成进度</span>
                            <span>75%</span>
                          </div>
                          <Progress value={75} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-medium">统计卡片</h5>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">1,234</div>
                            <div className="text-sm text-muted-foreground">总用户</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">89%</div>
                            <div className="text-sm text-muted-foreground">活跃率</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">567</div>
                            <div className="text-sm text-muted-foreground">新增</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">12</div>
                            <div className="text-sm text-muted-foreground">待处理</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layouts Tab */}
          <TabsContent value="layouts" className="space-y-6">
            {/* 真实布局示例链接 */}
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">🎯 查看真实布局示例</h3>
                    <p className="text-sm text-muted-foreground">
                      完整的、可交互的列表页布局，包含安全区域、Toast通知、Sheet抽屉、批量操作等真实功能
                    </p>
                  </div>
                  <Button asChild>
                    <a href="/real-layout-demo" target="_blank">
                      查看示例
                      <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>列表页布局规范</CardTitle>
                <CardDescription>标准的数据列表页面布局结构和组件</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h5 className="font-medium">页面头部结构</h5>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold">页面标题</h2>
                        <p className="text-muted-foreground">页面描述信息</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          导出
                        </Button>
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          新建
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="font-medium">筛选栏布局</h5>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="搜索..." className="pl-9 max-w-sm" />
                        </div>
                      </div>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="状态筛选" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部状态</SelectItem>
                          <SelectItem value="active">活跃</SelectItem>
                          <SelectItem value="inactive">非活跃</SelectItem>
                          <SelectItem value="pending">待审核</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        高级筛选
                      </Button>
                    </div>
                    
                    {/* 选中状态展示 */}
                    {selectedStatus !== "all" && (
                      <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/20 rounded-lg">
                        <span className="text-sm">已选筛选:</span>
                        <Badge variant="secondary" className="gap-1">
                          状态: {selectedStatus === "active" ? "活跃" : selectedStatus === "inactive" ? "非活跃" : "待审核"}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => setSelectedStatus("all")}
                          />
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* 状态标签页 */}
                <div className="space-y-4">
                  <h5 className="font-medium">状态标签页</h5>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="all">
                          全部
                          <Badge variant="secondary" className={cn("ml-2", selectedStatus === "all" && "bg-transparent text-primary-foreground border-0")}>1,234</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="active">
                          活跃
                          <Badge variant="secondary" className={cn("ml-2", selectedStatus === "active" && "bg-transparent text-primary-foreground border-0")}>856</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="pending">
                          待审核
                          <Badge variant="secondary" className={cn("ml-2", selectedStatus === "pending" && "bg-transparent text-primary-foreground border-0")}>123</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="inactive">
                          非活跃
                          <Badge variant="secondary" className={cn("ml-2", selectedStatus === "inactive" && "bg-transparent text-primary-foreground border-0")}>255</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="archived">
                          已归档
                          <Badge variant="secondary" className={cn("ml-2", selectedStatus === "archived" && "bg-transparent text-primary-foreground border-0")}>45</Badge>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>

                {/* 数据表格和分页 */}
                <div className="space-y-4">
                  <h5 className="font-medium">数据表格和分页</h5>
                  <div className="border rounded-lg">
                    <div className="p-4 border-b bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          共 1,234 条记录
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowColumnDialog(!showColumnDialog)}
                          >
                            <Columns className="h-4 w-4 mr-2" />
                            自定义列
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* 批量操作栏 - 当有选中项时显示 */}
                    {selectedRows.length > 0 && (
                      <div className="p-4 border-b bg-primary/5 border-primary/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">
                              已选择 {selectedRows.length} 项
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedRows([])}
                            >
                              取消选择
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Download className="h-4 w-4" />
                              导出
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Send className="h-4 w-4" />
                              发送
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Archive className="h-4 w-4" />
                              归档
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  更多操作
                                  <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  批量编辑
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share className="mr-2 h-4 w-4" />
                                  批量分享
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  批量删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 自定义列对话框 */}
                    {showColumnDialog && (
                      <div className="p-4 border-b bg-muted/30">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h6 className="font-medium text-sm">自定义显示列</h6>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setShowColumnDialog(false)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="col-name" defaultChecked />
                              <Label htmlFor="col-name" className="text-sm font-normal">名称</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="col-status" defaultChecked />
                              <Label htmlFor="col-status" className="text-sm font-normal">状态</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="col-date" defaultChecked />
                              <Label htmlFor="col-date" className="text-sm font-normal">创建时间</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="col-owner" />
                              <Label htmlFor="col-owner" className="text-sm font-normal">负责人</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="col-category" />
                              <Label htmlFor="col-category" className="text-sm font-normal">分类</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="col-priority" />
                              <Label htmlFor="col-priority" className="text-sm font-normal">优先级</Label>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" size="sm">重置</Button>
                            <Button size="sm">应用</Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox 
                              checked={selectedRows.length === 2}
                              onCheckedChange={(checked) => {
                                setSelectedRows(checked ? [1, 2] : [])
                              }}
                            />
                          </TableHead>
                          <TableHead>名称</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead>创建时间</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className={selectedRows.includes(1) ? "bg-muted/50" : ""}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedRows.includes(1)}
                              onCheckedChange={(checked) => {
                                setSelectedRows(checked 
                                  ? [...selectedRows, 1] 
                                  : selectedRows.filter(id => id !== 1)
                                )
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-medium">示例项目 1</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">活跃</Badge>
                          </TableCell>
                          <TableCell>2024-01-15</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow className={selectedRows.includes(2) ? "bg-muted/50" : ""}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedRows.includes(2)}
                              onCheckedChange={(checked) => {
                                setSelectedRows(checked 
                                  ? [...selectedRows, 2] 
                                  : selectedRows.filter(id => id !== 2)
                                )
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-medium">示例项目 2</TableCell>
                          <TableCell>
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">待审核</Badge>
                          </TableCell>
                          <TableCell>2024-01-14</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    
                    {/* 分页区域 */}
                    <div className="p-4 border-t bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          显示第 21-40 条，共 1,234 条记录
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                          >
                            <ChevronsLeft className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant={currentPage === 1 ? "default" : "outline"} 
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                          >
                            1
                          </Button>
                          <Button 
                            variant={currentPage === 2 ? "default" : "outline"} 
                            size="sm"
                            onClick={() => setCurrentPage(2)}
                          >
                            2
                          </Button>
                          <Button 
                            variant={currentPage === 3 ? "default" : "outline"} 
                            size="sm"
                            onClick={() => setCurrentPage(3)}
                          >
                            3
                          </Button>
                          <span className="text-sm text-muted-foreground px-2">...</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCurrentPage(62)}
                          >
                            62
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(62, currentPage + 1))}
                            disabled={currentPage === 62}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCurrentPage(62)}
                            disabled={currentPage === 62}
                          >
                            <ChevronsRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* 每页显示数量选择 */}
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm text-muted-foreground">每页显示:</span>
                        <Select defaultValue="20">
                          <SelectTrigger className="w-[100px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 条</SelectItem>
                            <SelectItem value="20">20 条</SelectItem>
                            <SelectItem value="50">50 条</SelectItem>
                            <SelectItem value="100">100 条</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>详情页布局规范</CardTitle>
                <CardDescription>标准的详情页面布局结构和信息展示</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h5 className="font-medium">页面头部结构</h5>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center gap-4 mb-4">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        返回列表
                      </Button>
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary">
                          <User className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold">详情标题</h1>
                          <p className="text-muted-foreground">详情副标题或描述</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">活跃状态</Badge>
                            <span className="text-sm text-muted-foreground">创建于 2024-01-15</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="gap-2">
                          <Share className="h-4 w-4" />
                          分享
                        </Button>
                        <Button variant="outline" className="gap-2">
                          <Edit className="h-4 w-4" />
                          编辑
                        </Button>
                        <Button className="gap-2">
                          <Save className="h-4 w-4" />
                          保存
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="font-medium">内容区域布局</h5>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>基本信息</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">姓名</Label>
                              <p className="mt-1">张三</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">邮箱</Label>
                              <p className="mt-1 flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                zhangsan@example.com
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">电话</Label>
                              <p className="mt-1 flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                +86 138 0013 8000
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">地址</Label>
                              <p className="mt-1 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                北京市朝阳区
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>快速操作</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button className="w-full gap-2">
                            <Edit className="h-4 w-4" />
                            编辑信息
                          </Button>
                          <Button variant="outline" className="w-full gap-2">
                            <Download className="h-4 w-4" />
                            导出数据
                          </Button>
                          <Button variant="outline" className="w-full gap-2">
                            <Share className="h-4 w-4" />
                            分享链接
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guidelines Tab */}
          <TabsContent value="guidelines" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>实施检查清单</CardTitle>
                <CardDescription>发布任何 UI 前的必要检查</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      设计系统合规性
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        颜色使用 CSS 变量
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        字体遵循层级（8px 增量）
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        间距使用一致标记（8px 增量）
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        支持暗黑模式
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        选中状态使用主色（紫色）
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        交互元素定义 hover 状态
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      可访问性
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        充足的颜色对比度（最小 4.5:1）
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        正确的标题层级
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        键盘导航可见焦点状态
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        语义化 HTML 结构
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        最小触摸目标 40px
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>快速参考</CardTitle>
                <CardDescription>AI 代码生成的关键值</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h5 className="font-medium">颜色</h5>
                    <div className="text-sm space-y-1 font-mono">
                      <div>Primary: #753BBD</div>
                      <div>Accent: #F97316</div>
                      <div>Success: #15803D</div>
                      <div>Warning: #e79f04</div>
                      <div>Danger: #F0283C</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-medium">字体</h5>
                    <div className="text-sm space-y-1 font-mono">
                      <div>Font: Satoshi</div>
                      <div>Base Size: 16px</div>
                      <div>Scale: 1.25 ratio</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-medium">间距</h5>
                    <div className="text-sm space-y-1 font-mono">
                      <div>Unit: 8px</div>
                      <div>Scale: 4, 8, 16, 24, 32, 48, 64</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>实际实现模式</CardTitle>
                <CardDescription>基于真实 OMS React 项目的实现规范</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 页面布局 */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-sm">页面布局结构</h5>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-xs font-mono">
                    <div className="text-muted-foreground">/* 列表页 */</div>
                    <div>Container: space-y-6 (24px)</div>
                    <div>Title: text-3xl (24px) font-semibold</div>
                    <div>Description: text-sm (14px) mt-2 (8px)</div>
                    <div>Buttons: size="sm" gap-2 (8px)</div>
                    <div className="text-muted-foreground mt-2">/* 详情页 */</div>
                    <div>Header: p-6 (24px) border rounded-lg</div>
                    <div>Cards Grid: gap-6 (24px)</div>
                  </div>
                </div>

                {/* 导航和选中状态 */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-sm">导航和选中状态</h5>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-xs font-mono">
                    <div className="text-muted-foreground">/* 侧边栏菜单 */</div>
                    <div>Active: bg-primary text-primary-foreground</div>
                    <div>Disabled: opacity-50 cursor-not-allowed</div>
                    <div className="text-muted-foreground mt-2">/* Tabs */</div>
                    <div>Active: bg-primary text-primary-foreground</div>
                    <div>Badge (Active): bg-transparent text-primary-foreground</div>
                  </div>
                </div>

                {/* Badges 和标签 */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-sm">Badges 和标签</h5>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-xs font-mono">
                    <div className="text-muted-foreground">/* 状态 Badges */</div>
                    <div>Success: bg-green-100 text-green-800</div>
                    <div>Warning: bg-yellow-100 text-yellow-800</div>
                    <div>Danger: bg-red-100 text-red-800</div>
                    <div className="text-muted-foreground mt-2">/* 筛选 Badges */</div>
                    <div>Style: bg-primary/10 text-primary border</div>
                  </div>
                </div>

                {/* 间距模式 */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-sm">常用间距模式</h5>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-xs font-mono">
                    <div>gap-2 (8px) - 按钮、内联元素</div>
                    <div>gap-3 (12px) - 表单字段、列表项</div>
                    <div>gap-4 (16px) - 内容区块</div>
                    <div>gap-6 (24px) - 主要区块、卡片</div>
                    <div className="text-muted-foreground mt-2">/* 垂直间距 */</div>
                    <div>space-y-2 (8px) - 紧密列表</div>
                    <div>space-y-3 (12px) - 表单组</div>
                    <div>space-y-6 (24px) - 页面区块</div>
                  </div>
                </div>

                {/* 按钮和操作 */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-sm">按钮尺寸</h5>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-xs font-mono">
                    <div>Small: size="sm" (h-9 px-3)</div>
                    <div>Icon: size="icon" (h-9 w-9)</div>
                    <div>Default: h-10 px-4</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CSS 变量使用</CardTitle>
                <CardDescription>正确的颜色变量使用方式</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                    <div className="text-green-600 mb-2">/* 推荐 - 使用 CSS 变量 */</div>
                    <div className="text-green-600">background: hsl(var(--primary));</div>
                    <div className="text-green-600">color: hsl(var(--primary-foreground));</div>
                    <div className="text-green-600">border: 1px solid hsl(var(--border));</div>
                    <div className="mt-4 text-red-600 mb-2">/* 避免 - 硬编码颜色 */</div>
                    <div className="text-red-600">background: #753BBD;</div>
                    <div className="text-red-600">color: #ffffff;</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    使用 CSS 变量确保主题一致性和暗黑模式支持。所有颜色都应该通过语义化变量引用。
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
