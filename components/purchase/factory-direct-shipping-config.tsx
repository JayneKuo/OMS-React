"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowRight, Building, MapPin, Package, Warehouse } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FactoryDirectConfig {
  viaFinishedGoodsWarehouse: boolean
  factoryId: string
  factoryName: string
  finishedGoodsWarehouseId?: string
  finishedGoodsWarehouseName?: string
  finalDestinationId: string
  finalDestinationType: "CUSTOMER" | "STORE" | "WAREHOUSE"
  finalDestinationName: string
}

interface FactoryDirectShippingConfigProps {
  value: FactoryDirectConfig
  onChangeAction: (config: FactoryDirectConfig) => void
}

// Mock data
const mockFactories = [
  { id: "FAC001", name: "深圳工厂", address: "深圳市宝安区" },
  { id: "FAC002", name: "东莞工厂", address: "东莞市长安镇" },
  { id: "FAC003", name: "惠州工厂", address: "惠州市惠阳区" },
]

const mockFinishedGoodsWarehouses = [
  { id: "FG001", name: "深圳成品库", address: "深圳市龙华区" },
  { id: "FG002", name: "广州成品库", address: "广州市白云区" },
  { id: "FG003", name: "东莞成品库", address: "东莞市虎门镇" },
]

const mockCustomers = [
  { id: "CUS001", name: "客户A", address: "北京市朝阳区" },
  { id: "CUS002", name: "客户B", address: "上海市浦东新区" },
  { id: "CUS003", name: "客户C", address: "广州市天河区" },
]

const mockStores = [
  { id: "STO001", name: "北京旗舰店", address: "北京市朝阳区" },
  { id: "STO002", name: "上海体验店", address: "上海市黄浦区" },
  { id: "STO003", name: "深圳门店", address: "深圳市福田区" },
]

const mockWarehouses = [
  { id: "WH001", name: "北京仓库", address: "北京市大兴区" },
  { id: "WH002", name: "上海仓库", address: "上海市嘉定区" },
  { id: "WH003", name: "广州仓库", address: "广州市番禺区" },
]

