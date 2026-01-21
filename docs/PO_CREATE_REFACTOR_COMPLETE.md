**：保存时需要包含 `factoryDirectConfig` 数据

## ✨ 下一步优化建议

1. 添加工厂、成品库、客户、门店的真实数据源（替换 mock 数据）
2. 实现后端 API 集成
3. 添加表单验证提示
4. 添加保存草稿功能
5. 添加国际化支持（i18n）
6. 添加单元测试

## 🎉 完成状态

所有需求已实现并测试通过！页面可以正常访问和使用。
seId: "",
  finishedGoodsWarehouseName: "",
  finalDestinationId: "",
  finalDestinationType: "CUSTOMER",
  finalDestinationName: "",
})
```

## 🚀 使用方法

1. 访问 `http://localhost:3000/purchase/po/create`
2. 在"采购类型"下拉框中选择"工厂直发"
3. 填写工厂直发配置：
   - 选择工厂
   - 选择物流路径（经成品库或直接发货）
   - 如果选择经成品库，选择成品库
   - 选择目的地类型和目的地
4. 查看流程预览确认配置正确
5. 填写其他必填字段
6. 保存或发送采购单

## 📝 注意事项

1. **datetime-local 输入**：交货期日和最晚发运时间现在使用 `datetime-local` 类型，可以选择日期和时间
2. **条件显示**：工厂直发配置卡片只在选择"工厂直发"采购类型时显示
3. **表单验证**：供应商名称现在是必填字段，已添加到验证逻辑中
4. **数据结构

## 🔧 技术实现

### Factory Direct Shipping Config 组件特性
- 工厂选择下拉框
- 两种物流路径选择（单选按钮样式）:
  - 经成品库（带条件显示的成品库选择）
  - 直接发货（带警告提示）
- 目的地类型选择（客户/门店/仓库）
- 目的地选择（根据类型动态加载）
- 可视化流程预览

### 状态管理
```typescript
const [factoryDirectConfig, setFactoryDirectConfig] = React.useState<FactoryDirectConfig>({
  viaFinishedGoodsWarehouse: true,
  factoryId: "",
  factoryName: "",
  finishedGoodsWarehou用信息 (Cost Information)
8. ✅ 附件和备注 (Attachments & Notes)

## 📁 修改的文件

### 新建文件
1. `components/purchase/factory-direct-shipping-config.tsx` - 工厂直发配置组件
2. `docs/PO_CREATE_REFACTOR_PLAN.md` - 重构计划文档
3. `docs/PO_CREATE_PAGE_CHANGES.md` - 详细变更文档

### 修改文件
1. `app/purchase/po/create/page.tsx` - 主要的创建页面
2. `app/po-detail-v2/page.tsx` - 详情页（已在之前完成）

## 🎨 设计系统合规性

所有修改都遵循了设计系统规范：
- ✅ 使用 CSS 变量定义颜色
- ✅ 遵循 8px 间距系统
- ✅ 使用标准字体大小
- ✅ 支持深色模式
- ✅ 符合可访问性要求✅ 贸易条款 (下拉选择)

### 4. 重命名和重构卡片

**"Supplier Information" → "发货地址"**
- ✅ 移除了供应商基本信息字段
- ✅ 保留了地址相关字段
- ✅ 更新了卡片标题和图标

**"Delivery Information" → "收货地址"**
- ✅ 移除了物流条款字段
- ✅ 保留了仓库选择和地址字段
- ✅ 更新了卡片标题和图标

### 5. 卡片顺序
1. ✅ 基本信息 (Basic Information)
2. ✅ 工厂直发配置 (Factory Direct Shipping Config) - 条件显示
3. ✅ 物流条款 (Logistics Terms)
4. ✅ 收货地址 (Delivery Address)
5. ✅ 发货地址 (Shipping Address)
6. ✅ 产品明细 (Product Lines)
7. ✅ 费 添加工厂直发采购类型
- ✅ 在采购类型下拉框中添加了"工厂直发"选项
- ✅ 创建了 `FactoryDirectShippingConfig` 组件
- ✅ 添加了 `factoryDirectConfig` 状态管理
- ✅ 当选择"工厂直发"时显示配置卡片

### 2. 重构基本信息卡片
**新增字段（从供应商信息移入）：**
- ✅ 供应商名称 * (必填)
- ✅ 供应商编码
- ✅ 联系人
- ✅ 联系电话

### 3. 创建新的"物流条款"卡片
**包含字段：**
- ✅ 交货期日 * (datetime-local 输入)
- ✅ 最晚发运时间 (datetime-local 输入)
- ✅ 运输方式 (下拉选择)
- ✅ 运费条款 (下拉选择)
- # PO Create Page Refactor - 完成总结

## ✅ 已完成的修改

### 1.