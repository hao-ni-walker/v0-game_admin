import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    // 生成强密码
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // 检查管理员是否已存在
    const adminExists = await db.select().from(users).where(eq(users.email, 'admin@example.com'));

    if (adminExists.length === 0) {
      // 创建管理员账号
      await db.insert(users).values({
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });

      console.log('管理员账号创建成功！');
      console.log('邮箱: admin@example.com');
      console.log('请使用环境变量中配置的密码登录');
    } else {
      console.log('管理员账号已存在');
    }

    process.exit(0);
  } catch (error) {
    console.error('创建管理员失败:', error);
    process.exit(1);
  }
}

main();