"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Plus, Download, MoreHorizontal, ArrowLeft, Edit, Send, Building, Clock, MapPin, User, Package } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function PageLayoutDemo() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">页面布局设计规范</h1>
          <p className="text-lg text-muted-foreground">
            基于实际PO模块的标准页面布局示例 - 包含列表页和详情页的完整设计规范
          </p>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <TabsTrigger value="list">列表页布局</TabsTrigger>
            <TabsTrigger value="detail">详情页布局</TabsTrigger>
            <TabsTrigger value="specs">设计规范说明</TabsTrigger>
          </TabsList>

          {/* 列表页布局示例 */}
          <TabsContent value="list" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>列表页标准布局</CardTitle>
                <CardDescription>参考 PO 列表页的标准设计</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 页面标题区 */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">1. 页面标题区</h3>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">采购订单列表</h2>
                        <p className="text-sm text-muted-foreground mt-1">管理和查看所有采购订单</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          导出
                        </Button>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          新建订单
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 text-xs space-y-1 text-muted-foreground">
                      <p>• 主标题: text-2xl font-bold (#181818 明亮模式 / #ffffff 暗黑模式)</p>
                      <p>• 描述文字: text-sm text-muted-foreground (#666666 明亮模式 / #999999 暗黑模式)</p>
                      <p>• 操作按钮: size="sm" 高度 32px</p>
                    </div>
                  </div>
                </div>

                {/* 搜索和筛选区 */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">2. 搜索和筛选区</h3>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="搜索订单号、供应商..." className="pl-9" />
                      </div>
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        筛选
                      </Button>
                      <Button variant="outline">状态</Button>
                      <Button variant="outline">供应商</Button>
                    </div>
                    <div className="mt-4 text-xs space-y-1 text-muted-foreground">
                      <p>• 搜索框: 高度 40px, 左侧图标 16x16px</p>
                      <p>• 筛选按钮: variant="outline" size="default"</p>
                      <p>• 图标大小: h-4 w-4 (16x16px)</p>
                    </div>
                  </div>
                </div>

                {/* 状态标签页 */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">3. 状态标签页</h3>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <Tabs defaultValue="all">
                      <TabsList>
                        <TabsTrigger value="all">全部 (156)</TabsTrigger>
                        <TabsTrigger value="new">新建 (23)</TabsTrigger>
                        <TabsTrigger value="transit">运输中 (45)</TabsTrigger>
                        <TabsTrigger value="receiving">收货中 (12)</TabsTrigger>
                        <TabsTrigger value="closed">已关闭 (76)</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <div className="mt-4 text-xs space-y-1 text-muted-foreground">
                      <p>• 标签文字: text-sm font-medium</p>
                      <p>• 数量显示: 括号内，使用相同字号</p>
                      <p>• 激活状态: bg-primary text-primary-foreground</p>
                    </div>
                  </div>
                </div>

                {/* 数据表格 */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">4. 数据表格</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">订单号</TableHead>
                          <TableHead className="font-semibold">供应商</TableHead>
                          <TableHead className="font-semibold">状态</TableHead>
                          <TableHead className="font-semibold">总金额</TableHead>
                          <TableHead className="font-semibold">创建时间</TableHead>
                          <TableHead className="text-right font-semibold">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium font-mono">PO202403150001</TableCell>
                          <TableCell>ABC Suppliers Inc.</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">已确认</Badge>
                          </TableCell>
                          <TableCell className="font-medium">USD 12,500.00</TableCell>
                          <TableCell className="text-muted-foreground">2024-01-15 10:30</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>查看详情</DropdownMenuItem>
                                <DropdownMenuItem>编辑</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">删除</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <div className="p-4 text-xs space-y-1 text-muted-foreground bg-muted/30">
                      <p>• 表头: font-semibold bg-muted/50</p>
                      <p>• 单元格文字: text-sm (14px)</p>
                      <p>• 重要字段(订单号): font-medium font-mono</p>
                      <p>• 金额字段: font-medium 右对齐</p>
                      <p>• 时间字段: text-muted-foreground</p>
                      <p>• 行高: 52px (py-3)</p>
                    </div>
                  </div>
                </div>

                {/* 分页 */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">5. 分页组件</h3>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        显示 1-10 条，共 156 条记录
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled>上一页</Button>
                        <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
                        <Button variant="outline" size="sm">2</Button>
                        <Button variant="outline" size="sm">3</Button>
                        <span className="px-2">...</span>
                        <Button variant="outline" size="sm">16</Button>
                        <Button variant="outline" size="sm">下一页</Button>
                      </div>
                    </div>
                    <div className="mt-4 text-xs space-y-1 text-muted-foreground">
                      <p>• 分页按钮: size="sm" variant="outline"</p>
                      <p>• 当前页: bg-primary text-primary-foreground</p>
                      <p>• 统计文字: text-sm text-muted-foreground</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 详情页布局示例 */}
          <TabsContent value="detail" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>详情页标准布局</CardTitle>
                <CardDescription>参考 PO 详情页的标准设计</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 页面头部 */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">1. 页面头部</h3>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon">
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                          <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">PO202403150001</h1>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">已确认</Badge>
                            <Badge variant="outline" className="bg-purple-50 text-purple-600">已发货</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Building className="h-3 w-3" />
                            <span>供应商: ABC Suppliers Inc.</span>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>创建时间: 2024-01-15</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          编辑
                        </Button>
                        <Button variant="outline" size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          发送
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          下载
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 text-xs space-y-1 text-muted-foreground">
                      <p>• 主标题: text-2xl font-bold (24px)</p>
                      <p>• 状态徽章: 紧跟标题，使用语义化颜色</p>
                      <p>• 元信息: text-sm text-muted-foreground，图标 12x12px</p>
                      <p>• 操作按钮: size="sm" 统一高度 32px</p>
                    </div>
                  </div>
                </div>

                {/* 信息卡片区 */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">2. 信息卡片区 (4列布局)</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-600" />
                          订单信息
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                          <div className="text-xs text-muted-foreground mb-1">PO编号</div>
                          <div className="font-bold text-sm font-mono text-blue-800">PO202403150001</div>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">参考编号:</span>
                            <span className="font-mono">REF202403150001</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">创建时间:</span>
                            <span>2024-01-15</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Building className="h-4 w-4 text-green-600" />
                          供应商信息
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                          <div className="font-bold text-green-800 text-sm">ABC Suppliers Inc.</div>
                          <div className="text-xs text-green-600">编码: SUP001</div>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="font-medium">联系人: John Smith</div>
                          <div className="text-muted-foreground">+1-555-0123</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-purple-600" />
                          地址信息
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="text-xs font-medium mb-1">收货地址</div>
                          <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                            <div className="font-medium text-sm">Main Warehouse</div>
                            <div className="text-xs text-muted-foreground">Los Angeles, CA</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <User className="h-4 w-4 text-indigo-600" />
                          统计信息
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-blue-50 p-2 rounded border border-blue-200">
                            <div className="text-muted-foreground">总数量</div>
                            <div className="font-bold text-blue-600">500</div>
                          </div>
                          <div className="bg-green-50 p-2 rounded border border-green-200">
                            <div className="text-muted-foreground">已收货</div>
                            <div className="font-bold text-green-600">50</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="mt-4 text-xs space-y-1 text-muted-foreground border rounded-lg p-4 bg-muted/30">
                    <p>• 卡片标题: text-sm font-semibold，图标 16x16px</p>
                    <p>• 突出信息: 使用彩色背景卡片 (bg-blue-50, bg-green-50等)</p>
                    <p>• 标签文字: text-xs text-muted-foreground</p>
                    <p>• 数值文字: font-bold text-sm</p>
                    <p>• 卡片间距: gap-4 (16px)</p>
                  </div>
                </div>

                {/* 标签页内容区 */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">3. 标签页内容区</h3>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <Tabs defaultValue="lines">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="lines">商品明细</TabsTrigger>
                        <TabsTrigger value="shipments">发货记录</TabsTrigger>
                        <TabsTrigger value="receipts">收货记录</TabsTrigger>
                        <TabsTrigger value="rtv">退货记录</TabsTrigger>
                      </TabsList>
                      <TabsContent value="lines" className="mt-4">
                        <div className="text-sm text-muted-foreground">商品明细表格内容...</div>
                      </TabsContent>
                    </Tabs>
                    <div className="mt-4 text-xs space-y-1 text-muted-foreground">
                      <p>• 标签页: 使用 grid 布局平均分配</p>
                      <p>• 标签文字: text-sm font-medium</p>
                      <p>• 内容区: mt-4 (16px 上边距)</p>
                    </div>
                  </div>
                </div>

                {/* 表格详情 */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">4. 详情表格</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="w-[60px] text-center font-semibold">行号</TableHead>
                          <TableHead className="min-w-[200px] font-semibold">商品信息</TableHead>
                          <TableHead className="w-[100px] text-center font-semibold">数量</TableHead>
                          <TableHead className="w-[120px] text-right font-semibold">单价</TableHead>
                          <TableHead className="w-[120px] text-right font-semibold">金额</TableHead>
                          <TableHead className="w-[80px] text-center font-semibold">状态</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-xs font-mono">01</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-sm">iPhone 15 Pro</div>
                              <div className="text-xs text-muted-foreground">
                                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">SKU: SKU001</span>
                              </div>
                              <div className="text-xs text-muted-foreground">256GB, Natural Titanium</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-medium">100</div>
                          </TableCell>
                          <TableCell className="text-right font-mono">USD 50.00</TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm font-medium bg-blue-50 rounded px-2 py-1">
                              USD 5,000.00
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              已关闭
                            </Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <div className="p-4 text-xs space-y-1 text-muted-foreground bg-muted/30">
                      <p>• 行号: Badge variant="outline" font-mono</p>
                      <p>• 商品名称: font-medium text-sm</p>
                      <p>• SKU: bg-gray-100 px-2 py-0.5 rounded font-mono</p>
                      <p>• 规格说明: text-xs text-muted-foreground</p>
                      <p>• 金额: font-medium bg-blue-50 突出显示</p>
                      <p>• 状态: 使用语义化颜色徽章</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 设计规范说明 */}
          <TabsContent value="specs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>设计规范总结</CardTitle>
                <CardDescription>字号、颜色、间距等标准规范</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 字号规范 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">字号规范</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">页面标题</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>主标题 (H1)</span>
                          <code className="bg-muted px-2 py-1 rounded">text-2xl (24px)</code>
                        </div>
                        <div className="flex justify-between">
                          <span>副标题 (H2)</span>
                          <code className="bg-muted px-2 py-1 rounded">text-xl (20px)</code>
                        </div>
                        <div className="flex justify-between">
                          <span>区块标题 (H3)</span>
                          <code className="bg-muted px-2 py-1 rounded">text-lg (18px)</code>
                        </div>
                        <div className="flex justify-between">
                          <span>卡片标题</span>
                          <code className="bg-muted px-2 py-1 rounded">text-sm (14px)</code>
                        </div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">正文内容</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>正文文字</span>
                          <code className="bg-muted px-2 py-1 rounded">text-sm (14px)</code>
                        </div>
                        <div className="flex justify-between">
                          <span>说明文字</span>
                          <code className="bg-muted px-2 py-1 rounded">text-xs (12px)</code>
                        </div>
                        <div className="flex justify-between">
                          <span>表格内容</span>
                          <code className="bg-muted px-2 py-1 rounded">text-sm (14px)</code>
                        </div>
                        <div className="flex justify-between">
                          <span>按钮文字</span>
                          <code className="bg-muted px-2 py-1 rounded">text-sm (14px)</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 颜色规范 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">颜色规范</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">文字颜色</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-[#181818]"></div>
                          <span>主要文字: #181818</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-[#666666]"></div>
                          <span>次要文字: #666666</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-[#999999]"></div>
                          <span>辅助文字: #999999</span>
                        </div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">状态颜色</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-green-600"></div>
                          <span>成功: #15803D</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-yellow-600"></div>
                          <span>警告: #e79f04</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-red-600"></div>
                          <span>错误: #F0283C</span>
                        </div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">主题颜色</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-[#753BBD]"></div>
                          <span>主色: #753BBD</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-[#9561D0]"></div>
                          <span>悬停: #9561D0</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-[#F97316]"></div>
                          <span>强调: #F97316</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 间距规范 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">间距规范</h3>
                  <div className="border rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium mb-2">组件内间距</div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>• 卡片内边距: p-4 (16px)</div>
                          <div>• 元素间距: gap-2 (8px)</div>
                          <div>• 区块间距: space-y-4 (16px)</div>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium mb-2">页面布局</div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>• 页面边距: p-6 (24px)</div>
                          <div>• 区块间距: space-y-6 (24px)</div>
                          <div>• 卡片间距: gap-4 (16px)</div>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium mb-2">表格</div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>• 单元格: px-4 py-3</div>
                          <div>• 行高: 52px</div>
                          <div>• 表头: font-semibold</div>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium mb-2">按钮</div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>• 小按钮: h-8 (32px)</div>
                          <div>• 默认: h-10 (40px)</div>
                          <div>• 大按钮: h-11 (44px)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 组件规范 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">组件使用规范</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">徽章 (Badge)</h4>
                      <div className="space-y-2 text-sm">
                        <div>• 状态徽章使用语义化颜色</div>
                        <div>• 成功: bg-green-100 text-green-800</div>
                        <div>• 警告: bg-yellow-100 text-yellow-800</div>
                        <div>• 错误: bg-red-100 text-red-800</div>
                        <div>• 信息: bg-blue-100 text-blue-800</div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">卡片 (Card)</h4>
                      <div className="space-y-2 text-sm">
                        <div>• 标题: text-sm font-semibold</div>
                        <div>• 描述: text-xs text-muted-foreground</div>
                        <div>• 内边距: p-4 (16px)</div>
                        <div>• 圆角: rounded-lg</div>
                      </div>
                    </div>
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
