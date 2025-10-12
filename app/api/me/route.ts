import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { User } from "@/lib/models/User";

export async function GET() {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({ authenticated: false }, { status: 401 });

    // Fetching the full user data including email from database
    const userData = await User.findById(user.userId).select('email username');
    if (!userData) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ 
      authenticated: true, 
      userId: user.userId,
      username: userData.username,
      email: userData.email
    });
  } catch (error) {
    console.error("Error in /api/me:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}