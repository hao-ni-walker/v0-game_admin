/**
 * 游戏数据类型
 */
export interface Game {
  id: number;
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
  removed: boolean;
  play_count: number;
  popularity_score?: number;
  created_at: string;
  updated_at: string;
  last_played_at?: string;
}

/**
 * 游戏筛选条件
 */
export interface GameFilters {
  keyword?: string;
  provider_codes?: string[];
  categories?: string[];
  lang?: string;
  status?: boolean | 'all';
  is_new?: boolean;
  is_featured?: boolean;
  is_mobile_supported?: boolean;
  is_demo_available?: boolean;
  has_jackpot?: boolean;
  min_bet_min?: number;
  min_bet_max?: number;
  max_bet_min?: number;
  max_bet_max?: number;
  rtp_min?: number;
  rtp_max?: number;
  supported_language?: string;
  supported_currency?: string;
  created_from?: string;
  created_to?: string;
  updated_from?: string;
  updated_to?: string;
  last_played_from?: string;
  last_played_to?: string;
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
