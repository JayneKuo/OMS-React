"""订单全景查询引擎 - 环境配置模块"""

from __future__ import annotations

import os

from pydantic import BaseModel, model_validator


class EngineConfig(BaseModel):
    """引擎环境配置，集中管理所有外部依赖参数。

    优先级：env 参数（AgentForce session env）> 环境变量 > 默认值。
    当 OMS_TOKEN 存在时，跳过 username/password 认证，直接使用该 token。
    """

    base_url: str = "https://omsv2-staging.item.com"
    # 前端登录后传入的 access_token（优先使用，有则跳过 password grant）
    token: str | None = None
    # 仅在 token 为空时用于 password grant 换 token
    username: str = ""
    password: str = ""
    tenant_id: str = "LT"
    merchant_no: str = ""
    request_timeout: int = 30
    token_refresh_buffer: int = 30

    @model_validator(mode="before")
    @classmethod
    def _override_from_env(cls, values: dict) -> dict:
        """支持从环境变量覆盖默认值（AgentForce 的 env 参数会注入为环境变量）。"""
        env_map = {
            "OMS_BASE_URL": "base_url",
            "OMS_TOKEN": "token",
            "OMS_USERNAME": "username",
            "OMS_PASSWORD": "password",
            "OMS_TENANT_ID": "tenant_id",
            "OMS_MERCHANT_NO": "merchant_no",
            "OMS_REQUEST_TIMEOUT": "request_timeout",
            "OMS_TOKEN_REFRESH_BUFFER": "token_refresh_buffer",
        }
        for env_key, field_name in env_map.items():
            env_val = os.environ.get(env_key)
            if env_val is not None and field_name not in values:
                values[field_name] = env_val
        return values
