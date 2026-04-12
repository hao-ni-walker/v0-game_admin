-- 频道推广 App 列表（与 TELEGRAM_DATABASE_URL / DB_SCHEMA 下的 schema 一致，如 bot_1）
-- 在目标库执行一次；若使用独立 schema，请先 SET search_path 再执行本脚本。

CREATE TABLE IF NOT EXISTS channel_promoted_apps (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200),
  image_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  page_ranking INT NOT NULL DEFAULT 0,
  page_key VARCHAR(64),
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_channel_promoted_apps_list
  ON channel_promoted_apps (is_enabled, page_ranking DESC, id ASC);

COMMENT ON TABLE channel_promoted_apps IS 'Telegram 频道运营：推广 App 图标、链接与排序';
COMMENT ON COLUMN channel_promoted_apps.image_url IS '图标或封面完整 URL（可先上传至 R2 后粘贴）';
COMMENT ON COLUMN channel_promoted_apps.target_url IS '推广落地页或应用商店链接';
COMMENT ON COLUMN channel_promoted_apps.page_ranking IS '排序权重，数值越大越靠前';
COMMENT ON COLUMN channel_promoted_apps.page_key IS '可选：区分展示页面，如 default、channel_home';
