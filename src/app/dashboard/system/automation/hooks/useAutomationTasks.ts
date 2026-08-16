'use client';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { AutomationAPI } from '@/service/request';
import { MESSAGES } from '../constants';
import type { AutomationTask, AutomationTaskFormData, AutomationTaskUpdateData } from '../types';

export function useAutomationTasks() {
  const [tasks, setTasks] = useState<AutomationTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [compose, setCompose] = useState<{ open: boolean; mode: 'create' | 'edit'; editing: AutomationTask | null }>({
    open: false,
    mode: 'create',
    editing: null,
  });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AutomationAPI.getTasks();
      if (res.success && res.data) {
        setTasks(res.data.items);
      } else {
        toast.error(MESSAGES.ERROR.FETCH);
      }
    } catch {
      toast.error(MESSAGES.ERROR.FETCH);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (data: AutomationTaskFormData, reason: string): Promise<boolean> => {
    const res = await AutomationAPI.createTask({ ...data, reason });
    if (res.success) {
      toast.success(MESSAGES.SUCCESS.CREATE);
      return true;
    }
    toast.error(res.message || MESSAGES.ERROR.CREATE);
    return false;
  }, []);

  const updateTask = useCallback(async (id: number, data: AutomationTaskUpdateData, reason: string): Promise<boolean> => {
    const res = await AutomationAPI.updateTask(id, { ...data, reason });
    if (res.success) {
      toast.success(MESSAGES.SUCCESS.UPDATE);
      return true;
    }
    toast.error(res.message || MESSAGES.ERROR.UPDATE);
    return false;
  }, []);

  const deleteTask = useCallback(async (id: number): Promise<boolean> => {
    const res = await AutomationAPI.deleteTask(id);
    if (res.success) {
      toast.success(MESSAGES.SUCCESS.DELETE);
      return true;
    }
    toast.error(res.message || MESSAGES.ERROR.DELETE);
    return false;
  }, []);

  const toggleTask = useCallback(async (task: AutomationTask): Promise<boolean> => {
    const res = await AutomationAPI.toggleTask(task.id);
    if (res.success && res.data) {
      toast.success(res.data.enabled ? MESSAGES.SUCCESS.TOGGLE_ON : MESSAGES.SUCCESS.TOGGLE_OFF);
      return true;
    }
    toast.error(res.message || MESSAGES.ERROR.TOGGLE);
    return false;
  }, []);

  const runTask = useCallback(async (task: AutomationTask): Promise<boolean> => {
    const res = await AutomationAPI.runTask(task.id);
    if (res.success && res.data) {
      if (res.data.triggered) {
        toast.success(MESSAGES.SUCCESS.RUN);
      } else {
        toast.warning(res.data.message || '任务正在执行中');
      }
      return true;
    }
    toast.error(res.message || MESSAGES.ERROR.RUN);
    return false;
  }, []);

  const openCreate = useCallback(() => setCompose({ open: true, mode: 'create', editing: null }), []);
  const openEdit = useCallback((t: AutomationTask) => setCompose({ open: true, mode: 'edit', editing: t }), []);
  const closeCompose = useCallback(() => setCompose({ open: false, mode: 'create', editing: null }), []);

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    runTask,
    compose,
    openCreate,
    openEdit,
    closeCompose,
  };
}
