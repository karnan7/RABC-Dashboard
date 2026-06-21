import "dotenv/config";
import jwt from "jsonwebtoken";
import { Role, User } from "../types";
import { cookies } from "next/headers";
import { prisma } from "./db";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const decode = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decode.userId },
    });
    if (!user) return null;

    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const checkUserPermission = (
  user: User,
  requiredRole: Role,
): boolean => {
  const roleHierarchy = {
    [Role.GUEST]: 0,
    [Role.USER]: 1,
    [Role.MANAGER]: 2,
    [Role.ADMIN]: 3,
  };
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
};
