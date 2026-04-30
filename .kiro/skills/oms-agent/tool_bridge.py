#!/usr/bin/env python3
"""工具桥接器 — 让 Node.js 可以调用 MCP server 里的任意工具。

用法：
  python tool_bridge.py <tool_name> '<json_args>'

示例：
  python tool_bridge.py oms_warehouse_list '{}'
  python tool_bridge.py oms_query '{"identifier":"SO00168596","intent":"panorama"}'
  python tool_bridge.py cartonize '{"input_json":"{...}"}'
"""

import sys
import os
import json

# 设置引擎包路径
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SKILLS_DIR = os.path.dirname(_THIS_DIR)
sys.path.insert(0, os.path.join(_SKILLS_DIR, "oms-query", "scripts"))
sys.path.insert(0, os.path.join(_SKILLS_DIR, "cartonization", "scripts"))

# 导入所有工具函数（不启动 MCP server）
from oms_query_engine.engine_v2 import OMSQueryEngine
from oms_query_engine.models.request import QueryRequest, BatchQueryRequest
from oms_query_engine.api_client import OMSAPIClient
from oms_query_engine.config import EngineConfig


def _extract_list(data) -> list:
    if data is None: return []
    if isinstance(data, list): return data
    if isinstance(data, dict):
        for key in ("list", "records", "data"):
            val = data.get(key)
            if isinstance(val, list): return val
    return []


def _get_client():
    client = OMSAPIClient(EngineConfig())
    client._ensure_token()
    return client


def _default_merchant_no():
    return EngineConfig().merchant_no


# ─── Tool implementations (same as mcp_server.py) ───

def tool_oms_query(identifier, intent="status", force_refresh=False):
    engine = OMSQueryEngine()
    result = engine.query(QueryRequest(
        identifier=identifier, query_intent=intent, force_refresh=force_refresh))
    return result.model_dump()

def tool_oms_batch_query(query_type, status_filter=None, page_no=1, page_size=20):
    engine = OMSQueryEngine()
    result = engine.query_batch(BatchQueryRequest(
        query_type=query_type, status_filter=status_filter,
        page_no=page_no, page_size=page_size))
    return result.model_dump()

def tool_oms_warehouse_list(merchant_no=""):
    if not merchant_no: merchant_no = _default_merchant_no()
    client = _get_client()
    resp = client.post("/api/linker-oms/opc/app-api/facility/v2/page",
                       {"merchantNo": merchant_no, "pageNo": 1, "pageSize": 100})
    data = resp.get("data", resp)
    wlist = _extract_list(data)
    warehouses = []
    for w in wlist:
        warehouses.append({
            "warehouse_name": w.get("facility_name", ""),
            "accounting_code": w.get("accountingCode", ""),
            "city": w.get("city", ""), "state": w.get("state", ""),
            "country": w.get("country", ""), "zipcode": w.get("zipCode", ""),
            "address": w.get("address1", ""),
            "wms_version": w.get("warehouseVersion", ""),
            "status": w.get("status", ""),
            "fulfillment_enabled": bool(w.get("fulfillmentSwitch")),
            "inventory_enabled": bool(w.get("inventorySwitch")),
        })
    return {"total": len(warehouses), "warehouses": warehouses}

def tool_oms_inventory_list(merchant_no=""):
    if not merchant_no: merchant_no = _default_merchant_no()
    client = _get_client()
    resp = client.post("/api/linker-oms/opc/app-api/inventory/list",
                       {"merchantNo": merchant_no})
    data = resp.get("data", resp)
    items = _extract_list(data)
    return {"total": len(items), "inventory": items}

def tool_oms_rule_list(merchant_no=""):
    if not merchant_no: merchant_no = _default_merchant_no()
    engine = OMSQueryEngine()
    from oms_query_engine.models.query_plan import QueryContext
    rule_provider = engine._executor.get_provider("rule")
    ctx = QueryContext(merchant_no=merchant_no)
    result = rule_provider.query(ctx)
    if result.success and result.data:
        rule_info = result.data.get("rule_info")
        if rule_info: return rule_info.model_dump()
    return {"error": "规则查询失败"}

def tool_oms_hold_rules(merchant_no=""):
    if not merchant_no: merchant_no = _default_merchant_no()
    client = _get_client()
    resp = client.get("/api/linker-oms/opc/app-api/hold-rule-data/page",
                      {"merchantNo": merchant_no})
    data = resp.get("data", resp)
    rules = _extract_list(data)
    return {"total": len(rules), "hold_rules": rules}

