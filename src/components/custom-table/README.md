# Custom Table 组件库

这个目录包含了用于构建数据管理页面的通用表格组件。

## 组件列表

### 🔍 SearchFilter

**动态搜索和筛选组件**

- 支持多种字段类型：文本搜索、下拉选择、日期范围
- 内置防抖功能（默认500ms）
- 自动清空筛选功能

```tsx
// 定义筛选字段
const filterFields: FilterField[] = [
  {
    key: 'username',
    type: 'text',
    label: '用户名',
    placeholder: '搜索用户名...',
    width: 'w-80'
  },
  {
    key: 'roleName',
    type: 'select',
    label: '角色',
    placeholder: '全部角色',
    options: roleOptions,
    width: 'w-40'
  },
  {
    key: 'dateRange',
    type: 'dateRange',
    label: '创建时间',
    placeholder: '选择日期范围',
    width: 'w-60'
  }
];

<SearchFilter
  fields={filterFields}
  values={filters}
  onValuesChange={(newValues) => updateFilters(newValues)}
  debounceDelay={500}
/>;
```

### 📊 DataTable

**数据表格组件**

- 支持自定义列配置
- 骨架屏加载状态
- 支持自定义渲染函数

```tsx
<DataTable
  columns={columns}
  data={users}
  loading={loading}
  emptyText='暂无数据'
  rowKey='id'
/>
```

### 💀 TableSkeleton

**表格骨架屏组件**

- 优雅的加载状态展示
- 可配置行列数量
- 自动适配表格布局

```tsx
<TableSkeleton columnCount={6} rowCount={8} showHeader={true} />
```

### 🔧 工具函数

**时间格式化和通用工具**

```tsx
import {
  formatDateTime,
  formatDate,
  hasActiveFilters
} from '@/components/custom-table';

// 格式化完整的日期时间（年月日时分秒）
const formattedDateTime = formatDateTime('2024-01-01T12:30:45Z');
// 输出: "2024-01-01 12:30:45"

// 格式化日期（仅年月日）
const formattedDate = formatDate('2024-01-01T12:30:45Z');
// 输出: "2024-01-01"

// 检查是否有活跃的筛选条件
const hasFilters = hasActiveFilters({ name: '', status: 'active' });
// 输出: true
```

### 📄 Pagination

**分页组件**

- 页码导航
- 页大小选择
- 自定义页大小选项

```tsx
<Pagination
  pagination={pagination}
  onPageChange={(page) => updateFilters({ page })}
  onPageSizeChange={(limit) => updateFilters({ limit, page: 1 })}
  pageSizeOptions={[10, 20, 30, 50, 100]}
/>
```

### ⚡ ActionDropdown

**操作下拉菜单组件**

- 自定义操作项
- 内置删除确认对话框
- 支持图标和样式定制

```tsx
<ActionDropdown actions={actions} deleteAction={deleteAction} />
```

### 📋 PageHeader

**页面头部组件**

- 标题和描述
- 操作按钮
- 可扩展内容

```tsx
<PageHeader
  title='用户管理'
  description='管理系统用户账户和权限'
  action={{
    label: '新增用户',
    onClick: () => setCreateDialogOpen(true),
    icon: <Plus className='mr-2 h-4 w-4' />
  }}
/>
```

## 使用方式

### 统一导入

```tsx
import {
  SearchFilter,
  DataTable,
  Pagination,
  ActionDropdown,
  PageHeader,
  TableSkeleton,
  formatDateTime,
  formatDate,
  hasActiveFilters,
  type ActionItem,
  type DeleteAction,
  type FilterField,
  type FilterOption
} from '@/components/custom-table';
```

### 单独导入

```tsx
import { SearchFilter } from '@/components/custom-table/search-filter';
import { DataTable } from '@/components/custom-table/data-table';
```

## 完整示例

参考以下文件了解完整用法：

- `src/app/dashboard/account/user/page.tsx` - 用户管理页面
- `src/app/dashboard/account/role/page.tsx` - 角色管理页面

## 扩展指南

这些组件可以用于构建各种数据管理页面：

- 权限管理
- 菜单管理
- 日志管理
- 其他CRUD页面

只需要定义好数据类型、列配置和相关操作函数即可快速构建功能完整的管理界面。

## 新增功能

### ✨ 防抖搜索

`SearchFilter` 组件现在内置防抖功能，避免频繁的API请求：

```tsx
<SearchFilter
  fields={filterFields}
  values={filters}
  onValuesChange={(newValues) => updateFilters(newValues)}
  debounceDelay={500} // 500ms防抖延迟
/>
```

### 📅 日期范围筛选

支持日期范围选择，适用于时间段筛选：

```tsx
{
  key: 'dateRange',
  type: 'dateRange',
  label: '创建时间',
  placeholder: '选择日期范围',
  width: 'w-60'
}
```

### ⏰ 时间格式化

使用内置工具函数统一格式化时间显示：

```tsx
// 在列配置中使用
{
  key: 'createdAt',
  title: '创建时间',
  render: (value: string) => formatDateTime(value) // 显示完整时间
}
```
