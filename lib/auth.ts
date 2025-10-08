import { cookies } from "next/headers";
import jwt from "jsonwebtoken"


const JWT_SECRET = process.env.JWT_SECRET!;

export const signToken = (userId: string) => {
  return jwt.sign({userId},JWT_SECRET,{expiresIn:"7d"})
}

export const verifyToken = (token: string): {userId:string} | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as {userId:string};
  } catch  {
    return null;
  }
}

export const getUserFromCookie = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token)
}