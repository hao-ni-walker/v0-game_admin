export const DEFAULT_FILTERS = { search: '', is_tradeable: 'all' as const };

export const MESSAGES = {
  SUCCESS: {
    CREATE: '币种已创建',
    UPDATE: '币种已更新',
    DELETE: '币种已删除',
    TOGGLE_ON: '币种已激活',
    TOGGLE_OFF: '币种已停用',
  },
  ERROR: {
    FETCH: '获取币种列表失败',
    CREATE: '创建币种失败',
    UPDATE: '更新币种失败',
    DELETE: '删除币种失败',
    TOGGLE: '操作失败',
  },
  EMPTY: '暂无币种，点击右上角「新增币种」',
  CONFIRM_DELETE: '删除后不可恢复；若该币种已有交易记录，后端会拒绝。确认删除？',
};

export const TRADEABLE_OPTIONS = [
  { label: '全部', value: 'all' as const },
  { label: '可交易', value: 'true' as const },
  { label: '已停用', value: 'false' as const },
];

export const TABLE_COLUMNS = [
  { key: 'code', title: '代码' },
  { key: 'symbol', title: '交易对' },
  { key: 'name', title: '名称' },
  { key: 'is_tradeable', title: '交易状态' },
  { key: 'is_depositable', title: '可充值' },
  { key: 'is_withdrawable', title: '可提现' },
  { key: 'sort_order', title: '排序' },
  { key: 'actions', title: '操作' },
];
