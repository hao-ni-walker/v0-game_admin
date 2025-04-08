import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

export interface User {
  id: number;
  email: string;
  username: string;
  avatar: string;
  roleId: string;
}

export interface Session {
  user: User;
}

export async function auth(): Promise<Session | null> {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token");

  if (!token) {
    return null;
  }

  try {
    const verified = verify(token.value, process.env.JWT_SECRET || "secret") as User;
    return {
      user: {
        id: verified.id,
        email: verified.email,
        username: verified.username,
        avatar: verified.avatar,
        roleId: verified.roleId,
      }
    };
  } catch {
    return null;
  }
}