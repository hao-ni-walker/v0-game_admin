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
    const telegramId = searchParams.get('telegram_id') || '';
    const messageId = searchParams.get('message_id') || '';
    const status = searchParams.get('status') || '';
    const keyword = searchParams.get('keyword') || '';
    const sortBy = searchParams.get('sort_by') || 'sent_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // 计算偏移量
    const offset = (page - 1) * pageSize;

    // 构建搜索条件
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    // 关键词搜索（搜索 telegram_id、message_id、error_message）
    if (keyword) {
      whereConditions.push(`(
        CAST(telegram_id AS TEXT) LIKE $${paramIndex} OR 
        CAST(message_id AS TEXT) LIKE $${paramIndex} OR
        error_message ILIKE $${paramIndex}
      )`);
      params.push(`%${keyword}%`);
      paramIndex++;
    }

    // Telegram ID 搜索
    if (telegramId && !keyword) {
      whereConditions.push(`CAST(telegram_id AS TEXT) LIKE $${paramIndex}`);
      params.push(`%${telegramId}%`);
      paramIndex++;
    }

    // Message ID 搜索
    if (messageId && !keyword) {
      whereConditions.push(`message_id = $${paramIndex}`);
      params.push(parseInt(messageId));
      paramIndex++;
    }

    // 状态筛选
    if (status) {
      whereConditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // 验证排序字段（防止 SQL 注入）
    const allowedSortFields = ['id', 'message_id', 'telegram_id', 'status', 'retry_count', 'sent_at'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'sent_at';
    const safeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM send_logs ${whereClause}`;
    const countResult = await sql(countQuery, params);
    const total = parseInt(countResult[0]?.total || '0');

    // 获取数据
    const dataQuery = `
      SELECT 
        id,
        message_id,
        telegram_id,
        status,
        error_message,
        retry_count,
        sent_at
      FROM send_logs 
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const dataResult = await sql(dataQuery, [...params, pageSize, offset]);

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
