import type { MappingOptions, OmsProductMapping, OmsProductOption, WarehouseTargetOption } from "@/lib/automation/mapping/types"

export const omsProductOptions: OmsProductOption[] = [
  {
    id: "OMS-PROD-1001",
    code: "BAG-CLASSIC-001",
    name: "Classic Leather Bag",
  },
  {
    id: "OMS-PROD-1002",
    code: "DRESS-FLORAL-002",
    name: "Floral Cotton Dress",
  },
  {
    id: "OMS-PROD-1003",
    code: "TSHIRT-BASIC-003",
    name: "Basic Tee",
  },
  {
    id: "OMS-PROD-1004",
    code: "SNEAKER-LITE-004",
    name: "Lightweight Sneaker",
  },
  {
    id: "OMS-PROD-1005",
    code: "CAP-SPORT-005",
    name: "Sport Cap",
  },
]

export const warehouseTargetOptions: WarehouseTargetOption[] = [
  {
    id: "warehouse-target-1",
    warehouse: "US-West",
    warehouseSku: "UNIS-BAG-BLK-001",
    itemMasterId: "ITEM-90001",
    itemCode: "IM-10001",
    itemName: "Classic Leather Bag - Black",
  },
  {
    id: "warehouse-target-2",
    warehouse: "US-West",
    warehouseSku: "UNIS-BAG-BRN-002",
    itemMasterId: "ITEM-90002",
    itemCode: "IM-10002",
    itemName: "Classic Leather Bag - Brown",
  },
  {
    id: "warehouse-target-3",
    warehouse: "EU-Central",
    warehouseSku: "UNIS-DRESS-WHT-S",
    itemMasterId: "ITEM-90003",
    itemCode: "IM-10003",
    itemName: "Floral Cotton Dress - White S",
  },
  {
    id: "warehouse-target-4",
    warehouse: "East-Hub",
    warehouseSku: "NEXUS-TSHIRT-BLK-M",
    itemMasterId: "ITEM-90004",
    itemCode: "IM-10004",
    itemName: "Basic Tee - Black M",
  },
]

export const mappingOptions: MappingOptions = {
  omsProducts: omsProductOptions,
  channels: ["Amazon US", "Shopify", "Shein", "TikTok Shop"],
  stores: ["US Flagship", "DTC Store", "Marketplace Store", "EU Outlet"],
  warehouses: ["US-West", "EU-Central", "East-Hub"],
  warehouseTargets: warehouseTargetOptions,
  authorizedStores: {
    "Amazon US": ["US Flagship", "Marketplace Store"],
    "Shopify": ["DTC Store"],
    "TikTok Shop": ["DTC Store", "EU Outlet"],
  },
}

