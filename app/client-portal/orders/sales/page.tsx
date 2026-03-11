"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { OrderListTable, Order } from "@/components/client-portal/order-list-table"
import { FileText, Package, Users, TrendingUp } from "lucide-react"

const ORDERS: Order[] = [
  // ── Amazon B2B ──────────────────────────────────────────────────────────────
  {
    id: "1", orderNo: "SAL-2025030101", poNo: "AMZ-PO-7731092", externalOrderNo: "114-3941689-8772200",
    channel: "amazon", customer: "Amazon FBA", retailer: "Amazon US",
    createdAt: "2025-03-01", requiredShipDate: "2025-03-05", requiredDeliveryDate: "2025-03-10",
    shipToAddress: { name: "Amazon FBA ONT8", city: "San Bernardino", state: "CA", zip: "92408", country: "US" },
    skuCount: 2, itemCount: 180, totalAmount: "27,000.00", currency: "USD",
    status: "warehouse_processing",
    items: [
      { sku: "SKU-B001", name: "Smart Watch Band", qty: 100, unitPrice: 89.99, currency: "USD" },
      { sku: "SKU-B002", name: "Screen Protector Kit", qty: 80, unitPrice: 49.99, currency: "USD" },
    ],
    shipments: [
      { id: "s2", warehouseCode: "WH-NJ", warehouseName: "NJ Warehouse", status: "packed", outboundOrderNo: "OB-20250305-0044", itemCount: 120, requiredShipDate: "2025-03-04", palletCount: 4, createdAt: "2025-03-01", shipFrom: { name: "NJ Warehouse", city: "Edison", state: "NJ" }, shipTo: { name: "Amazon FBA ONT8", city: "San Bernardino", state: "CA" }, lotNumbers: ["LOT-2025A-001", "LOT-2025A-002"] },
      { id: "s3", warehouseCode: "WH-TX", warehouseName: "TX Warehouse", status: "picking", outboundOrderNo: "OB-20250305-0045", itemCount: 60, requiredShipDate: "2025-03-06", palletCount: 2, createdAt: "2025-03-01", shipFrom: { name: "TX Warehouse", city: "Dallas", state: "TX" }, shipTo: { name: "Amazon FBA ONT8", city: "San Bernardino", state: "CA" } },
    ],
  },
  {
    id: "4", orderNo: "SAL-2025030104", poNo: "AMZ-PO-7698341", externalOrderNo: "114-2288901-5543100",
    channel: "amazon", customer: "Amazon FBA", retailer: "Amazon US",
    refOrderNo: "RMA-20250220-001",
    createdAt: "2025-02-20", requiredShipDate: "2025-02-26", requiredDeliveryDate: "2025-03-03",
    shipToAddress: { name: "Amazon FBA EWR4", city: "Robbinsville", state: "NJ", zip: "08691", country: "US" },
    skuCount: 1, itemCount: 120, totalAmount: "19,200.00", currency: "USD",
    status: "shipped", tags: ["dc_rejected"],
    items: [{ sku: "SKU-D001", name: "Smart Home Hub", qty: 120, unitPrice: 160.00, currency: "USD" }],
    shipments: [
      {
        id: "s6", warehouseCode: "WH-NJ", warehouseName: "NJ Warehouse", status: "shipped",
        outboundOrderNo: "OB-20250226-0008", asnNo: "ASN-2025022601",
        trackingNo: "9400111899223450231", carrier: "USPS", itemCount: 120, shippedAt: "2025-02-26",
        palletCount: 4, bolNo: "BOL-20250226-NJ01",
        shipFrom: { name: "NJ Warehouse", city: "Edison", state: "NJ" },
        serialNumbers: { total: 120, sample: ["SN-HUB-00001", "SN-HUB-00002", "SN-HUB-00120"] },
        dcNote: "Rejected: FNSKU label missing. Return in progress — relabel and reship required.",
      },
    ],
  },
  {
    id: "6", orderNo: "SAL-2025030106", poNo: "AMZ-PO-7601882", externalOrderNo: "114-7766543-9981200",
    channel: "amazon", customer: "Amazon FBA", retailer: "Amazon US",
    refOrderNo: "PO-AMZ-2025-0066",
    createdAt: "2025-02-22", requiredShipDate: "2025-02-28", requiredDeliveryDate: "2025-03-05",
    shipToAddress: { name: "Amazon FBA LAX9", city: "Perris", state: "CA", zip: "92571", country: "US" },
    skuCount: 2, itemCount: 300, totalAmount: "45,000.00", currency: "USD",
    status: "shipped",
    items: [
      { sku: "SKU-F001", name: "Portable Projector", qty: 150, unitPrice: 99.99, currency: "USD" },
      { sku: "SKU-F002", name: "HDMI Cable 4K", qty: 150, unitPrice: 49.99, currency: "USD" },
    ],
    shipments: [
      {
        id: "s10", warehouseCode: "WH-LA", warehouseName: "LA Warehouse", status: "dc_confirmed",
        outboundOrderNo: "OB-20250228-0001", asnNo: "ASN-2025022801",
        trackingNo: "1Z999AA10123456780", carrier: "UPS", itemCount: 300,
        shippedAt: "2025-02-28", dcConfirmedAt: "2025-03-03", dcReceivedQty: 300,
        palletCount: 10, bolNo: "BOL-20250228-LA01", proNo: "PRO-443210",
        shipFrom: { name: "LA Warehouse", city: "City of Industry", state: "CA" },
      },
    ],
  },
  {
    id: "8", orderNo: "SAL-2025030108", poNo: "AMZ-PO-7812345", externalOrderNo: "114-9912345-1234500",
    channel: "amazon", customer: "Amazon FBA", retailer: "Amazon US",
    createdAt: "2025-03-05", requiredShipDate: "2025-03-14",
    shipToAddress: { name: "Amazon FBA PHX7", city: "Phoenix", state: "AZ", zip: "85043", country: "US" },
    skuCount: 2, itemCount: 160, totalAmount: "22,400.00", currency: "USD",
    status: "allocated",
    items: [
      { sku: "SKU-H001", name: "Wireless Charger Pad", qty: 80, unitPrice: 79.99, currency: "USD" },
      { sku: "SKU-H002", name: "Car Mount Pro", qty: 80, unitPrice: 59.99, currency: "USD" },
    ],
    shipments: [],
  },

  // ── Walmart B2B ─────────────────────────────────────────────────────────────
  {
    id: "2", orderNo: "SAL-2025030102", poNo: "WMT-PO-4492817", externalOrderNo: "WMT-ORD-88291034",
    channel: "walmart", customer: "Walmart US", retailer: "Walmart US",
    refOrderNo: "PO-WMT-2025-0102",
    channelNote: "Must ship with GTIN labels. No substitutions allowed.",
    createdAt: "2025-02-28", requiredShipDate: "2025-03-03", requiredDeliveryDate: "2025-03-08",
    shipToAddress: { name: "Walmart DC #6097", city: "Bentonville", state: "AR", zip: "72712", country: "US" },
    skuCount: 3, itemCount: 240, totalAmount: "38,400.00", currency: "USD",
    status: "warehouse_processing", tags: ["overdue"], overdueShipDays: 2,
    items: [
      { sku: "SKU-A001", name: "Wireless Earbuds Pro", qty: 120, unitPrice: 89.99, currency: "USD" },
      { sku: "SKU-A002", name: "Phone Case Premium", qty: 80, unitPrice: 24.99, currency: "USD" },
      { sku: "SKU-A003", name: "USB-C Cable 2m", qty: 40, unitPrice: 12.99, currency: "USD" },
    ],
    shipments: [
      { id: "s1", warehouseCode: "WH-LA", warehouseName: "LA Warehouse", status: "picking", outboundOrderNo: "OB-20250303-0091", itemCount: 240, palletCount: 8, createdAt: "2025-02-28", shipFrom: { name: "LA Warehouse", city: "City of Industry", state: "CA" }, shipTo: { name: "Walmart DC #6097", city: "Bentonville", state: "AR" } },
    ],
  },
  {
    id: "3", orderNo: "SAL-2025030103", poNo: "WMT-PO-4401293", externalOrderNo: "WMT-ORD-87120456",
    channel: "walmart", customer: "Walmart US", retailer: "Walmart US",
    refOrderNo: "PO-WMT-2025-0093",
    createdAt: "2025-02-25", requiredShipDate: "2025-03-01", requiredDeliveryDate: "2025-03-06",
    shipToAddress: { name: "Walmart DC #7023", city: "Lavonia", state: "GA", zip: "30553", country: "US" },
    skuCount: 4, itemCount: 500, totalAmount: "72,500.00", currency: "USD",
    status: "shipped", tags: ["dc_sync_fail"],
    items: [
      { sku: "SKU-C001", name: "Bluetooth Speaker", qty: 150, unitPrice: 59.99, currency: "USD" },
      { sku: "SKU-C002", name: "Power Bank 20000mAh", qty: 150, unitPrice: 49.99, currency: "USD" },
      { sku: "SKU-C003", name: "Laptop Stand", qty: 100, unitPrice: 39.99, currency: "USD" },
      { sku: "SKU-C004", name: "Mouse Pad XL", qty: 100, unitPrice: 19.99, currency: "USD" },
    ],
    shipments: [
      {
        id: "s4", warehouseCode: "WH-LA", warehouseName: "LA Warehouse", status: "shipped",
        outboundOrderNo: "OB-20250301-0012", asnNo: "ASN-2025030101",
        trackingNo: "1Z999AA10123456784", carrier: "UPS", itemCount: 300, shippedAt: "2025-03-01",
        requiredShipDate: "2025-02-28", palletCount: 10, bolNo: "BOL-20250301-LA01", proNo: "PRO-556789",
        shipFrom: { name: "LA Warehouse", city: "City of Industry", state: "CA" },
        shipTo: { name: "Walmart DC #7023", city: "Lavonia", state: "GA" },
        lotNumbers: ["LOT-WMT-2025-A1", "LOT-WMT-2025-A2", "LOT-WMT-2025-A3", "LOT-WMT-2025-A4"],
        dcNote: "EDI 856 timeout — ASN not received by Walmart. Please resubmit.",
      },
      {
        id: "s5", warehouseCode: "WH-TX", warehouseName: "TX Warehouse", status: "dc_confirmed",
        outboundOrderNo: "OB-20250301-0013", asnNo: "ASN-2025030102",
        trackingNo: "1Z999AA10123456785", carrier: "UPS", itemCount: 200,
        shippedAt: "2025-03-01", dcConfirmedAt: "2025-03-04", dcReceivedQty: 200,
        requiredShipDate: "2025-03-01", palletCount: 6, bolNo: "BOL-20250301-TX01",
        shipFrom: { name: "TX Warehouse", city: "Dallas", state: "TX" },
        shipTo: { name: "Walmart DC #7023", city: "Lavonia", state: "GA" },
      },
    ],
  },
  {
    id: "5", orderNo: "SAL-2025030105", poNo: "WMT-PO-4512009", externalOrderNo: "WMT-ORD-89034521",
    channel: "walmart", customer: "Walmart Canada", retailer: "Walmart CA",
    createdAt: "2025-03-03", requiredShipDate: "2025-03-10", requiredDeliveryDate: "2025-03-15",
    shipToAddress: { name: "Walmart DC #9001", city: "Mississauga", state: "ON", zip: "L5N 1P9", country: "CA" },
    skuCount: 5, itemCount: 600, totalAmount: "84,000.00", currency: "USD",
    status: "shipped",
    items: [
      { sku: "SKU-E001", name: "Gaming Headset", qty: 150, unitPrice: 79.99, currency: "USD" },
      { sku: "SKU-E002", name: "Mechanical Keyboard", qty: 120, unitPrice: 129.99, currency: "USD" },
      { sku: "SKU-E003", name: "Gaming Mouse", qty: 120, unitPrice: 59.99, currency: "USD" },
      { sku: "SKU-E004", name: "Monitor Stand", qty: 110, unitPrice: 49.99, currency: "USD" },
      { sku: "SKU-E005", name: "Cable Management Kit", qty: 100, unitPrice: 19.99, currency: "USD" },
    ],
    shipments: [
      { id: "s7", warehouseCode: "WH-LA", warehouseName: "LA Warehouse", status: "in_transit", outboundOrderNo: "OB-20250304-0031", asnNo: "ASN-2025030401", trackingNo: "1Z999AA10123456790", carrier: "FedEx", itemCount: 250, shippedAt: "2025-03-04", estimatedDelivery: "2025-03-09", requiredShipDate: "2025-03-05", palletCount: 8, bolNo: "BOL-20250304-LA01", shipFrom: { name: "LA Warehouse", city: "City of Industry", state: "CA" }, shipTo: { name: "Walmart DC #9001", city: "Mississauga", state: "ON" } },
      { id: "s8", warehouseCode: "WH-TX", warehouseName: "TX Warehouse", status: "shipped", outboundOrderNo: "OB-20250304-0032", asnNo: "ASN-2025030402", trackingNo: "1Z999AA10123456791", carrier: "FedEx", itemCount: 200, shippedAt: "2025-03-04", requiredShipDate: "2025-03-07", palletCount: 6, bolNo: "BOL-20250304-TX01", shipFrom: { name: "TX Warehouse", city: "Dallas", state: "TX" }, shipTo: { name: "Walmart DC #9001", city: "Mississauga", state: "ON" }, lotNumbers: ["LOT-WCA-2025-B1", "LOT-WCA-2025-B2"] },
      { id: "s9", warehouseCode: "WH-NJ", warehouseName: "NJ Warehouse", status: "packed", outboundOrderNo: "OB-20250305-0011", itemCount: 150, requiredShipDate: "2025-03-08", palletCount: 5, shipFrom: { name: "NJ Warehouse", city: "Edison", state: "NJ" }, shipTo: { name: "Walmart DC #9001", city: "Mississauga", state: "ON" } },
    ],
  },
  {
    id: "7", orderNo: "SAL-2025030107", poNo: "WMT-PO-4521100", externalOrderNo: "WMT-ORD-89112200",
    channel: "walmart", customer: "Walmart US", retailer: "Walmart US",
    createdAt: "2025-03-05", requiredShipDate: "2025-03-12", requiredDeliveryDate: "2025-03-18",
    shipToAddress: { name: "Walmart DC #6031", city: "Shelby", state: "NC", zip: "28150", country: "US" },
    skuCount: 6, itemCount: 400, totalAmount: "56,000.00", currency: "USD",
    status: "on_hold",
    items: [
      { sku: "SKU-G001", name: "Air Purifier", qty: 80, unitPrice: 89.99, currency: "USD" },
      { sku: "SKU-G002", name: "Humidifier", qty: 80, unitPrice: 59.99, currency: "USD" },
      { sku: "SKU-G003", name: "Desk Fan", qty: 60, unitPrice: 49.99, currency: "USD" },
      { sku: "SKU-G004", name: "Night Light", qty: 60, unitPrice: 19.99, currency: "USD" },
      { sku: "SKU-G005", name: "Extension Cord", qty: 60, unitPrice: 24.99, currency: "USD" },
      { sku: "SKU-G006", name: "Smart Plug 4-Pack", qty: 60, unitPrice: 34.99, currency: "USD" },
    ],
    shipments: [],
  },

  // ── Shopify DTC ─────────────────────────────────────────────────────────────
  {
    id: "s01", orderNo: "SHP-10045", externalOrderNo: "#10045",
    channel: "shopify", customer: "Sarah M.",
    createdAt: "2025-03-05", requiredShipDate: "2025-03-07",
    shipToAddress: { name: "Sarah M.", city: "Austin", state: "TX", zip: "78701", country: "US" },
    skuCount: 2, itemCount: 3, totalAmount: "189.97", currency: "USD",
    status: "warehouse_processing",
    items: [
      { sku: "SKU-A001", name: "Wireless Earbuds Pro", qty: 1, unitPrice: 89.99, currency: "USD" },
      { sku: "SKU-H001", name: "Wireless Charger Pad", qty: 2, unitPrice: 49.99, currency: "USD" },
    ],
    shipments: [
      { id: "ss1", warehouseCode: "WH-TX", warehouseName: "TX Warehouse", status: "picking", outboundOrderNo: "OB-20250305-1001", itemCount: 3, createdAt: "2025-03-05", shipFrom: { name: "TX Warehouse", city: "Dallas", state: "TX" } },
    ],
  },
  {
    id: "s02", orderNo: "SHP-10046", externalOrderNo: "#10046",
    channel: "shopify", customer: "James K.",
    createdAt: "2025-03-04", requiredShipDate: "2025-03-06",
    shipToAddress: { name: "James K.", city: "Seattle", state: "WA", zip: "98101", country: "US" },
    skuCount: 1, itemCount: 1, totalAmount: "129.99", currency: "USD",
    status: "shipped",
    items: [{ sku: "SKU-E002", name: "Mechanical Keyboard", qty: 1, unitPrice: 129.99, currency: "USD" }],
    shipments: [
      { id: "ss2", warehouseCode: "WH-LA", warehouseName: "LA Warehouse", status: "in_transit", outboundOrderNo: "OB-20250304-1002", trackingNo: "1Z999AA10123456800", carrier: "UPS", itemCount: 1, shippedAt: "2025-03-04", estimatedDelivery: "2025-03-07", shipFrom: { name: "LA Warehouse", city: "City of Industry", state: "CA" } },
    ],
  },

  // ── TikTok Shop ─────────────────────────────────────────────────────────────
  {
    id: "t01", orderNo: "TTK-887234", externalOrderNo: "TT-887234",
    channel: "tiktok", customer: "Emily R.", retailer: "TikTok Shop",
    sourceChannel: "TikTok US",
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString().slice(0, 10),
    // SLA: 48h from order creation — simulate ~10h left
    slaDeadline: new Date(Date.now() + 10 * 3600 * 1000).toISOString(),
    shipToAddress: { name: "Emily R.", city: "Miami", state: "FL", zip: "33101", country: "US" },
    skuCount: 1, itemCount: 2, totalAmount: "99.98", currency: "USD",
    status: "imported", tags: ["sla_risk"],
    items: [{ sku: "SKU-H002", name: "Car Mount Pro", qty: 2, unitPrice: 49.99, currency: "USD" }],
    shipments: [],
  },
  {
    id: "t02", orderNo: "TTK-887301", externalOrderNo: "TT-887301",
    channel: "tiktok", customer: "Marcus T.", retailer: "TikTok Shop",
    createdAt: "2025-03-05",
    slaDeadline: new Date(Date.now() + 30 * 3600 * 1000).toISOString(),
    shipToAddress: { name: "Marcus T.", city: "Chicago", state: "IL", zip: "60601", country: "US" },
    skuCount: 1, itemCount: 1, totalAmount: "59.99", currency: "USD",
    status: "warehouse_processing",
    items: [{ sku: "SKU-G003", name: "Desk Fan", qty: 1, unitPrice: 59.99, currency: "USD" }],
    shipments: [
      { id: "st1", warehouseCode: "WH-NJ", warehouseName: "NJ Warehouse", status: "picking", outboundOrderNo: "OB-20250305-2001", itemCount: 1, createdAt: "2025-03-05", shipFrom: { name: "NJ Warehouse", city: "Edison", state: "NJ" } },
    ],
  },
  {
    id: "t03", orderNo: "TTK-887099", externalOrderNo: "TT-887099",
    channel: "tiktok", customer: "Priya S.", retailer: "TikTok Shop",
    createdAt: "2025-03-04",
    slaDeadline: new Date(Date.now() + 52 * 3600 * 1000).toISOString(),
    shipToAddress: { name: "Priya S.", city: "Dallas", state: "TX", zip: "75201", country: "US" },
    skuCount: 2, itemCount: 3, totalAmount: "229.97", currency: "USD",
    status: "shipped",
    items: [
      { sku: "SKU-E001", name: "Gaming Headset", qty: 1, unitPrice: 79.99, currency: "USD" },
      { sku: "SKU-E003", name: "Gaming Mouse", qty: 2, unitPrice: 59.99, currency: "USD" },
    ],
    shipments: [
      { id: "st2", warehouseCode: "WH-TX", warehouseName: "TX Warehouse", status: "shipped", outboundOrderNo: "OB-20250304-2002", trackingNo: "9400111899223450999", carrier: "USPS", itemCount: 3, shippedAt: "2025-03-04", shipFrom: { name: "TX Warehouse", city: "Dallas", state: "TX" }, serialNumbers: { total: 3, sample: ["SN-HS-10001", "SN-MS-20001", "SN-MS-20002"] } },
    ],
  },

  // ── Shein ───────────────────────────────────────────────────────────────────
  {
    id: "sh01", orderNo: "SHN-20250305-001", poNo: "SHEIN-PO-9912", externalOrderNo: "SH-US-20250305-88901",
    channel: "shein", customer: "Shein Platform", retailer: "Shein",
    sourceChannel: "Shein US Marketplace",
    refOrderNo: "SHEIN-REF-20250305-001",
    channelNote: "Ship within 48h. Use Shein-approved packaging only.",
    createdAt: "2025-03-05",
    slaDeadline: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
    shipToAddress: { name: "Shein US Fulfillment", city: "Whitestown", state: "IN", zip: "46075", country: "US" },
    skuCount: 3, itemCount: 200, totalAmount: "8,600.00", currency: "USD",
    status: "allocated", tags: ["sla_risk"],
    items: [
      { sku: "SKU-G004", name: "Night Light", qty: 80, unitPrice: 19.99, currency: "USD" },
      { sku: "SKU-G005", name: "Extension Cord", qty: 70, unitPrice: 24.99, currency: "USD" },
      { sku: "SKU-G006", name: "Smart Plug 4-Pack", qty: 50, unitPrice: 34.99, currency: "USD" },
    ],
    shipments: [],
  },
  {
    id: "sh02", orderNo: "SHN-20250301-008", poNo: "SHEIN-PO-9801", externalOrderNo: "SH-US-20250301-77201",
    channel: "shein", customer: "Shein Platform", retailer: "Shein",
    createdAt: "2025-03-01",
    shipToAddress: { name: "Shein US Fulfillment", city: "Whitestown", state: "IN", zip: "46075", country: "US" },
    skuCount: 2, itemCount: 150, totalAmount: "5,250.00", currency: "USD",
    status: "shipped",
    items: [
      { sku: "SKU-C001", name: "Bluetooth Speaker", qty: 80, unitPrice: 19.99, currency: "USD" },
      { sku: "SKU-C003", name: "Laptop Stand", qty: 70, unitPrice: 24.99, currency: "USD" },
    ],
    shipments: [
      { id: "ssh1", warehouseCode: "WH-NJ", warehouseName: "NJ Warehouse", status: "shipped", outboundOrderNo: "OB-20250301-3001", trackingNo: "1Z999AA10123456900", carrier: "FedEx", itemCount: 150, shippedAt: "2025-03-02", palletCount: 5, bolNo: "BOL-20250302-NJ01", shipFrom: { name: "NJ Warehouse", city: "Edison", state: "NJ" }, lotNumbers: ["LOT-SHN-2025-C1", "LOT-SHN-2025-C2"] },
    ],
  },

  // ── Exception / 多渠道紧急问题 ───────────────────────────────────────────────
  // Shopify: 下发仓库失败（库存不足）
  {
    id: "ex01", orderNo: "SHP-10048", externalOrderNo: "#10048",
    channel: "shopify", customer: "David L.",
    createdAt: "2025-03-05", requiredShipDate: "2025-03-07",
    shipToAddress: { name: "David L.", city: "Portland", state: "OR", zip: "97201", country: "US" },
    skuCount: 1, itemCount: 5, totalAmount: "449.95", currency: "USD",
    status: "exception",
    items: [{ sku: "SKU-F001", name: "Portable Projector", qty: 5, unitPrice: 89.99, currency: "USD" }],
    shipments: [],
  },
  // TikTok: 下发仓库失败 + SLA 已过期
  {
    id: "ex02", orderNo: "TTK-887400", externalOrderNo: "TT-887400",
    channel: "tiktok", customer: "Alex W.", retailer: "TikTok Shop",
    createdAt: "2025-03-04", requiredShipDate: "2025-03-06",
    slaDeadline: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    shipToAddress: { name: "Alex W.", city: "Denver", state: "CO", zip: "80201", country: "US" },
    skuCount: 1, itemCount: 1, totalAmount: "79.99", currency: "USD",
    status: "exception",
    items: [{ sku: "SKU-E001", name: "Gaming Headset", qty: 1, unitPrice: 79.99, currency: "USD" }],
    shipments: [],
  },
  // Amazon: 下发仓库失败（地址校验异常）
  {
    id: "ex03", orderNo: "SAL-2025030109", poNo: "AMZ-PO-7831001", externalOrderNo: "114-5567890-3344500",
    channel: "amazon", customer: "Amazon FBA", retailer: "Amazon US",
    createdAt: "2025-03-05", requiredShipDate: "2025-03-10",
    shipToAddress: { name: "Amazon FBA SBD1", city: "San Bernardino", state: "CA", zip: "92408", country: "US" },
    skuCount: 1, itemCount: 60, totalAmount: "5,399.40", currency: "USD",
    status: "exception",
    items: [{ sku: "SKU-B001", name: "Smart Watch Band", qty: 60, unitPrice: 89.99, currency: "USD" }],
    shipments: [],
  },
  // Amazon: ASN 回传失败（已发货但 EDI 856 超时）
  {
    id: "ex04", orderNo: "SAL-2025030110", poNo: "AMZ-PO-7831055", externalOrderNo: "114-5567890-4455600",
    channel: "amazon", customer: "Amazon FBA", retailer: "Amazon US",
    createdAt: "2025-03-02", requiredShipDate: "2025-03-06",
    shipToAddress: { name: "Amazon FBA MDW2", city: "Joliet", state: "IL", zip: "60436", country: "US" },
    skuCount: 2, itemCount: 200, totalAmount: "17,998.00", currency: "USD",
    status: "shipped", tags: ["dc_sync_fail"],
    items: [
      { sku: "SKU-B001", name: "Smart Watch Band", qty: 100, unitPrice: 89.99, currency: "USD" },
      { sku: "SKU-B002", name: "Screen Protector Kit", qty: 100, unitPrice: 49.99, currency: "USD" },
    ],
    shipments: [
      { id: "sex4", warehouseCode: "WH-NJ", warehouseName: "NJ Warehouse", status: "shipped", outboundOrderNo: "OB-20250305-0099", asnNo: "ASN-2025030501", trackingNo: "1Z999AA10123457001", carrier: "UPS", itemCount: 200, shippedAt: "2025-03-05", palletCount: 6, bolNo: "BOL-20250305-NJ02", shipFrom: { name: "NJ Warehouse", city: "Edison", state: "NJ" }, shipTo: { name: "Amazon FBA MDW2", city: "Joliet", state: "IL" }, dcNote: "EDI 856 submission failed — Amazon did not acknowledge ASN. Retry required." },
    ],
  },
  // Walmart: 发货逾期 3 天
  {
    id: "ex05", orderNo: "SAL-2025030111", poNo: "WMT-PO-4530200", externalOrderNo: "WMT-ORD-89200100",
    channel: "walmart", customer: "Walmart US", retailer: "Walmart US",
    createdAt: "2025-02-27", requiredShipDate: "2025-03-02", requiredDeliveryDate: "2025-03-07",
    shipToAddress: { name: "Walmart DC #6055", city: "Brooksville", state: "FL", zip: "34601", country: "US" },
    skuCount: 2, itemCount: 180, totalAmount: "14,398.20", currency: "USD",
    status: "warehouse_processing", tags: ["overdue"], overdueShipDays: 3,
    items: [
      { sku: "SKU-A001", name: "Wireless Earbuds Pro", qty: 100, unitPrice: 89.99, currency: "USD" },
      { sku: "SKU-A002", name: "Phone Case Premium", qty: 80, unitPrice: 24.99, currency: "USD" },
    ],
    shipments: [
      { id: "sex5", warehouseCode: "WH-TX", warehouseName: "TX Warehouse", status: "picking", outboundOrderNo: "OB-20250303-0100", itemCount: 180, palletCount: 6, createdAt: "2025-03-02", shipFrom: { name: "TX Warehouse", city: "Dallas", state: "TX" }, shipTo: { name: "Walmart DC #6055", city: "Brooksville", state: "FL" } },
    ],
  },
  // Shein: 下发仓库失败
  {
    id: "ex06", orderNo: "SHN-20250305-003", poNo: "SHEIN-PO-9920", externalOrderNo: "SH-US-20250305-88999",
    channel: "shein", customer: "Shein Platform", retailer: "Shein",
    createdAt: "2025-03-05",
    slaDeadline: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    shipToAddress: { name: "Shein US Fulfillment", city: "Whitestown", state: "IN", zip: "46075", country: "US" },
    skuCount: 2, itemCount: 100, totalAmount: "3,498.00", currency: "USD",
    status: "exception", tags: ["sla_risk"],
    items: [
      { sku: "SKU-G004", name: "Night Light", qty: 50, unitPrice: 19.99, currency: "USD" },
      { sku: "SKU-G006", name: "Smart Plug 4-Pack", qty: 50, unitPrice: 34.99, currency: "USD" },
    ],
    shipments: [],
  },
  // Shopify: 发货逾期 1 天
  {
    id: "ex07", orderNo: "SHP-10049", externalOrderNo: "#10049",
    channel: "shopify", customer: "Rachel P.",
    createdAt: "2025-03-03", requiredShipDate: "2025-03-05",
    shipToAddress: { name: "Rachel P.", city: "Boston", state: "MA", zip: "02101", country: "US" },
    skuCount: 1, itemCount: 2, totalAmount: "159.98", currency: "USD",
    status: "warehouse_processing", tags: ["overdue"], overdueShipDays: 1,
    items: [{ sku: "SKU-A001", name: "Wireless Earbuds Pro", qty: 2, unitPrice: 79.99, currency: "USD" }],
    shipments: [
      { id: "sex7", warehouseCode: "WH-NJ", warehouseName: "NJ Warehouse", status: "picking", outboundOrderNo: "OB-20250305-1010", itemCount: 2, createdAt: "2025-03-03", shipFrom: { name: "NJ Warehouse", city: "Edison", state: "NJ" } },
    ],
  },
  // TikTok: On Hold（地址异常需人工审核）
  {
    id: "ex08", orderNo: "TTK-887450", externalOrderNo: "TT-887450",
    channel: "tiktok", customer: "Jordan M.", retailer: "TikTok Shop",
    createdAt: "2025-03-05",
    slaDeadline: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
    shipToAddress: { name: "Jordan M.", city: "Las Vegas", state: "NV", zip: "89101", country: "US" },
    skuCount: 1, itemCount: 1, totalAmount: "49.99", currency: "USD",
    status: "on_hold",
    items: [{ sku: "SKU-G003", name: "Desk Fan", qty: 1, unitPrice: 49.99, currency: "USD" }],
    shipments: [],
  },

  // ── Import Failed — API对接创建失败（缺SKU/缺地址/格式错误）──────────────
  // Amazon: SKU 在 OMS 中不存在
  {
    id: "if01", orderNo: "SAL-2025030112", poNo: "AMZ-PO-7840001", externalOrderNo: "114-8800123-9900100",
    channel: "amazon", customer: "Amazon FBA", retailer: "Amazon US",
    createdAt: "2025-03-05", requiredShipDate: "2025-03-12",
    shipToAddress: { name: "Amazon FBA SBD1", city: "San Bernardino", state: "CA", zip: "92408", country: "US" },
    skuCount: 1, itemCount: 50, totalAmount: "4,499.50", currency: "USD",
    status: "imported", tags: ["import_error"],
    importError: "SKU 'AMZ-UNKNOWN-X1' not found in OMS product catalog. Map SKU or add product first.",
    items: [{ sku: "AMZ-UNKNOWN-X1", name: "(Unknown SKU)", qty: 50, unitPrice: 89.99, currency: "USD" }],
    shipments: [],
  },
  // TikTok: 收货地址不完整（缺 zip code）
  {
    id: "if02", orderNo: "TTK-887500", externalOrderNo: "TT-887500",
    channel: "tiktok", customer: "Nina C.", retailer: "TikTok Shop",
    createdAt: "2025-03-05",
    slaDeadline: new Date(Date.now() + 40 * 3600 * 1000).toISOString(),
    shipToAddress: { name: "Nina C.", city: "Houston", state: "TX", zip: "", country: "US" },
    skuCount: 1, itemCount: 1, totalAmount: "59.99", currency: "USD",
    status: "imported", tags: ["import_error"],
    importError: "Ship-to address incomplete: missing ZIP code. Update address via channel or manually.",
    items: [{ sku: "SKU-E003", name: "Gaming Mouse", qty: 1, unitPrice: 59.99, currency: "USD" }],
    shipments: [],
  },
  // Shein: API 字段格式错误（item quantity = 0）
  {
    id: "if03", orderNo: "SHN-20250305-005", poNo: "SHEIN-PO-9930", externalOrderNo: "SH-US-20250305-99001",
    channel: "shein", customer: "Shein Platform", retailer: "Shein",
    createdAt: "2025-03-05",
    slaDeadline: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    shipToAddress: { name: "Shein US Fulfillment", city: "Whitestown", state: "IN", zip: "46075", country: "US" },
    skuCount: 2, itemCount: 0, totalAmount: "0.00", currency: "USD",
    status: "imported", tags: ["import_error"],
    importError: "Invalid line items: quantity is 0 for all SKUs. Check API payload from Shein.",
    items: [
      { sku: "SKU-G004", name: "Night Light", qty: 0, unitPrice: 19.99, currency: "USD" },
      { sku: "SKU-G005", name: "Extension Cord", qty: 0, unitPrice: 24.99, currency: "USD" },
    ],
    shipments: [],
  },

  // ── Allocation Failed — 库存不足无法分配 ────────────────────────────────────
  // Walmart: 库存不足
  {
    id: "af01", orderNo: "SAL-2025030113", poNo: "WMT-PO-4535001", externalOrderNo: "WMT-ORD-89300200",
    channel: "walmart", customer: "Walmart US", retailer: "Walmart US",
    createdAt: "2025-03-04", requiredShipDate: "2025-03-10", requiredDeliveryDate: "2025-03-15",
    shipToAddress: { name: "Walmart DC #6097", city: "Bentonville", state: "AR", zip: "72712", country: "US" },
    skuCount: 2, itemCount: 300, totalAmount: "26,997.00", currency: "USD",
    status: "allocated", tags: ["alloc_failed"],
    items: [
      { sku: "SKU-A001", name: "Wireless Earbuds Pro", qty: 200, unitPrice: 89.99, currency: "USD" },
      { sku: "SKU-B001", name: "Smart Watch Band", qty: 100, unitPrice: 0, currency: "USD" },
    ],
    shipments: [],
  },
  // Shopify: 库存不足（DTC 小单）
  {
    id: "af02", orderNo: "SHP-10050", externalOrderNo: "#10050",
    channel: "shopify", customer: "Tom H.",
    createdAt: "2025-03-05", requiredShipDate: "2025-03-07",
    shipToAddress: { name: "Tom H.", city: "San Francisco", state: "CA", zip: "94102", country: "US" },
    skuCount: 1, itemCount: 3, totalAmount: "269.97", currency: "USD",
    status: "allocated", tags: ["alloc_failed"],
    items: [{ sku: "SKU-F001", name: "Portable Projector", qty: 3, unitPrice: 89.99, currency: "USD" }],
    shipments: [],
  },
  // Amazon: 库存不足 — 多 SKU
  {
    id: "af03", orderNo: "SAL-2025030114", poNo: "AMZ-PO-7788001", externalOrderNo: "111-3344556-0001",
    channel: "amazon", customer: "Amazon US", retailer: "Amazon US",
    createdAt: "2025-03-04", requiredShipDate: "2025-03-09",
    shipToAddress: { name: "Amazon FBA ONT8", city: "San Bernardino", state: "CA", zip: "92408", country: "US" },
    skuCount: 2, itemCount: 150, totalAmount: "8,998.50", currency: "USD",
    status: "allocated", tags: ["alloc_failed"],
    items: [
      { sku: "SKU-C003", name: "USB-C Hub 7-in-1", qty: 100, unitPrice: 49.99, currency: "USD" },
      { sku: "SKU-D002", name: "Laptop Stand Aluminum", qty: 50, unitPrice: 79.99, currency: "USD" },
    ],
    shipments: [],
  },
  // TikTok: 库存不足
  {
    id: "af04", orderNo: "TT-20250305-0088", externalOrderNo: "TT-ORD-556677",
    channel: "tiktok", customer: "TikTok Shop US",
    createdAt: "2025-03-05", requiredShipDate: "2025-03-08",
    shipToAddress: { name: "TikTok Fulfillment Center", city: "Ontario", state: "CA", zip: "91761", country: "US" },
    skuCount: 1, itemCount: 80, totalAmount: "3,199.20", currency: "USD",
    status: "allocated", tags: ["alloc_failed"],
    items: [{ sku: "SKU-H001", name: "Ring Light 18inch", qty: 80, unitPrice: 39.99, currency: "USD" }],
    shipments: [],
  },
  // Walmart: 另一个缺货单
  {
    id: "af05", orderNo: "SAL-2025030115", poNo: "WMT-PO-4535010", externalOrderNo: "WMT-ORD-89300210",
    channel: "walmart", customer: "Walmart US", retailer: "Walmart US",
    createdAt: "2025-03-03", requiredShipDate: "2025-03-08",
    shipToAddress: { name: "Walmart DC #7012", city: "Brooksville", state: "FL", zip: "34601", country: "US" },
    skuCount: 1, itemCount: 200, totalAmount: "5,998.00", currency: "USD",
    status: "allocated", tags: ["alloc_failed"],
    items: [{ sku: "SKU-J004", name: "Wireless Charging Pad", qty: 200, unitPrice: 29.99, currency: "USD" }],
    shipments: [],
  },
]

export default function SalesOrdersPage() {
  const sidebarItems = [
    { title: "Overview", href: "/client-portal", icon: <TrendingUp className="h-4 w-4" /> },
    {
      title: "Orders", href: "/client-portal/orders", icon: <FileText className="h-4 w-4" />,
      children: [
        { title: "Sales Orders", href: "/client-portal/orders/sales" },
        { title: "Wholesale", href: "/client-portal/orders/wholesale" },
        { title: "Retail", href: "/client-portal/orders/retail" },
      ],
    },
    { title: "Products", href: "/client-portal/products", icon: <Package className="h-4 w-4" /> },
    { title: "Profile", href: "/client-portal/profile", icon: <Users className="h-4 w-4" /> },
  ]

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Merchant Portal">
      <OrderListTable
        orders={ORDERS}
        title="Sales Orders"
        description="All channels — Amazon, Walmart, Shopify, TikTok, Shein"
      />
    </MainLayout>
  )
}
