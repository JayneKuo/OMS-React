# 剩余颜色修复清单

## 🔍 已修复的组件

✅ **核心UI组件**
- Button组件 - 所有变体使用正确hover颜色
- Dropdown Menu - 菜单项使用primary色系
- Select组件 - focus状态使用primary色系
- Command组件 - 选中状态使用primary色系

✅ **布局组件**
- 租户切换器 (tenant-switcher.tsx)
- 租户商户切换器 (tenant-merchant-switcher.tsx)
- 工作区切换器 (workspace-switcher.tsx)
- 简单租户切换器 (tenant-switcher-simple.tsx)
- 租户切换器优化版 (tenant-switcher-optimized.tsx)

✅ **数据表格组件**
- 筛选栏 (filter-bar.tsx) - hover状态修复

✅ **页面组件**
- 仪表板页面 (dashboard/page.tsx) - 按钮hover状态

## ⚠️ 需要检查的组件

以下组件可能还需要修复，但需要谨慎处理：

### 1. Header Simple组件
- 文件：`components/layout/header-simple.tsx`
- 问题：大量使用accent作为hover和选中状态
- 影响：导航、用户菜单、语言切换等

### 2. Dialog组件
- 文件：`components/ui/dialog.tsx`
- 问题：关闭按钮使用accent状态
- 影响：所有对话框的关闭按钮

### 3. 其他可能的组件
- Tabs组件
- Popover组件
- 各种业务组件

## 🎯 修复原则

1. **Hover状态**: `hover:bg-accent` → `hover:bg-primary-hover/10` 或 `hover:bg-primary-hover/20`
2. **选中状态**: `bg-accent` → `bg-primary/10 border border-primary/20 text-primary`
3. **Focus状态**: `focus:bg-accent` → `focus:bg-primary-hover/10 focus:text-primary`
4. **保留Accent**: 只在真正的CTA按钮和强调元素中使用橙色

## 📝 测试建议

修复后请测试：
1. 所有hover状态是否显示紫色
2. 选中状态是否使用紫色背景
3. 橙色只出现在CTA按钮中
4. 深色模式下颜色是否正确

## 🚀 下一步

建议按优先级修复：
1. **高优先级**: Header Simple组件（影响导航体验）
2. **中优先级**: Dialog组件（影响所有弹窗）
3. **低优先级**: 其他业务组件（逐步优化）