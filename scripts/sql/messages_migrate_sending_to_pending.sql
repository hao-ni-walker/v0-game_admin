-- 历史数据：将 messages.status = 'SENDING' 归为待发送（与当前产品语义一致）
-- 若列为 PostgreSQL enum 且含 SENDING、PENDING，本语句可直接执行。
UPDATE messages SET status = 'PENDING' WHERE status = 'SENDING';
