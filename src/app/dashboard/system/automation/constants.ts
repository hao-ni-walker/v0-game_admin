import type { AutomationTaskType } from '@/service/api/automation';

export const MESSAGES = {
  SUCCESS: {
    CREATE: '任务已创建',
    UPDATE: '任务已更新',
    DELETE: '任务已删除',
    TOGGLE_ON: '任务已启用',
    TOGGLE_OFF: '任务已停用',
    RUN: '已触发执行，稍后刷新查看结果',
  },
  ERROR: {
    FETCH: '获取任务列表失败',
    RUNS: '获取执行历史失败',
    CREATE: '创建任务失败',
    UPDATE: '更新任务失败',
    DELETE: '删除任务失败',
    TOGGLE: '操作失败',
    RUN: '触发执行失败',
  },
  EMPTY: '暂无自动化任务，点击右上角「新建任务」',
};

export const TASK_TYPE_OPTIONS: { value: AutomationTaskType; label: string; hint: string }[] = [
  { value: 'db_backup', label: '数据库备份', hint: 'pg_dump 备份 → 校验 → 上传 R2 → 过期清理' },
  { value: 'daily_report', label: '每日报表', hint: '平台运营日报推送到 Telegram 频道' },
  { value: 'shell', label: 'Shell 命令', hint: '在后端容器内定时执行任意 shell 命令' },
  { value: 'python', label: 'Python 脚本', hint: '内联 Python，可使用 db/settings/notify 上下文' },
];

export const TASK_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  TASK_TYPE_OPTIONS.map((o) => [o.value, o.label])
);

export const CRON_PRESETS = [
  { label: '每天 03:00（UTC）', value: '0 3 * * *' },
  { label: '每天 08:00（UTC）', value: '0 8 * * *' },
  { label: '每 6 小时', value: '0 */6 * * *' },
  { label: '每小时', value: '0 * * * *' },
  { label: '每周一 08:00（UTC）', value: '0 8 * * 1' },
];

export const STATUS_BADGES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  running: { label: '运行中', variant: 'secondary' },
  success: { label: '成功', variant: 'default' },
  failed: { label: '失败', variant: 'destructive' },
};

export const TRIGGER_LABELS: Record<string, string> = {
  scheduled: '定时',
  manual: '手动',
};

export const TASK_TABLE_COLUMNS = [
  { key: 'name', title: '任务名称' },
  { key: 'task_type', title: '类型' },
  { key: 'schedule', title: '调度 (cron UTC)' },
  { key: 'next_run_at', title: '下次运行' },
  { key: 'last_status', title: '最近结果' },
  { key: 'enabled', title: '状态' },
  { key: 'actions', title: '操作' },
];

export const RUNS_TABLE_COLUMNS = [
  { key: 'id', title: 'ID' },
  { key: 'task_name', title: '任务' },
  { key: 'trigger', title: '触发' },
  { key: 'status', title: '状态' },
  { key: 'started_at', title: '开始时间' },
  { key: 'duration_ms', title: '耗时' },
  { key: 'artifacts', title: '产物' },
  { key: 'actions', title: '输出' },
];
