import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user.length) {
      return NextResponse.json({ message: "邮箱或密码错误" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user[0].password);
    if (!isValid) {
      return NextResponse.json({ message: "邮箱或密码错误" }, { status: 401 });
    }

    const token = sign(
      { id: user[0].id, email: user[0].email, username: user[0].username, role: user[0].role, avatar: user[0].avatar },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    const response = NextResponse.json(
      { message: "登录成功", user: { id: user[0].id, email: user[0].email } },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24
    });

    return response;
  } catch (error) {
    console.error("登录错误:", error);
    return NextResponse.json({ message: "服务器错误" }, { status: 500 });
  }
}