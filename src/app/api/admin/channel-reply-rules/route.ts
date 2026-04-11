import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/service/response';

const ALLOWED_MODES = new Set(['contains', 'equals']);

function normalizeMode(v: unknown): string | null {
  const s = typeof v === 'string' ? v.trim().toLowerCase() : '';
  if (s === 'contains' || s === 'equals') return s;
  return null;
}

/**
 * 列表
 * GET /api/admin/channel-reply-rules
 */
export async function GET() {
  try {
    const dataQuery = `
      SELECT id, name, keywords, match_mode, reply_text, priority, is_enabled, created_at, updated_at
      FROM channel_reply_rules
      ORDER BY priority DESC, id ASC
    `;
    const dataResult = await query(dataQuery);
    return successResponse(dataResult.rows);
  } catch (error) {
    console.error('[channel-reply-rules] 列表失败:', error);
    return errorResponse(
      `获取规则失败: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 新建
 * POST /api/admin/channel-reply-rules
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, keywords, match_mode, reply_text, priority, is_enabled } = body;

    if (typeof keywords !== 'string' || !keywords.trim()) {
      return errorResponse('关键词不能为空');
    }
    if (typeof reply_text !== 'string' || !reply_text.trim()) {
      return errorResponse('回复内容不能为空');
    }
    const mode = normalizeMode(match_mode) || 'contains';
    if (!ALLOWED_MODES.has(mode)) {
      return errorResponse('match_mode 仅支持 contains / equals');
    }

    const p =
      priority === undefined || priority === null || priority === ''
        ? 0
        : parseInt(String(priority), 10);
    const priorityN = Number.isFinite(p) ? p : 0;
    const enabled = is_enabled !== false && is_enabled !== 'false' && is_enabled !== 0;

    const result = await query(
      `INSERT INTO channel_reply_rules (name, keywords, match_mode, reply_text, priority, is_enabled, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, name, keywords, match_mode, reply_text, priority, is_enabled, created_at, updated_at`,
      [
        typeof name === 'string' && name.trim() ? name.trim() : null,
        keywords.trim(),
        mode,
        reply_text.trim(),
        priorityN,
        enabled
      ]
    );

    return successResponse(result.rows[0]);
  } catch (error) {
    console.error('[channel-reply-rules] 创建失败:', error);
    return errorResponse('创建规则失败');
  }
}

/**
 * 更新
 * PUT /api/admin/channel-reply-rules
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, keywords, match_mode, reply_text, priority, is_enabled } = body;

    if (id === undefined || id === null) {
      return errorResponse('规则 ID 不能为空');
    }
    const idN = parseInt(String(id), 10);
    if (!Number.isFinite(idN)) {
      return errorResponse('规则 ID 无效');
    }
    if (typeof keywords !== 'string' || !keywords.trim()) {
      return errorResponse('关键词不能为空');
    }
    if (typeof reply_text !== 'string' || !reply_text.trim()) {
      return errorResponse('回复内容不能为空');
    }
    const mode = normalizeMode(match_mode) || 'contains';
    if (!ALLOWED_MODES.has(mode)) {
      return errorResponse('match_mode 仅支持 contains / equals');
    }

    const p =
      priority === undefined || priority === null || priority === ''
        ? 0
        : parseInt(String(priority), 10);
    const priorityN = Number.isFinite(p) ? p : 0;
    const enabled = is_enabled !== false && is_enabled !== 'false' && is_enabled !== 0;

    const result = await query(
      `UPDATE channel_reply_rules
       SET name = $1,
           keywords = $2,
           match_mode = $3,
           reply_text = $4,
           priority = $5,
           is_enabled = $6,
           updated_at = NOW()
       WHERE id = $7
       RETURNING id, name, keywords, match_mode, reply_text, priority, is_enabled, created_at, updated_at`,
      [
        typeof name === 'string' && name.trim() ? name.trim() : null,
        keywords.trim(),
        mode,
        reply_text.trim(),
        priorityN,
        enabled,
        idN
      ]
    );

    if (result.rowCount === 0) {
      return errorResponse('规则不存在');
    }

    return successResponse(result.rows[0]);
  } catch (error) {
    console.error('[channel-reply-rules] 更新失败:', error);
    return errorResponse('更新规则失败');
  }
}

/**
 * 删除
 * DELETE /api/admin/channel-reply-rules?id=
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return errorResponse('规则 ID 不能为空');
    }
    const idN = parseInt(id, 10);
    if (!Number.isFinite(idN)) {
      return errorResponse('规则 ID 无效');
    }

    const result = await query(`DELETE FROM channel_reply_rules WHERE id = $1 RETURNING id`, [idN]);

    if (result.rowCount === 0) {
      return errorResponse('规则不存在');
    }

    return successResponse({ id: idN });
  } catch (error) {
    console.error('[channel-reply-rules] 删除失败:', error);
    return errorResponse('删除规则失败');
  }
}
