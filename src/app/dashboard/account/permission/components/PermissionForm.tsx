'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useState, useEffect, useMemo } from 'react';
import { Permission, PermissionFormData } from '../types';
import { PermissionAPI } from '@/service/api/permission';

interface PermissionFormProps {
  /** 初始数据（编辑时） */
  initialData?: Permission;
  /** 提交回调 */
  onSubmit: (values: PermissionFormData) => void;
  /** 取消回调 */
  onCancel?: () => void;
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 权限表单组件
 * 用于创建和编辑权限
 */
export function PermissionForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false
}: PermissionFormProps) {
  // 获取父级权限ID（兼容新旧字段名）
  const getParentId = (perm?: Permission): number | null => {
    if (!perm) return null;
    return perm.parent_id ?? perm.parentId ?? null;
  };

  // 获取排序值（兼容新旧字段名）
  const getSortOrder = (perm?: Permission): number => {
    if (!perm) return 0;
    return perm.sort_order ?? perm.sortOrder ?? 0;
  };

  const [formData, setFormData] = useState<PermissionFormData>({
    name: initialData?.name || '',
    code: initialData?.code || '',
    description: initialData?.description || '',
    parent_id: getParentId(initialData),
    sort_order: getSortOrder(initialData)
  });

  // 父级权限选项列表
  const [parentOptions, setParentOptions] = useState<
    Array<{ id: number; name: string; code: string; level: number }>
  >([]);
  const [loadingParents, setLoadingParents] = useState(false);

  // 加载父级权限选项
  useEffect(() => {
    const loadParentOptions = async () => {
      setLoadingParents(true);
      try {
        const res = await PermissionAPI.getAllPermissions();
        if (res.code === 0 && res.data) {
          const permissions = res.data as Permission[];

          // 构建树形结构用于显示层级
          const buildTreeOptions = (
            perms: Permission[],
            parentId: number | null = null,
            level: number = 0
          ): Array<{
            id: number;
            name: string;
            code: string;
            level: number;
          }> => {
            const options: Array<{
              id: number;
              name: string;
              code: string;
              level: number;
            }> = [];

            perms
              .filter((p) => {
                const pid = p.parent_id ?? p.parentId ?? null;
                return pid === parentId;
              })
              .sort((a, b) => {
                const aOrder = a.sort_order ?? a.sortOrder ?? 0;
                const bOrder = b.sort_order ?? b.sortOrder ?? 0;
                return aOrder - bOrder;
              })
              .forEach((perm) => {
                // 编辑时，排除当前权限及其所有子权限（避免循环引用）
                if (initialData && perm.id === initialData.id) {
                  return;
                }

                options.push({
                  id: perm.id,
                  name: perm.name,
                  code: perm.code,
                  level
                });

                // 递归添加子权限
                const children = buildTreeOptions(perms, perm.id, level + 1);
                options.push(...children);
              });

            return options;
          };

          const options = buildTreeOptions(permissions);
          setParentOptions(options);
        }
      } catch (error) {
        console.error('加载父级权限失败:', error);
      } finally {
        setLoadingParents(false);
      }
    };

    loadParentOptions();
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNumberChange = (name: 'sort_order', value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (!isNaN(numValue)) {
      setFormData({
        ...formData,
        [name]: numValue
      });
    }
  };

  const handleParentChange = (value: string) => {
    setFormData({
      ...formData,
      parent_id: value === 'none' ? null : parseInt(value, 10)
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // 格式化父级权限显示文本
  const formatParentOption = (option: {
    id: number;
    name: string;
    code: string;
    level: number;
  }) => {
    const indent = '  '.repeat(option.level);
    return `${indent}${option.name} (${option.code})`;
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid gap-2'>
        <Label htmlFor='name'>
          权限名称 <span className='text-destructive'>*</span>
        </Label>
        <Input
          id='name'
          name='name'
          value={formData.name}
          onChange={handleChange}
          placeholder='请输入权限名称'
          className='h-9'
          required
          disabled={loading}
        />
      </div>

      <div className='grid gap-2'>
        <Label htmlFor='code'>
          权限编码 <span className='text-destructive'>*</span>
        </Label>
        <Input
          id='code'
          name='code'
          value={formData.code}
          onChange={handleChange}
          placeholder='请输入权限编码，如：system:user:list'
          className='h-9 font-mono'
          required
          disabled={loading}
        />
      </div>

      <div className='grid gap-2'>
        <Label htmlFor='description'>描述</Label>
        <Textarea
          id='description'
          name='description'
          value={formData.description || ''}
          onChange={handleChange}
          placeholder='请输入权限描述'
          className='min-h-[80px] resize-none'
          disabled={loading}
        />
      </div>

      <div className='grid gap-2'>
        <Label htmlFor='parent_id'>父级权限</Label>
        <Select
          value={
            formData.parent_id === null ? 'none' : formData.parent_id.toString()
          }
          onValueChange={handleParentChange}
          disabled={loading || loadingParents}
        >
          <SelectTrigger className='h-9 w-full'>
            <SelectValue placeholder='选择父级权限（可选）' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='none'>无（顶级权限）</SelectItem>
            {parentOptions.map((option) => (
              <SelectItem key={option.id} value={option.id.toString()}>
                {formatParentOption(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className='text-muted-foreground text-xs'>
          选择父级权限以构建权限层级结构
        </p>
      </div>

      <div className='grid gap-2'>
        <Label htmlFor='sort_order'>排序值</Label>
        <Input
          id='sort_order'
          name='sort_order'
          type='number'
          value={formData.sort_order}
          onChange={(e) => handleNumberChange('sort_order', e.target.value)}
          placeholder='0'
          className='h-9'
          disabled={loading}
        />
        <p className='text-muted-foreground text-xs'>
          数字越小越靠前，默认为 0
        </p>
      </div>

      <div className='flex justify-end gap-2 pt-2'>
        {onCancel && (
          <Button
            type='button'
            variant='outline'
            className='cursor-pointer'
            onClick={onCancel}
            disabled={loading}
          >
            取消
          </Button>
        )}
        <Button type='submit' className='cursor-pointer' disabled={loading}>
          {loading ? '提交中...' : '提交'}
        </Button>
      </div>
    </form>
  );
}
