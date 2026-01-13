/**
 * 游戏数据类型
 */
export interface Game {
  id: number;
  game_id: string;
  name: string;
  lang: string;
  category: string;
  provider_code: string | null;
  min_bet?: number | string;
  max_bet?: number | string;
  rtp?: number | null;
  icon_url?: string | null;
  thumbnail_url?: string | null;
  background_url?: string;
  description?: string;
  rules?: string;
  supported_languages?: string[];
  supported_currencies?: string[];
  is_mobile_supported: boolean;
  is_demo_available: boolean;
  has_jackpot: boolean;
  has_bonus_game: boolean;
  status: boolean;
  is_featured: boolean;
  is_new: boolean;
  sort_order: number;
  removed?: boolean;
  disabled?: boolean;
  play_count: number;
  popularity_score?: number | string;
  created_at: string;
  updated_at: string;
  last_played_at?: string | null;
}

/**
 * 游戏筛选条件
 * 注意：内部使用友好的字段名，在发送到 API 时会映射到正确的参数名
 */
export interface GameFilters {
  // 搜索字段（UI 使用，映射到 API 的 name 或 game_id）
  keyword?: string;
  game_id?: string;
  name?: string;

  // 分类和供应商（UI 使用数组，API 使用单个值）
  provider_codes?: string[];
  provider_code?: string; // API 参数
  categories?: string[];
  category?: string; // API 参数

  lang?: string;
  status?: boolean | 'all';
  disabled?: boolean | 'all';
  is_new?: boolean;
  is_featured?: boolean;
  is_mobile_supported?: boolean;
  is_demo_available?: boolean;
  has_jackpot?: boolean;
  platform_id?: string;

  // 下注和 RTP 范围
  min_bet_min?: number;
  min_bet_max?: number;
  max_bet_min?: number;
  max_bet_max?: number;
  rtp_min?: number;
  rtp_max?: number;

  // 支持的语言和货币
  supported_language?: string;
  supported_currency?: string;

  // 时间范围（UI 使用友好名称，API 使用标准名称）
  created_from?: string;
  created_to?: string;
  created_at_start?: string; // API 参数
  created_at_end?: string; // API 参数

  updated_from?: string;
  updated_to?: string;
  updated_at_start?: string; // API 参数
  updated_at_end?: string; // API 参数

  last_played_from?: string;
  last_played_to?: string;

  // 排序
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  sort_order?: 'asc' | 'desc'; // API 参数

  // 分页
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
 * 游戏表单数据
 */
export interface GameFormData {
  game_id: string;
  name: string;
  lang: string;
  category: string;
  provider_code: string;
  min_bet?: number;
  max_bet?: number;
  rtp?: number;
  icon_url?: string;
  thumbnail_url?: string;
  background_url?: string;
  description?: string;
  rules?: string;
  supported_languages: string[];
  supported_currencies: string[];
  is_mobile_supported: boolean;
  is_demo_available: boolean;
  has_jackpot: boolean;
  has_bonus_game: boolean;
  status: boolean;
  is_featured: boolean;
  is_new: boolean;
  sort_order: number;
}

/**
 * 对话框状态
 */
export type GameDialogType = 'create' | 'edit' | 'view' | null;

export interface GameDialogState {
  type: GameDialogType;
  game: Game | null;
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
