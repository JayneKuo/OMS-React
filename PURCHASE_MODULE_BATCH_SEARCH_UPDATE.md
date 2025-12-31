# 采购模块批量搜索功能更新

**更新日期**: 2024-12-31  
**更新内容**: 为采购申请单（PR）和采购订单（PO）页面添加批量搜索支持  
**影响页面**: 
- `app/purchase/pr/page.tsx` - 采购申请单列表
- `app/purchase/po/page.tsx` - 采购订单列表

---

## 更新内容

### 1. PR页面（采购申请单）

#### 高级搜索字段更新

**之前**：
```typescript
const advancedSearchFields: SearchField[] = [
  { id: "prNo", label: t('prNumber'), placeholder: t('examplePRNumber') },
  { id: "businessNo", label: t('businessNumber'), placeholder: t('exampleBusinessNumber') },
  // ... 其他字段
]
```

**现在**：
```typescript
const advancedSearchFields: SearchField[] = [
  { 
    id: "prNo", 
    label: t('prNumber'), 
    placeholder: "PR202401100001\nPR202401100002\nPR202401100003",
    type: "batch",  // 批量输入字段
    maxItems: 100
  },
  { 
    id: "businessNo", 
    label: t('businessNumber'), 
    placeholder: t('exampleBusinessNumber')
  },
  // ... 其他字段保持不变
]
```

#### 状态管理更新

**添加**：
```typescript
const [advancedSearchFilters, setAdvancedSearchFilters] = React.useState<any[]>([])
```

#### 回调函数更新

**之前**：
```typescript
onAdvancedSearch={setAdvancedSearchValues}
```

**现在**：
```typescript
onAdvancedSearch={(values, filters) => {
  setAdvancedSearchValues(values)
  setAdvancedSearchFilters(filters || [])
}}
```

---

### 2. PO页面（采购订单）

#### 高级搜索字段更新

**之前**：
```typescript
const advancedSearchFields: SearchField[] = [
  { id: "orderNo", label: t('poNo'), placeholder: "e.g., PO202403150001" },
  { id: "prNos", label: t('prNos'), placeholder: "e.g., PR202401100001" },
  // ... 其他字段
]
```

**现在**：
```typescript
const advancedSearchFields: SearchField[] = [
  { 
    id: "orderNo", 
    label: t('poNo'), 
    placeholder: "PO202403150001\nPO202403150002\nPO202403150003",
    type: "batch",  // PO单号批量输入
    maxItems: 100
  },
  { 
    id: "originalPoNo", 
    label: t('originalPoNo'), 
    placeholder: "e.g., EXT-PO-2024-001"
  },
  { 
    id: "prNos", 
    label: t('prNos'), 
    placeholder: "PR202401100001\nPR202401100002",
    type: "batch",  // PR单号批量输入
    maxItems: 100
  },
  // ... 其他字段保持不变
]
```

**注意**：PO页面支持两个批量输入字段：
1. **PO单号** (`orderNo`) - 批量搜索采购订单号
2. **PR单号** (`prNos`) - 批量搜索关联的采购申请单号

#### 状态管理和回调更新

与PR页面相同的更新模式。

---

## 功能说明

### PR页面批量搜索

用户可以批量搜索：
- **PR单号** - 支持批量输入多个采购申请单号

**使用场景**：
- 财务对账：批量查询多个PR单据
- 异常处理：批量查询问题PR
- 数据导出：批量选择特定PR导出

### PO页面批量搜索

用户可以批量搜索：
- **PO单号** - 支持批量输入多个采购订单号
- **PR单号** - 支持批量输入多个PR号，查找关联的PO

**使用场景**：
- 供应商对账：批量查询多个PO单据
- PR转PO跟踪：通过PR号批量查询生成的PO
- 收货核对：批量查询待收货的PO
- 数据导出：批量选择特定PO导出

---

## 用户操作流程

### PR页面批量搜索PR单号

1. 点击"高级搜索"按钮
2. 在"PR单号"字段（Textarea）中输入：
   ```
   PR202401100001
   PR202401100002
   PR202401100003
   ```
3. 系统显示"已识别 3 个PR单号"
4. 点击"搜索"按钮
5. 列表显示匹配的PR
6. 筛选条件显示蓝色Badge：`PR单号: PR202401100001, PR202401100002, PR202401100003 [×]`

### PO页面批量搜索

#### 场景1：批量搜索PO单号

1. 点击"高级搜索"按钮
2. 在"PO单号"字段中输入多个PO号
3. 搜索并查看结果

#### 场景2：通过PR号批量查询PO

1. 点击"高级搜索"按钮
2. 在"PR单号"字段中输入多个PR号
3. 系统查找所有关联的PO
4. 列表显示匹配的PO

#### 场景3：组合搜索

用户可以同时使用：
- PO单号批量搜索
- PR单号批量搜索
- 供应商名称搜索
- 其他筛选条件

