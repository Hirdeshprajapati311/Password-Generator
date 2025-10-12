import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password, action,username, encryptedMasterKey } = await req.json();

    console.log("📦 Request body:", { 
      email , 
      action,
      password,
      encryptedMasterKey 
    });

    if (!email || !password || !action  ) {
      console.log("Missing required fields");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (action === "signup") {
      const existing = await User.findOne({$or:[{email},{username}]  });
      if (existing) {
        const field = existing.email === email ? "email" : "username";
        return NextResponse.json({ok:false, error: `This ${field} already exists` }, { status: 400 });
      }

      if (!encryptedMasterKey) {
        return NextResponse.json({ok:false, error: "Missing encrypted master key" }, { status: 400 });
      }

      
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);


      const user = await User.create({
        email,
        username,
        password: hash,
        salt,
        encryptedMasterKey:JSON.stringify(encryptedMasterKey)
      });
      console.log("User created with ID:", user._id);

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
      const res = NextResponse.json({ success: true, userId: user._id,username:user.username, encryptedMasterKey: user.encryptedMasterKey });

      res.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
        
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Auth API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}