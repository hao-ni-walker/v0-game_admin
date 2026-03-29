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
    const keyword = searchParams.get('keyword') || '';

    // 计算偏移量
    const offset = (page - 1) * pageSize;

    let countResult;
    let dataResult;

    // 使用 tagged template 语法查询
    if (keyword) {
      const searchPattern = `%${keyword}%`;
      
      // 获取总数
      countResult = await sql`
        SELECT COUNT(*) as total FROM users 
        WHERE username ILIKE ${searchPattern} 
           OR first_name ILIKE ${searchPattern} 
           OR last_name ILIKE ${searchPattern}
           OR CAST(telegram_id AS TEXT) LIKE ${searchPattern}
      `;
      
      // 获取数据
      dataResult = await sql`
        SELECT id, telegram_id, username, first_name, last_name, created_at
        FROM users 
        WHERE username ILIKE ${searchPattern} 
           OR first_name ILIKE ${searchPattern} 
           OR last_name ILIKE ${searchPattern}
           OR CAST(telegram_id AS TEXT) LIKE ${searchPattern}
        ORDER BY created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
    } else {
      // 无搜索条件
      countResult = await sql`SELECT COUNT(*) as total FROM users`;
      
      dataResult = await sql`
        SELECT id, telegram_id, username, first_name, last_name, created_at
        FROM users 
        ORDER BY created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
    }

    const total = parseInt(countResult[0]?.total || '0');

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

