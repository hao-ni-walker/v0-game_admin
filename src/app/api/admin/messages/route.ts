import { query } from '@/lib/db';
import {
  successResponse,
  errorResponse
} from '@/service/response';

/**
 * 获取消息列表 - 直接从数据库读取
 * GET /api/admin/messages
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');
    const keyword = searchParams.get('keyword') || '';
    const status = searchParams.get('status') || '';

    const offset = (page - 1) * pageSize;

    let countQuery;
    let dataQuery;
    let queryParams: any[] = [];

    if (keyword && status) {
      const searchPattern = `%${keyword}%`;
      countQuery = `
        SELECT COUNT(*) as total FROM messages
        WHERE (title ILIKE $1 OR content ILIKE $1)
          AND status = $2
      `;
      dataQuery = `
        SELECT id, title, content, image_url, button_text, button_url, scheduled_at, status, created_at, sent_at
        FROM messages
        WHERE (title ILIKE $1 OR content ILIKE $1)
          AND status = $2
        ORDER BY created_at DESC
        LIMIT $3 OFFSET $4
      `;
      queryParams = [searchPattern, status, pageSize, offset];
    } else if (keyword) {
      const searchPattern = `%${keyword}%`;
      countQuery = `
        SELECT COUNT(*) as total FROM messages
        WHERE title ILIKE $1 OR content ILIKE $1
      `;
      dataQuery = `
        SELECT id, title, content, image_url, button_text, button_url, scheduled_at, status, created_at, sent_at
        FROM messages
        WHERE title ILIKE $1 OR content ILIKE $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;
      queryParams = [searchPattern, pageSize, offset];
    } else if (status) {
      countQuery = `
        SELECT COUNT(*) as total FROM messages WHERE status = $1
      `;
      dataQuery = `
        SELECT id, title, content, image_url, button_text, button_url, scheduled_at, status, created_at, sent_at
        FROM messages
        WHERE status = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;
      queryParams = [status, pageSize, offset];
    } else {
      countQuery = `SELECT COUNT(*) as total FROM messages`;
      dataQuery = `
        SELECT id, title, content, image_url, button_text, button_url, scheduled_at, status, created_at, sent_at
        FROM messages
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;
      queryParams = [pageSize, offset];
    }

    const countResult = await query(countQuery, keyword ? [queryParams[0]] : status ? [status] : []);
    const dataResult = await query(dataQuery, queryParams);

    const total = parseInt(countResult.rows[0]?.total || '0');

    return successResponse(dataResult.rows, {
      page,
      page_size: pageSize,
      total,
      total_pages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('获取消息列表失败:', error);
    return errorResponse(`获取消息列表失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 创建消息
 * POST /api/admin/messages
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { title, content, image_url, button_text, button_url, scheduled_at, status } = body;

    if (!content) {
      return errorResponse('消息内容不能为空');
    }

    // 数据库 enum: PENDING, SENDING, COMPLETED, FAILED
    const dbStatus = (status || 'PENDING').toUpperCase();
    const result = await query(
      `INSERT INTO messages (title, content, image_url, button_text, button_url, scheduled_at, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [title || null, content, image_url || null, button_text || null, button_url || null, scheduled_at || null, dbStatus]
    );

    return successResponse(result.rows[0]);
  } catch (error) {
    console.error('创建消息失败:', error);
    return errorResponse('创建消息失败');
  }
}

/**
 * 更新消息
 * PUT /api/admin/messages
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const { id, title, content, image_url, button_text, button_url, scheduled_at, status } = body;

    if (!id) {
      return errorResponse('消息 ID 不能为空');
    }

    if (!content) {
      return errorResponse('消息内容不能为空');
    }

    // 数据库 enum: PENDING, SENDING, COMPLETED, FAILED
    const dbStatus = (status || 'PENDING').toUpperCase();
    const result = await query(
      `UPDATE messages
       SET title = $1,
           content = $2,
           image_url = $3,
           button_text = $4,
           button_url = $5,
           scheduled_at = $6,
           status = $7
       WHERE id = $8
       RETURNING *`,
      [title || null, content, image_url || null, button_text || null, button_url || null, scheduled_at || null, dbStatus, id]
    );

    if (result.rowCount === 0) {
      return errorResponse('消息不存在');
    }

    return successResponse(result.rows[0]);
  } catch (error) {
    console.error('更新消息失败:', error);
    return errorResponse('更新消息失败');
  }
}

/**
 * 删除消息
 * DELETE /api/admin/messages
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('消息 ID 不能为空');
    }

    const result = await query(
      `DELETE FROM messages WHERE id = $1 RETURNING id`,
      [parseInt(id)]
    );

    if (result.rowCount === 0) {
      return errorResponse('消息不存在');
    }

    return successResponse({ id: parseInt(id) });
  } catch (error) {
    console.error('删除消息失败:', error);
    return errorResponse('删除消息失败');
  }
}
