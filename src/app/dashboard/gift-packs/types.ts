/**
 * 礼包道具数据类型
 */
export interface GiftPack {
  id: number;
  item_id: number;
  category: string;
  name: string;
  name_default: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stack_limit: number;
  is_consumable: boolean;
  bind_flag: boolean;
  status: 'active' | 'disabled' | 'archived';
  display_icon?: string;
  display_color?: string;
  sort_weight: number;
  expire_days?: number | null;
  usage_limit?: number | null;
  level_required?: number;
  vip_required?: number;
  extra?: Record<string, any>;
  created_at: string;
  updated_at: string;
  locale?: string;
  locale_overrides?: {
    name?: string;
    description?: string;
    short_desc?: string;
    display_icon?: string;
    extra_locale?: Record<string, any>;
  };
}

/**
 * 礼包筛选条件
 */
export interface GiftPackFilters {
  keyword?: string;
  locale?: string;
  categories?: string[];
  rarities?: string[];
  statuses?: string[];
  is_consumable?: boolean;
  bind_flag?: boolean;
  vip_min?: number;
  vip_max?: number;
  level_min?: number;
  level_max?: number;
  expire_days_max?: number;
  usage_limit_max?: number;
  created_from?: string;
  created_to?: string;
  updated_from?: string;
  updated_to?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

/**
 * 分页信息
 */
export interface PaginationInfo {
  page: number;
  page_size: number;
  total: number;
  totalPages: number;
}

/**
 * 礼包表单数据
 */
export interface GiftPackFormData {
  item_id: number;
  category: string;
  name_default: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stack_limit: number;
  is_consumable: boolean;
  bind_flag: boolean;
  status: 'active' | 'disabled' | 'archived';
  display_icon?: string;
  display_color?: string;
  sort_weight: number;
  expire_days?: number | null;
  usage_limit?: number | null;
  level_required?: number;
  vip_required?: number;
  extra?: Record<string, any>;
}

/**
 * 对话框状态
 */
export type GiftPackDialogType = 'create' | 'edit' | 'view' | null;

export interface GiftPackDialogState {
  type: GiftPackDialogType;
  giftPack: GiftPack | null;
  open: boolean;
}

/**
 * 下拉选项
 */
export interface Option {
  label: string;
  value: string;
  count?: number;
}
