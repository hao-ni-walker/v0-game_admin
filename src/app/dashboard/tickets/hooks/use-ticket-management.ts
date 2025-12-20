import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { TicketAPI, type TicketListParams } from '@/service/api/ticket';
import type { Ticket, TicketStatus } from '@/repository/models';

interface PaginationState {
  page: number;
  page_size: number;
  total: number;
}

export function useTicketManagement() {
  const [tickets, setTickets] = useState<
    (Ticket & { sla?: { isOverdue: boolean; remainingMinutes: number } })[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    page_size: 20,
    total: 0
  });

  const fetchTickets = useCallback(async (params: TicketListParams) => {
    setLoading(true);
    try {
      console.log('[工单管理] 请求参数:', params);
      const response = await TicketAPI.getTickets(params);
      console.log('[工单管理] API 响应:', response);
      if (response.success && response.data) {
        // 远程 API 返回的是 items 而不是 list
        const items = response.data.items || response.data.list || [];
        console.log('[工单管理] 工单数据:', items);
        console.log('[工单管理] 工单数量:', items.length);
        setTickets(items);
        setPagination({
          page: response.data.page || 1,
          page_size: response.data.page_size || 20,
          total: response.data.total || 0
        });
      } else {
        console.error('[工单管理] 响应失败:', response);
        toast.error(response.message || '获取工单列表失败');
      }
    } catch (error) {
      console.error('获取工单列表失败:', error);
      toast.error('获取工单列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTickets = useCallback(
    async (params: TicketListParams) => {
      await fetchTickets(params);
      toast.success('数据已刷新');
    },
    [fetchTickets]
  );

  const deleteTicket = useCallback(async (id: number) => {
    try {
      const response = await TicketAPI.deleteTicket(id);
      if (response.success) {
        toast.success('工单删除成功');
        return true;
      } else {
        toast.error(response.message || '删除工单失败');
        return false;
      }
    } catch (error) {
      console.error('删除工单失败:', error);
      toast.error('删除工单失败');
      return false;
    }
  }, []);

  const assignTicket = useCallback(
    async (id: number, assigneeId: number | null) => {
      try {
        const response = await TicketAPI.assignTicket(id, assigneeId);
        if (response.success) {
          toast.success('工单指派成功');
          return true;
        } else {
          toast.error(response.message || '指派工单失败');
          return false;
        }
      } catch (error) {
        console.error('指派工单失败:', error);
        toast.error('指派工单失败');
        return false;
      }
    },
    []
  );

  const changeStatus = useCallback(
    async (id: number, status: TicketStatus, reason?: string) => {
      try {
        const response = await TicketAPI.changeTicketStatus(id, status, reason);
        if (response.success) {
          toast.success('状态更改成功');
          return true;
        } else {
          toast.error(response.message || '更改状态失败');
          return false;
        }
      } catch (error) {
        console.error('更改状态失败:', error);
        toast.error('更改状态失败');
        return false;
      }
    },
    []
  );

  return {
    tickets,
    loading,
    pagination,
    fetchTickets,
    refreshTickets,
    deleteTicket,
    assignTicket,
    changeStatus
  };
}
