import { Logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/service/response';
import { getRepositories } from '@/repository';

// GET /api/tickets/[id]/attachments - 获取附件列表
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return errorResponse('无效的工单ID');
    }

    const repos = await getRepositories();
    const ticket = await repos.tickets.getById(id);

    if (!ticket) {
      return errorResponse('工单不存在', 404);
    }

    const attachments = await repos.tickets.getAttachments(id);
    return successResponse(attachments);
  } catch (error) {
    console.error('获取附件列表失败:', error);
    return errorResponse('获取附件列表失败');
  }
}

// POST /api/tickets/[id]/attachments - 上传附件
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = getCurrentUser(request);
  const logger = new Logger('工单管理', currentUser?.id);

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return errorResponse('无效的工单ID');
    }

    const repos = await getRepositories();
    const ticket = await repos.tickets.getById(id);

    if (!ticket) {
      return errorResponse('工单不存在', 404);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return errorResponse('请选择要上传的文件');
    }

    // 文件大小限制（10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return errorResponse('文件大小不能超过 10MB');
    }

    // 在实际生产环境中，这里应该将文件上传到对象存储（如 S3、OSS 等）
    // 这里我们模拟保存文件路径
    const filePath = `/uploads/tickets/${id}/${Date.now()}_${file.name}`;

    const attachmentId = await repos.tickets.addAttachment({
      ticketId: id,
      filename: file.name,
      filePath,
      fileSize: file.size,
      contentType: file.type || 'application/octet-stream',
      uploadedBy: currentUser?.id || null
    });

    await logger.info('上传工单附件', '附件上传成功', {
      ticketId: id,
      attachmentId,
      filename: file.name,
      fileSize: file.size,
      operatorId: currentUser?.id
    });

    return successResponse({
      id: attachmentId,
      ticketId: id,
      filename: file.name,
      filePath,
      fileSize: file.size,
      contentType: file.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser?.id || null
    });
  } catch (error) {
    await logger.error('上传工单附件', '上传附件失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      operatorId: currentUser?.id
    });

    console.error('上传附件失败:', error);
    return errorResponse('上传附件失败');
  }
}
