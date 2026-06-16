'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { MessageAPI } from '@/service/request';
import { DEFAULT_PAGINATION, MESSAGES } from '../constants';
import type {
  Message,
  MessageFormData,
  MessageFilters,
  MessagePagination,
} from '../types';

export function useMessageManagement() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<MessagePagination>({
    page: DEFAULT_PAGINATION.page,
    size: DEFAULT_PAGINATION.page_size,
    total: 0,
    has_more: false,
  });
  const [detailMessage, setDetailMessage] = useState<Message | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

  const fetchMessages = useCallback(async (filters: MessageFilters) => {
    if (!filters.user_id) {
      setMessages([]);
      setPagination((p) => ({ ...p, total: 0 }));
      return;
    }
    setLoading(true);
    try {
      const res = await MessageAPI.getList({
        user_id: filters.user_id,
        category: filters.category || undefined,
        page: filters.page,
        page_size: filters.page_size,
      });
      if (res.success && res.data) {
        setMessages(res.data.list);
        setPagination(res.data.pagination);
      } else {
        toast.error(MESSAGES.ERROR.FETCH);
      }
    } catch {
      toast.error(MESSAGES.ERROR.FETCH);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (data: MessageFormData): Promise<boolean> => {
      const res = await MessageAPI.send(data);
      if (res.success) {
        toast.success(MESSAGES.SUCCESS.SEND);
        return true;
      }
      toast.error(res.message || MESSAGES.ERROR.SEND);
      return false;
    },
    []
  );

  const recallMessage = useCallback(
    async (messageId: string): Promise<boolean> => {
      const res = await MessageAPI.recall(messageId);
      if (res.success) {
        toast.success(MESSAGES.SUCCESS.RECALL);
        return true;
      }
      toast.error(res.message || MESSAGES.ERROR.RECALL);
      return false;
    },
    []
  );

  const openDetail = useCallback((msg: Message) => {
    setDetailMessage(msg);
    setDetailOpen(true);
  }, []);
  const closeDetail = useCallback(() => setDetailOpen(false), []);
  const openCompose = useCallback(() => setComposeOpen(true), []);
  const closeCompose = useCallback(() => setComposeOpen(false), []);

  return {
    messages,
    loading,
    pagination,
    detailMessage,
    detailOpen,
    openDetail,
    closeDetail,
    composeOpen,
    openCompose,
    closeCompose,
    fetchMessages,
    sendMessage,
    recallMessage,
  };
}
