import { Logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/service/response';
import { getRepositories } from '@/repository';

// DELETE /api/ticket-attachments/[id] - 删除附件
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = getCurrentUser(request);
  const logger = new Logger('工单管理', currentUser?.id);

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return errorResponse('无效的附件ID');
    }

    const repos = await getRepositories();
    const attachment = await repos.tickets.getAttachmentById(id);

    if (!attachment) {
      return errorResponse('附件不存在', 404);
    }

    await repos.tickets.deleteAttachment(id);

    await logger.info('删除工单附件', '附件删除成功', {
      attachmentId: id,
      ticketId: attachment.ticketId,
      filename: attachment.filename,
      operatorId: currentUser?.id
    });

    return successResponse({ message: '附件删除成功' });
  } catch (error) {
    await logger.error('删除工单附件', '删除附件失败：系统错误', {
      error: error instanceof Error ? error.message : String(error),
      operatorId: currentUser?.id
    });

    console.error('删除附件失败:', error);
    return errorResponse('删除附件失败');
  }
}
