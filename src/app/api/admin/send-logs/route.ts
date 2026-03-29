import { neon } from '@neondatabase/serverless';
import {
  successResponse,
  errorResponse
} from '@/service/response';

/**
 * 获取发送日志列表 - 直接从数据库读取
 * GET /api/admin/send-logs
 * 
 * 数据库表结构 (bot_1.send_logs):
 * - id: serial4 主键
 * - message_id: int4 外键关联 messages
 * - telegram_id: int8
 * - status: sendstatus 枚举
 * - error_message: text
 * - retry_count: int4
 * - sent_at: timestamp
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
    const status = searchParams.get('status') || '';

    // 计算偏移量
    const offset = (page - 1) * pageSize;

    let countResult;
    let dataResult;

    if (keyword && status) {
      const searchPattern = `%${keyword}%`;
      countResult = await sql`
        SELECT COUNT(*) as total FROM send_logs 
        WHERE (CAST(telegram_id AS TEXT) LIKE ${searchPattern} 
           OR CAST(message_id AS TEXT) LIKE ${searchPattern}
           OR error_message ILIKE ${searchPattern})
          AND status = ${status}
      `;
      dataResult = await sql`
        SELECT id, message_id, telegram_id, status, error_message, retry_count, sent_at
        FROM send_logs 
        WHERE (CAST(telegram_id AS TEXT) LIKE ${searchPattern} 
           OR CAST(message_id AS TEXT) LIKE ${searchPattern}
           OR error_message ILIKE ${searchPattern})
          AND status = ${status}
        ORDER BY sent_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
    } else if (keyword) {
      const searchPattern = `%${keyword}%`;
      countResult = await sql`
        SELECT COUNT(*) as total FROM send_logs 
        WHERE CAST(telegram_id AS TEXT) LIKE ${searchPattern} 
           OR CAST(message_id AS TEXT) LIKE ${searchPattern}
           OR error_message ILIKE ${searchPattern}
      `;
      dataResult = await sql`
        SELECT id, message_id, telegram_id, status, error_message, retry_count, sent_at
        FROM send_logs 
        WHERE CAST(telegram_id AS TEXT) LIKE ${searchPattern} 
           OR CAST(message_id AS TEXT) LIKE ${searchPattern}
           OR error_message ILIKE ${searchPattern}
        ORDER BY sent_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
    } else if (status) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM send_logs WHERE status = ${status}
      `;
      dataResult = await sql`
        SELECT id, message_id, telegram_id, status, error_message, retry_count, sent_at
        FROM send_logs 
        WHERE status = ${status}
        ORDER BY sent_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
    } else {
      countResult = await sql`SELECT COUNT(*) as total FROM send_logs`;
      dataResult = await sql`
        SELECT id, message_id, telegram_id, status, error_message, retry_count, sent_at
        FROM send_logs 
        ORDER BY sent_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
    }

    const total = parseInt(countResult[0]?.total || '0');

    // 转换数据格式
    const logs = dataResult.map((row: any) => ({
      id: row.id,
      message_id: row.message_id,
      telegram_id: row.telegram_id,
      status: row.status,
      error_message: row.error_message || '',
      retry_count: row.retry_count,
      sent_at: row.sent_at
    }));

    // 返回分页数据
    return successResponse(logs, {
      page,
      page_size: pageSize,
      total,
      total_pages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('获取发送日志失败:', error);
    return errorResponse('获取发送日志失败');
  }
}
