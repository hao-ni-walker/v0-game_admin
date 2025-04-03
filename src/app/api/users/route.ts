import { db } from "@/db";
import { users } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userList = await db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      role: users.role,
      avatar: users.avatar,
      createdAt: users.createdAt,
    }).from(users);

    return NextResponse.json(userList);
  } catch (error) {
    console.error("获取用户列表失败:", error);
    return NextResponse.json(
      { error: "获取用户列表失败" },
      { status: 500 }
    );
  }
}