# PO状态修改总结：ON_HOLD 改为 EXCEPTION

## 修改内容

### 1. PO页面状态类型定义
**文件：** `app/purchase/po/page.tsx`

- 将接口中的状态类型从 `"ON_HOLD"` 改为 `"EXCEPTION"`
- 更新模拟数据中的状态值
- 修改状态配置对象中的键值
- 更新筛选器配置
- 修改状态计数对象
- 更新操作逻辑中的状态判断
- 修改批量操作逻辑
- 更新状态标签页

### 2. 翻译文件修改
**文件：** `lib/i18n.ts`

**中文翻译：**
- 删除：`ON_HOLD: '暂停'`
- 删除：`onHold: '暂停'`
- 保留：`EXCEPTION: '异常'`
- 添加：`exception: '异常'`

**英文翻译：**
- 删除：`ON_HOLD: 'On Hold'`
- 删除：`onHold: 'On Hold'`
- 保留：`EXCEPTION: 'Exception'`
- 添加：`exception: 'Exception'`

### 3. 测试页面更新
**文件：** `app/po-i18n-test/page.tsx`

- 将状态显示从 `t('ON_HOLD')` 改为 `t('EXCEPTION')`

## 修改详情

### 状态映射变化
```typescript
// 修改前
status: "DRAFT" | "SUBMITTED" | "CONFIRMED" | "SHIPPED" | "RECEIVED" | "CANCELLED" | "ON_HOLD"

// 修改后  
status: "DRAFT" | "SUBMITTED" | "CONFIRMED" | "SHIPPED" | "RECEIVED" | "CANCELLED" | "EXCEPTION"
```

### 状态配置变化
```typescript
// 修改前
ON_HOLD: { label: t('ON_HOLD'), color: "bg-yellow-100 text-yellow-800" }

// 修改后
EXCEPTION: { label: t('EXCEPTION'), color: "bg-yellow-100 text-yellow-800" }
```

### 筛选器配置变化
```typescript
// 修改前
{ id: "on_hold", label: t('ON_HOLD'), value: "ON_HOLD" }

// 修改后
{ id: "exception", label: t('EXCEPTION'), value: "EXCEPTION" }
```

### 标签页变化
```typescript
// 修改前
<TabsTrigger value="ON_HOLD">
  {t('onHold')} <Badge variant="secondary" className="ml-2">{statusCounts.ON_HOLD}</Badge>
</TabsTrigger>

// 修改后
<TabsTrigger value="EXCEPTION">
  {t('exception')} <Badge variant="secondary" className="ml-2">{statusCounts.EXCEPTION}</Badge>
</TabsTrigger>
```

## 功能影响

### 1. 状态显示
- PO列表中原本显示为"暂停"/"On Hold"的状态现在显示为"异常"/"Exception"
- 状态颜色保持不变（黄色背景）

### 2. 筛选功能
- 筛选器中的"暂停"选项改为"异常"
- 筛选逻辑保持不变

### 3. 操作功能
- 异常状态的PO仍然支持：查看、恢复、取消操作
- 批量操作中的"批量恢复"和"批量取消"功能保持不变

### 4. 标签页导航
- 状态标签页中的"暂停"改为"异常"
- 计数功能正常

## 验证结果

- ✅ TypeScript 编译检查通过
- ✅ 所有相关文件语法正确
- ✅ 翻译键值完整且无重复
- ✅ 中英文翻译对应正确

## 注意事项

1. **数据兼容性：** 如果数据库中已有 `ON_HOLD` 状态的记录，需要相应更新数据
2. **API接口：** 后端API如果使用了 `ON_HOLD` 状态，也需要同步修改
3. **文档更新：** 相关的业务文档和API文档需要更新状态说明

## 业务逻辑保持不变

虽然状态名称从"暂停"改为"异常"，但业务逻辑完全保持不变：
- 仍然表示需要特殊处理的PO
- 仍然支持恢复和取消操作
- 仍然使用黄色警告色彩
- 仍然在异常处理流程中