所有条件都会显示为Badge，可单独删除。

---

## 视觉效果

### 高级搜索对话框

```
┌─────────────────────────────────────────────┐
│ 高级搜索                                [2] │
├─────────────────────────────────────────────┤
│ PR单号 (支持批量输入，最多100个)            │
│ ┌─────────────────────────────────────────┐ │
│ │ PR202401100001                          │ │
│ │ PR202401100002                          │ │
│ │ PR202401100003                          │ │
│ └─────────────────────────────────────────┘ │
│ 已识别 3 个PR单号                           │
│ [PR202401100001] [PR202401100002] [...]    │
│                                             │
│ 业务单号                                    │
│ ┌─────────────────────────────────────────┐ │
│ │ PROJ-2024-001                           │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│              [清空]  [搜索]                 │
└─────────────────────────────────────────────┘
```

### 筛选条件回显

```
已选筛选: [PR单号: PR202401100001, PR202401100002, PR202401100003 ×] [业务单号: PROJ-2024-001 ×] [清除全部]
          ↑ 蓝色Badge（高级搜索）                                      ↑ 蓝色Badge
```

---

## 技术细节

### 批量字段配置

```typescript
{
  id: "prNo",           // 字段ID
  label: "PR单号",      // 显示标签
  placeholder: "...",   // 占位符（显示示例格式）
  type: "batch",        // 字段类型：批量输入
  maxItems: 100         // 最大数量限制
}
```

### 数据过滤逻辑

批量搜索字段的值为数组，需要特殊处理：

```typescript
// 在数据过滤逻辑中
if (Array.isArray(value)) {
  // 批量搜索：OR逻辑（匹配任一值）
  return value.some(v => 
    item.prNo.toLowerCase().includes(v.toLowerCase())
  )
} else {
  // 普通搜索：精确匹配
  return item.prNo.toLowerCase().includes(value.toLowerCase())
}
```

---

## 国际化支持

批量搜索功能完全支持国际化：
- 字段标签使用 `t()` 函数翻译
- 占位符可以是翻译键或直接文本
- 提示信息自动适配当前语言

---

## 验收标准

### PR页面
- [x] PR单号字段支持批量输入
- [x] 实时显示识别数量
- [x] 搜索条件回显为蓝色Badge
- [x] 可单独删除搜索条件
- [x] 清除全部同时清除高级搜索
- [x] 国际化正常工作

### PO页面
- [x] PO单号字段支持批量输入
- [x] PR单号字段支持批量输入
- [x] 两个批量字段可同时使用
- [x] 搜索条件正确回显
- [x] 数据过滤逻辑正确
- [x] 国际化正常工作

---

## 后续优化建议

1. **保存搜索模板**
   - 保存常用的批量搜索组合
   - 例如："本月待审批PR"、"供应商A的所有PO"

2. **搜索历史**
   - 记录最近的批量搜索
   - 快速重复上次搜索

3. **导入文件**
   - 支持上传Excel/CSV文件批量搜索
   - 适合大量单号的场景（>100个）

4. **智能识别**
   - 自动识别PR/PO单号格式
   - 过滤无效输入

5. **搜索结果导出**
   - 批量搜索结果一键导出
   - 保留搜索条件信息

---

## 相关文档

- 高级搜索组件：`components/data-table/advanced-search-dialog.tsx`
- 筛选栏组件：`components/data-table/filter-bar.tsx`
- 功能总结：`ADVANCED_SEARCH_WITH_BATCH_SUMMARY.md`
- 演示页面：`app/batch-search-demo/page.tsx`

---

## 测试建议

### 功能测试

1. **单个批量字段**
   - 输入1个单号
   - 输入10个单号
   - 输入100个单号
   - 输入超过100个单号（应显示警告）

2. **多个批量字段**（仅PO页面）
   - 同时输入PO单号和PR单号
   - 验证AND逻辑正确

3. **混合搜索**
   - 批量搜索 + 普通筛选
   - 批量搜索 + 快速搜索
   - 批量搜索 + 状态标签页

4. **边界情况**
   - 空输入
   - 重复单号（应自动去重）
   - 不存在的单号
   - 特殊字符

### 国际化测试

1. 切换到英文
2. 验证所有标签正确翻译
3. 验证占位符正确显示
4. 验证提示信息正确翻译

### 性能测试

1. 输入100个单号
2. 验证解析速度
3. 验证搜索速度
4. 验证UI响应性

---

## 更新文件清单

1. `app/purchase/pr/page.tsx` - PR页面
   - 添加批量搜索字段配置
   - 添加状态管理
   - 更新回调函数

2. `app/purchase/po/page.tsx` - PO页面
   - 添加两个批量搜索字段配置
   - 添加状态管理
   - 更新回调函数

3. `PURCHASE_MODULE_BATCH_SEARCH_UPDATE.md` - 本文档
   - 更新说明
   - 使用指南
   - 测试建议
