import { neon } from '@neondatabase/serverless';
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
    if (!process.env.DATABASE_URL) {
      return errorResponse('数据库未配置');
    }

    const sql = neon(process.env.DATABASE_URL);
    
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');
    const username = searchParams.get('username') || '';
    const telegramId = searchParams.get('telegram_id') || '';
    const keyword = searchParams.get('keyword') || '';
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // 计算偏移量
    const offset = (page - 1) * pageSize;

    // 构建搜索条件
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    // 关键词搜索（搜索 username、first_name、last_name）
    if (keyword) {
      whereConditions.push(`(
        username ILIKE $${paramIndex} OR 
        first_name ILIKE $${paramIndex} OR 
        last_name ILIKE $${paramIndex} OR
        CAST(telegram_id AS TEXT) LIKE $${paramIndex}
      )`);
      params.push(`%${keyword}%`);
      paramIndex++;
    }

    // 用户名搜索
    if (username && !keyword) {
      whereConditions.push(`username ILIKE $${paramIndex}`);
      params.push(`%${username}%`);
      paramIndex++;
    }

    // Telegram ID 搜索
    if (telegramId && !keyword) {
      whereConditions.push(`CAST(telegram_id AS TEXT) LIKE $${paramIndex}`);
      params.push(`%${telegramId}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // 验证排序字段（防止 SQL 注入）
    const allowedSortFields = ['id', 'telegram_id', 'username', 'first_name', 'last_name', 'created_at'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countResult = await sql(countQuery, params);
    const total = parseInt(countResult[0]?.total || '0');

    // 获取数据
    const dataQuery = `
      SELECT 
        id,
        telegram_id,
        username,
        first_name,
        last_name,
        created_at
      FROM users 
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const dataResult = await sql(dataQuery, [...params, pageSize, offset]);

    // 转换数据格式以适配前端
    const users = dataResult.map((row: any) => ({
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
    return errorResponse('获取玩家列表失败');
  }
}

