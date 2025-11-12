'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { usePlayerFilters } from '../hooks/use-player-filters';

export function PlayerFilters() {
  const { filters, updateFilter, resetFilters, applyFilters } = usePlayerFilters();

  return (
    <Card className="p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="keyword">关键词搜索</Label>
          <Input
            id="keyword"
            placeholder="用户名/邮箱/ID"
            value={filters.keyword || ''}
            onChange={(e) => updateFilter('keyword', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">账户状态</Label>
          <Select
            value={filters.status === undefined ? 'all' : String(filters.status)}
            onValueChange={(value) => {
              if (value === 'all') {
                updateFilter('status', undefined);
              } else {
                updateFilter('status', value === 'true');
              }
            }}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="true">启用</SelectItem>
              <SelectItem value="false">停用</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vipMin">VIP等级(最小)</Label>
          <Input
            id="vipMin"
            type="number"
            placeholder="最小等级"
            value={filters.vipMin || ''}
            onChange={(e) => updateFilter('vipMin', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vipMax">VIP等级(最大)</Label>
          <Input
            id="vipMax"
            type="number"
            placeholder="最大等级"
            value={filters.vipMax || ''}
            onChange={(e) => updateFilter('vipMax', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="balanceMin">余额(最小)</Label>
          <Input
            id="balanceMin"
            type="number"
            step="0.01"
            placeholder="最小余额"
            value={filters.balanceMin || ''}
            onChange={(e) => updateFilter('balanceMin', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="balanceMax">余额(最大)</Label>
          <Input
            id="balanceMax"
            type="number"
            step="0.01"
            placeholder="最大余额"
            value={filters.balanceMax || ''}
            onChange={(e) => updateFilter('balanceMax', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="identityCategory">身份类别</Label>
          <Select
            value={filters.identityCategory || 'all'}
            onValueChange={(value) => updateFilter('identityCategory', value === 'all' ? undefined : value)}
          >
            <SelectTrigger id="identityCategory">
              <SelectValue placeholder="全部类别" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类别</SelectItem>
              <SelectItem value="user">普通用户</SelectItem>
              <SelectItem value="agent">代理</SelectItem>
              <SelectItem value="internal">内部账号</SelectItem>
              <SelectItem value="test">测试账号</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="registrationMethod">注册方式</Label>
          <Select
            value={filters.registrationMethod || 'all'}
            onValueChange={(value) => updateFilter('registrationMethod', value === 'all' ? undefined : value)}
          >
            <SelectTrigger id="registrationMethod">
              <SelectValue placeholder="全部方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部方式</SelectItem>
              <SelectItem value="email">邮箱</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="phone">手机</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="other">其他</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={resetFilters}>
          重置
        </Button>
        <Button onClick={applyFilters}>应用筛选</Button>
      </div>
    </Card>
  );
}
