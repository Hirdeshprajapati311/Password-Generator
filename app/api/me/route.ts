import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { User } from "@/lib/models/User";

export async function GET() {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({ authenticated: false }, { status: 401 });

    // Fetch the full user data including email from database
    const userData = await User.findById(user.userId).select('email');
    if (!userData) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ 
      authenticated: true, 
      userId: user.userId,
      email: userData.email  // ✅ Add email to response
    });
  } catch (error) {
    console.error("Error in /api/me:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}