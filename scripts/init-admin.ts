import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const saltRounds = process.env.SALT_ROUNDS || 12;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    const adminExists = await db.select().from(users).where(eq(users.email, 'admin@example.com'));

    if (adminExists.length === 0) {
      await db.insert(users).values({
        email: 'admin@example.com',
        username: 'Administrator',
        password: hashedPassword,
        avatar: '/avatars/admin.jpg',
        role: 'admin'
      });

      console.log('管理员账号创建成功！');
      console.log('邮箱: admin@example.com');
      console.log('用户名: Administrator');
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