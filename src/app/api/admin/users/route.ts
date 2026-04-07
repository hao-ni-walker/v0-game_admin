import { query } from '@/lib/db';
import {
  successResponse,
  errorResponse
} from '@/service/response';

/**
 * 获取玩家列表 - 直接从数据库读取
 * GET /api/admin/users
 *
 * 数据库表结构 (bot_1.users):
 * - id: serial4 主键
 * - telegram_id: int8 唯一
 * - username: varchar(255)
 * - first_name: varchar(255)
 * - last_name: varchar(255)
 * - created_at: timestamp
 */
export async function GET(request: Request) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');
    const keyword = searchParams.get('keyword') || '';

    // 计算偏移量
    const offset = (page - 1) * pageSize;

    let countQuery;
    let dataQuery;
    let queryParams: any[] = [];

    if (keyword) {
      const searchPattern = `%${keyword}%`;

      // 获取总数
      countQuery = `
        SELECT COUNT(*) as total
        FROM users
        WHERE username ILIKE $1
           OR first_name ILIKE $1
           OR last_name ILIKE $1
           OR CAST(telegram_id AS TEXT) LIKE $1
      `;

      // 获取数据
      dataQuery = `
        SELECT id, telegram_id, username, first_name, last_name, created_at
        FROM users
        WHERE username ILIKE $1
           OR first_name ILIKE $1
           OR last_name ILIKE $1
           OR CAST(telegram_id AS TEXT) LIKE $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;

      queryParams = [searchPattern, pageSize, offset];
    } else {
      // 无搜索条件
      countQuery = `SELECT COUNT(*) as total FROM users`;

      dataQuery = `
        SELECT id, telegram_id, username, first_name, last_name, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;

      queryParams = [pageSize, offset];
    }

    const countResult = await query(countQuery, keyword ? [queryParams[0]] : []);
    const dataResult = await query(dataQuery, queryParams);

    const total = parseInt(countResult.rows[0]?.total || '0');

    // 转换数据格式以适配前端
    const users = dataResult.rows.map((row: any) => ({
      id: row.id,
      telegram_id: row.telegram_id,
      username: row.username || '',
      first_name: row.first_name || '',
      last_name: row.last_name || '',
      // 组合显示名称
      display_name: [row.first_name, row.last_name].filter(Boolean).join(' ') || row.username || `User ${row.telegram_id}`,
      created_at: row.created_at,
      // 兼容旧字段
      status: 'active',
      vip_level: 0
    }));

    // 返回分页数据
    return successResponse(users, {
      page,
      page_size: pageSize,
      total,
      total_pages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('获取玩家列表失败:', error);
    console.error('错误详情:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return errorResponse(`获取玩家列表失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}
