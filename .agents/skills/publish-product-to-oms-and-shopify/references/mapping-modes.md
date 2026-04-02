# 映射模式

## compat 模式

适用于：

- OMS 页面展示仍依赖现有渠道类目 ID
- OMS SKU 变体渲染仍依赖属性 ID / 属性值 ID
- 当前链路要优先跑通和展示

## native 模式

适用于：

- OMS 已支持按 Shopify、TikTok 原生字符串识别类目和属性
- OMS 后端能根据字符串自动映射内部属性体系

## 选择原则

1. 如果 native 已支持，优先 native
2. 如果 native 未支持，但 compat 能让当前页面展示，先用 compat
3. 使用 compat 时，明确说明这是临时兼容方案
