import { matchUserMessage } from '@/server/channel-reply-rules';
import { successResponse, errorResponse } from '@/service/response';

function verifyBotSecret(request: Request): boolean {
  const secret = process.env.CHANNEL_REPLY_RULES_BOT_SECRET;
  if (!secret || !secret.trim()) {
    return true;
  }
  const auth = request.headers.get('authorization') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const headerSecret = request.headers.get('x-bot-secret')?.trim() || '';
  return bearer === secret || headerSecret === secret;
}

/**
 * Telegram 机器人：根据用户原文匹配关键词规则，返回应回复的文案。
 *
 * POST /api/bot/channel-reply-rules/match
 * Header（推荐）: Authorization: Bearer <CHANNEL_REPLY_RULES_BOT_SECRET>
 * 或: x-bot-secret: <CHANNEL_REPLY_RULES_BOT_SECRET>
 * 若未配置 CHANNEL_REPLY_RULES_BOT_SECRET，则不校验（仅建议本地调试）。
 *
 * Body: { "text": "用户消息" }
 */
export async function POST(request: Request) {
  try {
    if (!verifyBotSecret(request)) {
      return errorResponse('未授权', 401);
    }

    const body = await request.json().catch(() => ({}));
    const text = typeof body.text === 'string' ? body.text : '';
    if (!text.trim()) {
      return successResponse({ matched: false, reply_text: null, rule_id: null });
    }

    const rule = await matchUserMessage(text);
    if (!rule) {
      return successResponse({ matched: false, reply_text: null, rule_id: null });
    }

    return successResponse({
      matched: true,
      reply_text: rule.reply_text,
      rule_id: rule.id
    });
  } catch (error) {
    console.error('[bot/channel-reply-rules/match] 失败:', error);
    return errorResponse(
      `匹配失败: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
