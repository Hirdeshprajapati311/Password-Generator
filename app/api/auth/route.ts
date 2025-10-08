import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password, action } = await req.json();

    if (!email || !password || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (action === "signup") {
      const existing = await User.findOne({ email });
      if (existing) {
        return NextResponse.json({ error: "User already exists" }, { status: 400 });
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const user = await User.create({
        email,
        password: hash,
        salt,
      });

      const token = signToken(user._id.toString());
      const res = NextResponse.json({ success: true, userId: user._id });

      res.cookies.set("token", token, {
        httpOnly: true,
        secure:process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,

      
      })
      return res; 
    }
    if (action === "login") {
        const user = await User.findOne({ email });
        if (!user) {
          return NextResponse.json({ error: "Invalid credentials" }, {
            status: 401,
          })
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return NextResponse.json({error:"Invalid credentials"},{status:401})
      }

      const token = signToken(user._id.toString());
      const res = NextResponse.json({ success: true, userId: user._id });

      res.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
        
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}