'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/shared/heading';
import { PlayerTable } from './components/player-table';
import { PlayerFilters } from './components/player-filters';

export default function PlayersPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Heading
            title="玩家管理"
            description="查看和管理所有玩家账户信息"
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              {filtersOpen ? '隐藏筛选' : '显示筛选'}
            </Button>
          </div>
        </div>

        {filtersOpen && <PlayerFilters />}

        <PlayerTable />
      </div>
    </PageContainer>
  );
}
