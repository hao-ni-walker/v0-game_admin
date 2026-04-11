-- 频道关键词自动回复规则（与 TELEGRAM_DATABASE_URL / DB_SCHEMA 下的 schema 一致，如 bot_1）
-- 在目标库执行一次即可。

CREATE TABLE IF NOT EXISTS channel_reply_rules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200),
  keywords TEXT NOT NULL,
  match_mode VARCHAR(20) NOT NULL DEFAULT 'contains',
  reply_text TEXT NOT NULL,
  priority INT NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT channel_reply_rules_match_mode_check CHECK (match_mode IN ('contains', 'equals'))
);

CREATE INDEX IF NOT EXISTS idx_channel_reply_rules_enabled_priority
  ON channel_reply_rules (is_enabled, priority DESC);

COMMENT ON TABLE channel_reply_rules IS 'Telegram 频道：用户消息关键词 -> 自动回复文案';
COMMENT ON COLUMN channel_reply_rules.keywords IS '多个关键词用英文或中文逗号分隔，任一命中即触发（在 match_mode 下）';
COMMENT ON COLUMN channel_reply_rules.priority IS '数字越大越优先；多条规则同时命中时取优先级最高的一条';
