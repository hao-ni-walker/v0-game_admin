import 'server-only';

import { query } from '@/lib/db';

export type ChannelReplyRule = {
  id: number;
  name: string | null;
  keywords: string;
  match_mode: string;
  reply_text: string;
  priority: number;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
};

function splitKeywords(raw: string): string[] {
  return raw
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * 按 priority 降序已排好序的规则列表，返回第一条命中的规则。
 */
export function matchUserTextToRule(
  rules: ChannelReplyRule[],
  userText: string
): ChannelReplyRule | null {
  const normalized = userText.trim();
  if (!normalized) return null;
  const lower = normalized.toLowerCase();

  for (const row of rules) {
    const kws = splitKeywords(row.keywords);
    if (kws.length === 0) continue;
    const mode = row.match_mode === 'equals' ? 'equals' : 'contains';
    if (mode === 'equals') {
      if (kws.some((k) => k.toLowerCase() === lower)) return row;
    } else if (kws.some((k) => lower.includes(k.toLowerCase()))) {
      return row;
    }
  }
  return null;
}

export async function listChannelReplyRulesAdmin(): Promise<ChannelReplyRule[]> {
  const res = await query(
    `SELECT id, name, keywords, match_mode, reply_text, priority, is_enabled, created_at, updated_at
     FROM channel_reply_rules
     ORDER BY priority DESC, id ASC`
  );
  return res.rows as ChannelReplyRule[];
}

export async function listEnabledChannelReplyRules(): Promise<ChannelReplyRule[]> {
  const res = await query(
    `SELECT id, name, keywords, match_mode, reply_text, priority, is_enabled
     FROM channel_reply_rules
     WHERE is_enabled = TRUE
     ORDER BY priority DESC, id ASC`
  );
  return res.rows as ChannelReplyRule[];
}

export async function matchUserMessage(userText: string): Promise<ChannelReplyRule | null> {
  const rules = await listEnabledChannelReplyRules();
  return matchUserTextToRule(rules, userText);
}
