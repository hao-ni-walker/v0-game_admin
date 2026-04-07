import { query } from '@/lib/db';
import {
  successResponse,
  errorResponse
} from '@/service/response';

/**
 * 获取发送日志列表 - 直接从数据库读取
 * GET /api/admin/send-logs
 *
 * 数据库表结构 (send_logs):
 * - id: serial4 主键
 * - message_id: int4 外键关联 messages
 * - telegram_id: int8
 * - status: varchar
 * - error_message: text
 * - retry_count: int4
 * - sent_at: timestamp
 */
export async function GET(request: Request) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');
    const keyword = searchParams.get('keyword') || '';
    const status = searchParams.get('status') || '';

    // 计算偏移量
    const offset = (page - 1) * pageSize;

    let countQuery;
    let dataQuery;
    let queryParams: any[] = [];

    if (keyword && status) {
      const searchPattern = `%${keyword}%`;
      countQuery = `
        SELECT COUNT(*) as total FROM send_logs
        WHERE (CAST(telegram_id AS TEXT) LIKE $1
           OR CAST(message_id AS TEXT) LIKE $1
           OR error_message ILIKE $1)
          AND status = $2
      `;
      dataQuery = `
        SELECT id, message_id, telegram_id, status, error_message, retry_count, sent_at
        FROM send_logs
        WHERE (CAST(telegram_id AS TEXT) LIKE $1
           OR CAST(message_id AS TEXT) LIKE $1
           OR error_message ILIKE $1)
          AND status = $2
        ORDER BY sent_at DESC
        LIMIT $3 OFFSET $4
      `;
      queryParams = [searchPattern, status, pageSize, offset];
    } else if (keyword) {
      const searchPattern = `%${keyword}%`;
      countQuery = `
        SELECT COUNT(*) as total FROM send_logs
        WHERE CAST(telegram_id AS TEXT) LIKE $1
           OR CAST(message_id AS TEXT) LIKE $1
           OR error_message ILIKE $1
      `;
      dataQuery = `
        SELECT id, message_id, telegram_id, status, error_message, retry_count, sent_at
        FROM send_logs
        WHERE CAST(telegram_id AS TEXT) LIKE $1
           OR CAST(message_id AS TEXT) LIKE $1
           OR error_message ILIKE $1
        ORDER BY sent_at DESC
        LIMIT $2 OFFSET $3
      `;
      queryParams = [searchPattern, pageSize, offset];
    } else if (status) {
      countQuery = `
        SELECT COUNT(*) as total FROM send_logs WHERE status = $1
      `;
      dataQuery = `
        SELECT id, message_id, telegram_id, status, error_message, retry_count, sent_at
        FROM send_logs
        WHERE status = $1
        ORDER BY sent_at DESC
        LIMIT $2 OFFSET $3
      `;
      queryParams = [status, pageSize, offset];
    } else {
      countQuery = `SELECT COUNT(*) as total FROM send_logs`;
      dataQuery = `
        SELECT id, message_id, telegram_id, status, error_message, retry_count, sent_at
        FROM send_logs
        ORDER BY sent_at DESC
        LIMIT $1 OFFSET $2
      `;
      queryParams = [pageSize, offset];
    }

    const countResult = await query(countQuery, keyword && status ? [queryParams[0], status] : keyword ? [queryParams[0]] : status ? [status] : []);
    const dataResult = await query(dataQuery, queryParams);

    const total = parseInt(countResult.rows[0]?.total || '0');

    // 返回分页数据
    return successResponse(dataResult.rows, {
      page,
      page_size: pageSize,
      total,
      total_pages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('获取发送日志失败:', error);
    return errorResponse(`获取发送日志失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}
