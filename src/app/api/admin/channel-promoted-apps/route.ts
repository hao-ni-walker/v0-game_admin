import { query } from '@/lib/db';
import { successResponse, errorResponse } from '@/service/response';

function parseRanking(v: unknown): number {
  if (v === undefined || v === null || v === '') return 0;
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : 0;
}

function normalizePageKey(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length > 0 ? t.slice(0, 64) : null;
}

/**
 * 列表
 * GET /api/admin/channel-promoted-apps
 */
export async function GET() {
  try {
    const dataQuery = `
      SELECT id, name, image_url, target_url, page_ranking, page_key, is_enabled, created_at, updated_at
      FROM channel_promoted_apps
      ORDER BY page_ranking DESC, id ASC
    `;
    const dataResult = await query(dataQuery);
    return successResponse(dataResult.rows);
  } catch (error) {
    console.error('[channel-promoted-apps] 列表失败:', error);
    return errorResponse(
      `获取推广 App 列表失败: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 新建
 * POST /api/admin/channel-promoted-apps
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, image_url, target_url, page_ranking, page_key, is_enabled } = body;

    if (typeof image_url !== 'string' || !image_url.trim()) {
      return errorResponse('图片 URL 不能为空');
    }
    if (typeof target_url !== 'string' || !target_url.trim()) {
      return errorResponse('推广链接不能为空');
    }

    const ranking = parseRanking(page_ranking);
    const enabled = is_enabled !== false && is_enabled !== 'false' && is_enabled !== 0;
    const pk = normalizePageKey(page_key);

    const result = await query(
      `INSERT INTO channel_promoted_apps
        (name, image_url, target_url, page_ranking, page_key, is_enabled, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, name, image_url, target_url, page_ranking, page_key, is_enabled, created_at, updated_at`,
      [
        typeof name === 'string' && name.trim() ? name.trim().slice(0, 200) : null,
        image_url.trim(),
        target_url.trim(),
        ranking,
        pk,
        enabled
      ]
    );

    return successResponse(result.rows[0]);
  } catch (error) {
    console.error('[channel-promoted-apps] 创建失败:', error);
    return errorResponse('创建推广 App 失败');
  }
}

/**
 * 更新
 * PUT /api/admin/channel-promoted-apps
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, image_url, target_url, page_ranking, page_key, is_enabled } = body;

    if (id === undefined || id === null) {
      return errorResponse('记录 ID 不能为空');
    }
    const idN = parseInt(String(id), 10);
    if (!Number.isFinite(idN)) {
      return errorResponse('记录 ID 无效');
    }
    if (typeof image_url !== 'string' || !image_url.trim()) {
      return errorResponse('图片 URL 不能为空');
    }
    if (typeof target_url !== 'string' || !target_url.trim()) {
      return errorResponse('推广链接不能为空');
    }

    const ranking = parseRanking(page_ranking);
    const enabled = is_enabled !== false && is_enabled !== 'false' && is_enabled !== 0;
    const pk = normalizePageKey(page_key);

    const result = await query(
      `UPDATE channel_promoted_apps
       SET name = $1,
           image_url = $2,
           target_url = $3,
           page_ranking = $4,
           page_key = $5,
           is_enabled = $6,
           updated_at = NOW()
       WHERE id = $7
       RETURNING id, name, image_url, target_url, page_ranking, page_key, is_enabled, created_at, updated_at`,
      [
        typeof name === 'string' && name.trim() ? name.trim().slice(0, 200) : null,
        image_url.trim(),
        target_url.trim(),
        ranking,
        pk,
        enabled,
        idN
      ]
    );

    if (result.rowCount === 0) {
      return errorResponse('记录不存在');
    }

    return successResponse(result.rows[0]);
  } catch (error) {
    console.error('[channel-promoted-apps] 更新失败:', error);
    return errorResponse('更新推广 App 失败');
  }
}

/**
 * 删除
 * DELETE /api/admin/channel-promoted-apps?id=
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return errorResponse('记录 ID 不能为空');
    }
    const idN = parseInt(id, 10);
    if (!Number.isFinite(idN)) {
      return errorResponse('记录 ID 无效');
    }

    const result = await query(`DELETE FROM channel_promoted_apps WHERE id = $1 RETURNING id`, [idN]);

    if (result.rowCount === 0) {
      return errorResponse('记录不存在');
    }

    return successResponse({ id: idN });
  } catch (error) {
    console.error('[channel-promoted-apps] 删除失败:', error);
    return errorResponse('删除推广 App 失败');
  }
}