def tool_oms_channel_list(merchant_no=""):
    if not merchant_no: merchant_no = _default_merchant_no()
    client = _get_client()
    resp = client.get("/api/linker-oms/opc/app-api/channel/*/list",
                      {"tags": merchant_no, "pageSize": -1})
    data = resp.get("data", resp)
    channels = _extract_list(data)
    result = []
    for ch in channels:
        connector = ch.get("connectorDTO") or {}
        result.append({
            "channel_name": ch.get("channelName"),
            "channel_no": ch.get("channelNo"),
            "connector_name": connector.get("connectorName"),
            "connector_type": connector.get("connectorTypeCode"),
            "connection_status": "已连接" if ch.get("connectionStatus") else "未连接",
            "auth_status": "正常" if ch.get("authStatus") else "异常",
        })
    return {"total": len(result), "channels": result}

def tool_oms_order_timeline(order_no):
    client = _get_client()
    resp = client.get(f"/api/linker-oms/opc/app-api/payment/time-line/{order_no}")
    data = resp.get("data", resp)
    events = _extract_list(data)
    return {"order_no": order_no, "total": len(events), "timeline": events}

def tool_oms_order_logs(order_no, merchant_no=""):
    if not merchant_no: merchant_no = _default_merchant_no()
    client = _get_client()
    resp = client.get("/api/linker-oms/opc/app-api/orderLog/list",
                      {"merchantNo": merchant_no, "omsOrderNo": order_no})
    data = resp.get("data", resp)
    logs = _extract_list(data)
    return {"order_no": order_no, "total": len(logs), "logs": logs}

def tool_oms_dispatch_log(event_id):
    client = _get_client()
    resp = client.get(f"/api/linker-oms/oas/rpc-api/dispatch-log/{event_id}")
    data = resp.get("data", resp)
    return {"event_id": event_id, "dispatch_log": data}

def tool_oms_shipment_tracking(order_no):
    client = _get_client()
    tracking = {}
    try:
        resp = client.get(f"/api/linker-oms/opc/app-api/tracking-assistant/{order_no}")
        tracking["tracking_detail"] = resp.get("data", resp)
    except Exception as e:
        tracking["tracking_detail_error"] = str(e)
    try:
        resp = client.get(f"/api/linker-oms/opc/app-api/tracking-assistant/tracking-status/{order_no}")
        tracking["tracking_status"] = resp.get("data", resp)
    except Exception as e:
        tracking["tracking_status_error"] = str(e)
    return {"order_no": order_no, **tracking}

def tool_cartonize(input_json):
    from cartonization_engine.models import CartonizationRequest
    from cartonization_engine.engine import CartonizationEngine
    request = CartonizationRequest.model_validate_json(input_json)
    engine = CartonizationEngine()
    result = engine.cartonize(request)
    return json.loads(result.model_dump_json())


# ─── Tool registry ───
TOOLS = {
    "oms_query": tool_oms_query,
    "oms_batch_query": tool_oms_batch_query,
    "oms_warehouse_list": tool_oms_warehouse_list,
    "oms_inventory_list": tool_oms_inventory_list,
    "oms_rule_list": tool_oms_rule_list,
    "oms_hold_rules": tool_oms_hold_rules,
    "oms_channel_list": tool_oms_channel_list,
    "oms_order_timeline": tool_oms_order_timeline,
    "oms_order_logs": tool_oms_order_logs,
    "oms_dispatch_log": tool_oms_dispatch_log,
    "oms_shipment_tracking": tool_oms_shipment_tracking,
    "cartonize": tool_cartonize,
}


def main():
    if len(sys.argv) < 3:
        print("用法: python tool_bridge.py <tool_name> '<json_args>'", file=sys.stderr)
        sys.exit(1)

    tool_name = sys.argv[1]
    args_json = sys.argv[2]

    if tool_name not in TOOLS:
        print(json.dumps({"error": f"未知工具: {tool_name}"}))
        sys.exit(1)

    try:
        args = json.loads(args_json)
        result = TOOLS[tool_name](**args)
        # 去掉 null 值减少输出大小
        output = json.dumps(result, ensure_ascii=False, default=str,
                           separators=(',', ':'))
        # 截断过大的输出
        if len(output) > 15000:
            output = output[:15000] + '..."truncated"}'
        print(output)
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        sys.exit(1)


if __name__ == "__main__":
    main()
