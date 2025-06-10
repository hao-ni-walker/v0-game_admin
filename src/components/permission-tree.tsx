'use client';

import React, { useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Shield
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface Permission {
  id: number;
  name: string;
  code: string;
  description?: string;
  parentId?: number;
  sortOrder?: number;
  children?: Permission[];
}

interface PermissionTreeProps {
  permissions: Permission[];
  selectedIds: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  disabled?: boolean;
}

interface PermissionNodeProps {
  permission: Permission;
  level: number;
  isSelected: boolean;
  isIndeterminate: boolean;
  onToggle: (permission: Permission, checked: boolean) => void;
  disabled?: boolean;
}

interface PermissionNodeInternalProps extends PermissionNodeProps {
  selectedIds: number[];
  onSelectionChange: (selectedIds: number[]) => void;
}

function PermissionNode({
  permission,
  level,
  isSelected,
  isIndeterminate,
  onToggle,
  selectedIds,
  onSelectionChange,
  disabled = false
}: PermissionNodeInternalProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = permission.children && permission.children.length > 0;
  const isLeaf = !hasChildren;

  const handleToggle = (checked: boolean) => {
    onToggle(permission, checked);
  };

  const handleExpand = () => {
    if (!hasChildren) return;
    setIsExpanded(!isExpanded);
  };

  return (
    <div className='permission-node'>
      <div
        className={cn(
          'flex items-center gap-2 rounded px-2 py-2 transition-colors',
          'group hover:bg-gray-50',
          level > 0 && 'ml-4',
          isSelected && 'bg-blue-50',
          isIndeterminate && 'bg-yellow-50'
        )}
      >
        {/* 展开/折叠按钮 */}
        <button
          onClick={handleExpand}
          className={cn(
            'flex h-4 w-4 items-center justify-center transition-transform',
            !hasChildren && 'invisible'
          )}
          disabled={disabled}
        >
          {hasChildren &&
            (isExpanded ? (
              <ChevronDown className='h-3 w-3 text-gray-500' />
            ) : (
              <ChevronRight className='h-3 w-3 text-gray-500' />
            ))}
        </button>

        {/* 图标 */}
        <div className='flex h-4 w-4 items-center justify-center'>
          {isLeaf ? (
            <Shield className='h-3 w-3 text-blue-500' />
          ) : isExpanded ? (
            <FolderOpen className='h-3 w-3 text-orange-500' />
          ) : (
            <Folder className='h-3 w-3 text-orange-500' />
          )}
        </div>

        {/* 复选框 */}
        <Checkbox
          id={`permission-${permission.id}`}
          checked={isSelected}
          onCheckedChange={handleToggle}
          disabled={disabled}
          className={cn(
            'transition-colors',
            isIndeterminate &&
              'data-[state=unchecked]:border-blue-500 data-[state=unchecked]:bg-blue-100'
          )}
        />

        {/* 权限信息 */}
        <div className='min-w-0 flex-1'>
          <label
            htmlFor={`permission-${permission.id}`}
            className={cn(
              'cursor-pointer text-sm',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <span className='font-medium'>{permission.name}</span>
            <span className='ml-2 text-xs text-gray-500'>
              ({permission.code})
            </span>
          </label>
          {permission.description && (
            <div className='mt-0.5 text-xs text-gray-400'>
              {permission.description}
            </div>
          )}
        </div>
      </div>

      {/* 子权限 */}
      {hasChildren && isExpanded && (
        <div className='permission-children'>
          {permission.children!.map((child) => (
            <PermissionTreeItem
              key={child.id}
              permission={child}
              level={level + 1}
              selectedIds={selectedIds}
              onSelectionChange={onSelectionChange}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// 包装组件，用于处理选中状态
function PermissionTreeItem({
  permission,
  level,
  selectedIds,
  onSelectionChange,
  disabled
}: {
  permission: Permission;
  level: number;
  selectedIds: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  disabled?: boolean;
}) {
  const isSelected = selectedIds.includes(permission.id);

  // 计算是否为半选状态（部分子项被选中）
  const getIndeterminateState = useCallback(
    (perm: Permission): boolean => {
      if (!perm.children || perm.children.length === 0) return false;

      const hasSelectedChildren = perm.children.some(
        (child) =>
          selectedIds.includes(child.id) || getIndeterminateState(child)
      );
      const allChildrenSelected = perm.children.every(
        (child) =>
          selectedIds.includes(child.id) ||
          (child.children &&
            child.children.length > 0 &&
            getAllDescendantIds(child).every((id) => selectedIds.includes(id)))
      );

      return hasSelectedChildren && !allChildrenSelected;
    },
    [selectedIds]
  );

  // 获取所有后代权限ID
  const getAllDescendantIds = useCallback((perm: Permission): number[] => {
    let ids = [perm.id];
    if (perm.children) {
      perm.children.forEach((child) => {
        ids = ids.concat(getAllDescendantIds(child));
      });
    }
    return ids;
  }, []);

  const isIndeterminate = getIndeterminateState(permission);

  const handleToggle = (perm: Permission, checked: boolean) => {
    const descendantIds = getAllDescendantIds(perm);
    let newSelectedIds = [...selectedIds];

    if (checked) {
      // 选中：添加当前权限及所有子权限
      descendantIds.forEach((id) => {
        if (!newSelectedIds.includes(id)) {
          newSelectedIds.push(id);
        }
      });

      // 检查是否需要自动选中父权限
      newSelectedIds = autoSelectParents(perm, newSelectedIds);
    } else {
      // 取消选中：移除当前权限及所有子权限
      newSelectedIds = newSelectedIds.filter(
        (id) => !descendantIds.includes(id)
      );

      // 检查是否需要自动取消父权限
      newSelectedIds = autoDeselectParents(perm, newSelectedIds);
    }

    onSelectionChange(newSelectedIds);
  };

  // 自动选中父权限（当所有兄弟权限都被选中时）
  const autoSelectParents = (
    perm: Permission,
    currentSelectedIds: number[]
  ): number[] => {
    // 这里需要找到父权限，但树形组件中没有直接的父引用
    // 暂时保持现有逻辑，可以在后续优化中添加父权限自动选择逻辑
    return currentSelectedIds;
  };

  // 自动取消父权限（当父权限被选中但子权限被取消时）
  const autoDeselectParents = (
    perm: Permission,
    currentSelectedIds: number[]
  ): number[] => {
    // 暂时保持现有逻辑
    return currentSelectedIds;
  };

  return (
    <PermissionNode
      permission={permission}
      level={level}
      isSelected={isSelected}
      isIndeterminate={isIndeterminate}
      onToggle={handleToggle}
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
      disabled={disabled}
    />
  );
}

export function PermissionTree({
  permissions,
  selectedIds,
  onSelectionChange,
  disabled = false
}: PermissionTreeProps) {
  // 构建树形结构
  const buildTree = useCallback((perms: Permission[]): Permission[] => {
    const permMap = new Map<number, Permission>();
    const rootPerms: Permission[] = [];

    // 先创建所有权限的映射，并初始化children数组
    perms.forEach((perm) => {
      permMap.set(perm.id, { ...perm, children: [] });
    });

    // 构建树形结构
    perms.forEach((perm) => {
      const permNode = permMap.get(perm.id)!;

      if (perm.parentId && permMap.has(perm.parentId)) {
        // 有父权限，添加到父权限的children中
        const parent = permMap.get(perm.parentId)!;
        parent.children!.push(permNode);
      } else {
        // 没有父权限，是根节点
        rootPerms.push(permNode);
      }
    });

    // 对每个级别进行排序
    const sortPerms = (perms: Permission[]) => {
      perms.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      perms.forEach((perm) => {
        if (perm.children && perm.children.length > 0) {
          sortPerms(perm.children);
        }
      });
    };

    sortPerms(rootPerms);
    return rootPerms;
  }, []);

  const treeData = buildTree(permissions);

  if (treeData.length === 0) {
    return <div className='py-8 text-center text-gray-500'>暂无权限数据</div>;
  }

  return (
    <div className='permission-tree space-y-1'>
      {treeData.map((rootPermission) => (
        <PermissionTreeItem
          key={rootPermission.id}
          permission={rootPermission}
          level={0}
          selectedIds={selectedIds}
          onSelectionChange={onSelectionChange}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
