#!/usr/bin/env python3
"""OMS Agent Tool Server — HTTP 版本的 tool_bridge

部署到 NAS 或任何有 Python 的服务器上，供 Vercel 的 chat route 远程调用。

启动：
  pip install fastapi uvicorn pydantic requests
  python .kiro/skills/oms-agent/tool_server.py

或：
  uvicorn tool_server:app --host 0.0.0.0 --port 8100

环境变量（可选）：
  TOOL_SERVER_PORT=8100
  TOOL_SERVER_HOST=0.0.0.0
"""

import os
import sys
import json

# 设置引擎包路径
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_SKILLS_DIR = os.path.dirname(_THIS_DIR)
sys.path.insert(0, os.path.join(_SKILLS_DIR, "oms-query", "scripts"))
sys.path.insert(0, os.path.join(_SKILLS_DIR, "cartonization", "scripts"))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="OMS Agent Tool Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


class ToolRequest(BaseModel):
    tool_name: str
    args: dict = {}


class ToolResponse(BaseModel):
    success: bool
    result: dict | list | str | None = None
    error: str | None = None


# ─── Import tool_bridge functions ───
from tool_bridge import TOOLS


@app.post("/tool", response_model=ToolResponse)
async def call_tool(req: ToolRequest):
    if req.tool_name not in TOOLS:
        raise HTTPException(status_code=404, detail=f"Unknown tool: {req.tool_name}")

    try:
        result = TOOLS[req.tool_name](**req.args)

        # 去掉 null 值减少传输大小
        if isinstance(result, dict):
            cleaned = json.loads(json.dumps(result, default=str))
        else:
            cleaned = result

        return ToolResponse(success=True, result=cleaned)
    except Exception as e:
        return ToolResponse(success=False, error=str(e))


@app.get("/health")
async def health():
    return {"status": "ok", "tools": list(TOOLS.keys())}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("TOOL_SERVER_PORT", "8100"))
    host = os.environ.get("TOOL_SERVER_HOST", "0.0.0.0")
    print(f"Starting OMS Agent Tool Server on {host}:{port}")
    print(f"Available tools: {list(TOOLS.keys())}")
    uvicorn.run(app, host=host, port=port)