export const initialMappings: OmsProductMapping[] = [
  {
    id: "oms-map-1",
    omsProductId: "OMS-PROD-1001",
    omsProductCode: "BAG-CLASSIC-001",
    omsProductName: "Classic Leather Bag",
    notes: "Primary bag mapping for US channels.",
    channelMappings: [
      {
        id: "channel-map-1",
        channel: "Amazon US",
        store: "US Flagship",
        channelSkus: ["AMZ-BLK-001", "AMZ-BRN-001"],
        enabled: true,
      },
      {
        id: "channel-map-2",
        channel: "Shopify",
        store: "DTC Store",
        channelSkus: ["SHOP-BLK-001"],
        enabled: true,
      },
    ],
    warehouseMappings: [
      {
        id: "wh-map-1",
        warehouse: "US-West",
        warehouseSku: "UNIS-BAG-BLK-001",
        itemMasterId: "ITEM-90001",
        itemCode: "IM-10001",
        itemName: "Classic Leather Bag - Black",
        enabled: true,
      },
      {
        id: "wh-map-2",
        warehouse: "EU-Central",
        warehouseSku: "UNIS-BAG-BRN-002",
        itemMasterId: "ITEM-90002",
        itemCode: "IM-10002",
        itemName: "Classic Leather Bag - Brown",
        enabled: true,
      },
    ],
    updatedAt: "2026-04-19 09:15",
    updatedBy: "Olivia",
    status: "complete",
    issues: [],
    changeHistory: [
      {
        id: "chg-1-1",
        timestamp: "2026-04-10 14:22",
        operator: "Sophia",
        action: "created",
        entries: [{ field: "mapping", action: "created", description: "Created mapping for BAG-CLASSIC-001" }],
      },
      {
        id: "chg-1-2",
        timestamp: "2026-04-15 10:05",
        operator: "Sophia",
        action: "updated",
        entries: [
          { field: "channel", action: "added", description: "Added channel mapping: Shopify · DTC Store" },
          { field: "warehouse", action: "added", description: "Added warehouse mapping: EU-Central · UNIS-BAG-BRN-002" },
        ],
      },
      {
        id: "chg-1-3",
        timestamp: "2026-04-19 09:15",
        operator: "Olivia",
        action: "updated",
        entries: [{ field: "notes", action: "modified", description: "Updated notes" }],
      },
    ],
  },
  {
    id: "oms-map-2",
    omsProductId: "OMS-PROD-1002",
    omsProductCode: "DRESS-FLORAL-002",
    omsProductName: "Floral Cotton Dress",
    notes: "Waiting for EU warehouse assignment.",
    channelMappings: [
      {
        id: "channel-map-3",
        channel: "Shein",
        store: "Marketplace Store",
        channelSkus: ["SHEIN-DRESS-S"],
        enabled: true,
      },
    ],
    warehouseMappings: [],
    updatedAt: "2026-04-19 14:40",
    updatedBy: "Sophia",
    status: "partial",
    issues: [],
    changeHistory: [
      {
        id: "chg-2-1",
        timestamp: "2026-04-18 11:30",
        operator: "Sophia",
        action: "created",
        entries: [{ field: "mapping", action: "created", description: "Created mapping for DRESS-FLORAL-002" }],
      },
      {
        id: "chg-2-2",
        timestamp: "2026-04-19 14:40",
        operator: "Sophia",
        action: "updated",
        entries: [
          { field: "channel", action: "added", description: "Added channel mapping: Shein · Marketplace Store" },
          { field: "notes", action: "modified", description: "Updated notes" },
        ],
      },
    ],
  },
  {
    id: "oms-map-3",
    omsProductId: "OMS-PROD-1004",
    omsProductCode: "SNEAKER-LITE-004",
    omsProductName: "Lightweight Sneaker",
    notes: "Product created in OMS, channel and warehouse bindings pending.",
    channelMappings: [],
    warehouseMappings: [],
    updatedAt: "2026-04-20 08:05",
    updatedBy: "Jayne",
    status: "unmapped",
    issues: [],
    changeHistory: [
      {
        id: "chg-3-1",
        timestamp: "2026-04-20 08:05",
        operator: "Jayne",
        action: "created",
        entries: [{ field: "mapping", action: "created", description: "Created mapping for SNEAKER-LITE-004" }],
      },
    ],
  },
  {
    id: "oms-map-4",
    omsProductId: "OMS-PROD-1003",
    omsProductCode: "TSHIRT-BASIC-003",
    omsProductName: "Basic Tee",
    notes: "Needs channel ownership cleanup before rollout.",
    channelMappings: [
      {
        id: "channel-map-4",
        channel: "Amazon US",
        store: "US Flagship",
        channelSkus: ["AMZ-BLK-001"],
        enabled: true,
      },
    ],
    warehouseMappings: [
      {
        id: "wh-map-4",
        warehouse: "East-Hub",
        warehouseSku: "NEXUS-TSHIRT-BLK-M",
        itemMasterId: "ITEM-90004",
        itemCode: "IM-10004",
        itemName: "Basic Tee - Black M",
        enabled: true,
      },
    ],
    updatedAt: "2026-04-20 10:20",
    updatedBy: "Mia",
    status: "invalid",
    issues: [],
    changeHistory: [
      {
        id: "chg-4-1",
        timestamp: "2026-04-17 16:00",
        operator: "Mia",
        action: "created",
        entries: [{ field: "mapping", action: "created", description: "Created mapping for TSHIRT-BASIC-003" }],
      },
      {
        id: "chg-4-2",
        timestamp: "2026-04-20 10:20",
        operator: "Mia",
        action: "updated",
        entries: [
          { field: "channel", action: "added", description: "Added channel mapping: Amazon US · US Flagship" },
          { field: "warehouse", action: "added", description: "Added warehouse mapping: East-Hub · NEXUS-TSHIRT-BLK-M" },
        ],
      },
    ],
  },
]
