import { neon } from '@neondatabase/serverless';
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
    if (!process.env.DATABASE_URL) {
      return errorResponse('数据库未配置');
    }

    const sql = neon(process.env.DATABASE_URL);
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');
    const keyword = searchParams.get('keyword') || '';
    const status = searchParams.get('status') || '';

    const offset = (page - 1) * pageSize;

    let countResult;
    let dataResult;

    if (keyword && status) {
      const searchPattern = `%${keyword}%`;
      countResult = await sql`
        SELECT COUNT(*) as total FROM messages 
        WHERE (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
          AND status = ${status}
      `;
      dataResult = await sql`
        SELECT id, title, content, image_url, button_text, button_url, scheduled_at, status, created_at, sent_at
        FROM messages 
        WHERE (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
          AND status = ${status}
        ORDER BY created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
    } else if (keyword) {
      const searchPattern = `%${keyword}%`;
      countResult = await sql`
        SELECT COUNT(*) as total FROM messages 
        WHERE title ILIKE ${searchPattern} OR content ILIKE ${searchPattern}
      `;
      dataResult = await sql`
        SELECT id, title, content, image_url, button_text, button_url, scheduled_at, status, created_at, sent_at
        FROM messages 
        WHERE title ILIKE ${searchPattern} OR content ILIKE ${searchPattern}
        ORDER BY created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
    } else if (status) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM messages WHERE status = ${status}
      `;
      dataResult = await sql`
        SELECT id, title, content, image_url, button_text, button_url, scheduled_at, status, created_at, sent_at
        FROM messages 
        WHERE status = ${status}
        ORDER BY created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
    } else {
      countResult = await sql`SELECT COUNT(*) as total FROM messages`;
      dataResult = await sql`
        SELECT id, title, content, image_url, button_text, button_url, scheduled_at, status, created_at, sent_at
        FROM messages 
        ORDER BY created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
    }

    const total = parseInt(countResult[0]?.total || '0');

    return successResponse(dataResult, {
      page,
      page_size: pageSize,
      total,
      total_pages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('获取消息列表失败:', error);
    return errorResponse('获取消息列表失败');
  }
}

/**
 * 创建消息
 * POST /api/admin/messages
 */
export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return errorResponse('数据库未配置');
    }

    const sql = neon(process.env.DATABASE_URL);
    const body = await request.json();
    
    const { title, content, image_url, button_text, button_url, scheduled_at, status } = body;

    if (!content) {
      return errorResponse('消息内容不能为空');
    }

    const result = await sql`
      INSERT INTO messages (title, content, image_url, button_text, button_url, scheduled_at, status, created_at)
      VALUES (${title || null}, ${content}, ${image_url || null}, ${button_text || null}, ${button_url || null}, ${scheduled_at || null}, ${status || 'draft'}, NOW())
      RETURNING *
    `;

    return successResponse(result[0]);
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
    if (!process.env.DATABASE_URL) {
      return errorResponse('数据库未配置');
    }

    const sql = neon(process.env.DATABASE_URL);
    const body = await request.json();
    
    const { id, title, content, image_url, button_text, button_url, scheduled_at, status } = body;

    if (!id) {
      return errorResponse('消息 ID 不能为空');
    }

    if (!content) {
      return errorResponse('消息内容不能为空');
    }

    const result = await sql`
      UPDATE messages 
      SET title = ${title || null},
          content = ${content},
          image_url = ${image_url || null},
          button_text = ${button_text || null},
          button_url = ${button_url || null},
          scheduled_at = ${scheduled_at || null},
          status = ${status || 'draft'}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return errorResponse('消息不存在');
    }

    return successResponse(result[0]);
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
    if (!process.env.DATABASE_URL) {
      return errorResponse('数据库未配置');
    }

    const sql = neon(process.env.DATABASE_URL);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('消息 ID 不能为空');
    }

    const result = await sql`
      DELETE FROM messages WHERE id = ${parseInt(id)}
      RETURNING id
    `;

    if (result.length === 0) {
      return errorResponse('消息不存在');
    }

    return successResponse({ id: parseInt(id) });
  } catch (error) {
    console.error('删除消息失败:', error);
    return errorResponse('删除消息失败');
  }
}