export function FactoryDirectShippingConfig({ value, onChangeAction }: FactoryDirectShippingConfigProps) {
  const handlePathTypeChange = (viaFG: boolean) => {
    onChangeAction({
      ...value,
      viaFinishedGoodsWarehouse: viaFG,
      finishedGoodsWarehouseId: viaFG ? value.finishedGoodsWarehouseId : undefined,
      finishedGoodsWarehouseName: viaFG ? value.finishedGoodsWarehouseName : undefined,
    })
  }

  const handleFactoryChange = (factoryId: string) => {
    const factory = mockFactories.find(f => f.id === factoryId)
    if (factory) {
      onChangeAction({
        ...value,
        factoryId: factory.id,
        factoryName: factory.name,
      })
    }
  }

  const handleFGWarehouseChange = (warehouseId: string) => {
    const warehouse = mockFinishedGoodsWarehouses.find(w => w.id === warehouseId)
    if (warehouse) {
      onChangeAction({
        ...value,
        finishedGoodsWarehouseId: warehouse.id,
        finishedGoodsWarehouseName: warehouse.name,
      })
    }
  }

  const handleDestinationTypeChange = (type: "CUSTOMER" | "STORE" | "WAREHOUSE") => {
    onChangeAction({
      ...value,
      finalDestinationType: type,
      finalDestinationId: "",
      finalDestinationName: "",
    })
  }

  const handleDestinationChange = (destinationId: string) => {
    let destination
    switch (value.finalDestinationType) {
      case "CUSTOMER":
        destination = mockCustomers.find(c => c.id === destinationId)
        break
      case "STORE":
        destination = mockStores.find(s => s.id === destinationId)
        break
      case "WAREHOUSE":
        destination = mockWarehouses.find(w => w.id === destinationId)
        break
    }
    
    if (destination) {
      onChangeAction({
        ...value,
        finalDestinationId: destination.id,
        finalDestinationName: destination.name,
      })
    }
  }

  const getDestinationOptions = () => {
    switch (value.finalDestinationType) {
      case "CUSTOMER":
        return mockCustomers
      case "STORE":
        return mockStores
      case "WAREHOUSE":
        return mockWarehouses
      default:
        return []
    }
  }

  return (
    <div className="space-y-6">
      {/* 工厂选择 */}
      <div>
        <Label className="text-sm font-medium">工厂 *</Label>
        <Select value={value.factoryId} onValueChange={handleFactoryChange}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="选择工厂" />
          </SelectTrigger>
          <SelectContent>
            {mockFactories.map(factory => (
              <SelectItem key={factory.id} value={factory.id}>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{factory.name}</div>
                    <div className="text-xs text-muted-foreground">{factory.address}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 物流路径选择 */}
      <div>
        <Label className="text-sm font-medium mb-3 block">物流路径 *</Label>
        <div className="space-y-3">
          {/* 选项1：经成品库 */}
          <div
            onClick={() => handlePathTypeChange(true)}
            className={cn(
              "border-2 rounded-lg p-4 cursor-pointer transition-all",
              value.viaFinishedGoodsWarehouse
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/50"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                value.viaFinishedGoodsWarehouse ? "border-primary" : "border-muted-foreground"
              )}>
                {value.viaFinishedGoodsWarehouse && (
                  <div className="h-3 w-3 rounded-full bg-primary" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">经成品库</div>
                <div className="text-xs text-muted-foreground mt-1">
                  货物先入库到成品库，再出库发往目的地（适合需要质检或分拣的商品）
                </div>
              </div>
            </div>

            {value.viaFinishedGoodsWarehouse && (
              <div className="mt-4 pl-8 space-y-4">
                <div>
                  <Label className="text-sm">成品库 *</Label>
                  <Select 
                    value={value.finishedGoodsWarehouseId} 
                    onValueChange={handleFGWarehouseChange}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="选择成品库" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockFinishedGoodsWarehouses.map(warehouse => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          <div className="flex items-center gap-2">
                            <Warehouse className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{warehouse.name}</div>
                              <div className="text-xs text-muted-foreground">{warehouse.address}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* 选项2：直接发货 */}
          <div
            onClick={() => handlePathTypeChange(false)}
            className={cn(
              "border-2 rounded-lg p-4 cursor-pointer transition-all",
              !value.viaFinishedGoodsWarehouse
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/50"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                !value.viaFinishedGoodsWarehouse ? "border-primary" : "border-muted-foreground"
              )}>
                {!value.viaFinishedGoodsWarehouse && (
                  <div className="h-3 w-3 rounded-full bg-primary" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">直接发货</div>
                <div className="text-xs text-muted-foreground mt-1">
                  货物直接从工厂发往目的地（适合紧急订单或已质检商品）
                </div>
              </div>
            </div>

            {!value.viaFinishedGoodsWarehouse && (
              <div className="mt-4 pl-8">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-yellow-800 dark:text-yellow-200">
                      <p className="font-medium">直接发货模式</p>
                      <p className="mt-1">系统会自动创建虚拟出库单用于财务记账</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 目的地配置 */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">目的地类型 *</Label>
          <Select 
            value={value.finalDestinationType} 
            onValueChange={handleDestinationTypeChange}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="选择目的地类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CUSTOMER">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  客户
                </div>
              </SelectItem>
              <SelectItem value="STORE">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  门店
                </div>
              </SelectItem>
              <SelectItem value="WAREHOUSE">
                <div className="flex items-center gap-2">
                  <Warehouse className="h-4 w-4" />
                  仓库
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">目的地 *</Label>
          <Select 
            value={value.finalDestinationId} 
            onValueChange={handleDestinationChange}
            disabled={!value.finalDestinationType}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="选择目的地" />
            </SelectTrigger>
            <SelectContent>
              {getDestinationOptions().map(destination => (
                <SelectItem key={destination.id} value={destination.id}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{destination.name}</div>
                      <div className="text-xs text-muted-foreground">{destination.address}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 流程预览 */}
      {value.factoryName && value.finalDestinationName && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
          <div className="text-sm font-medium mb-3">物流流程预览</div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="gap-1">
              <Building className="h-3 w-3" />
              {value.factoryName}
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            {value.viaFinishedGoodsWarehouse && value.finishedGoodsWarehouseName && (
              <>
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 gap-1">
                  <Warehouse className="h-3 w-3" />
                  {value.finishedGoodsWarehouseName}
                </Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </>
            )}
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 gap-1">
              <MapPin className="h-3 w-3" />
              {value.finalDestinationName}
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}
