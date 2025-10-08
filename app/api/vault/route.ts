import { getUserFromCookie } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { VaultItem } from "@/lib/models/VaultItems";
import { NextResponse } from "next/server";


export async function GET() {
  
  try {
    await connectDB();
    const user = await getUserFromCookie()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const items = await VaultItem.find({ userId: user.userId }).sort({ createdAt: -1 })
    return NextResponse.json(items)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 }); 
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const user = await getUserFromCookie()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const body = await req.json()
    const { title, username, url, notes, encrypted } = body;
    
    if (!title || !encrypted) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const vaultItem = await VaultItem.create({
      title,
      username,
      url,
      notes,
      encrypted,
      userId: user.userId,
    });

    return NextResponse.json(vaultItem);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
    
  }
}

export async function PUT(req:Request) {
  try {
    await connectDB();
    const user = await getUserFromCookie()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const url = new URL(req.url)
    
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const body = await req.json();
    const updatedItem = await VaultItem.findOneAndUpdate({ _id: id, userId: user.userId }, body, { new: true })
    if (!updatedItem) return NextResponse.json({ error: "Item not found" }, { status: 404 })
    return NextResponse.json(updatedItem)
    
  } catch (Err) {
    console.error(Err);
    return NextResponse.json({ error: "Server error" }, { status: 500 })
    
  }
}

export async function DELETE(req: Request) {
  
  try {
    await connectDB();
    const user = await getUserFromCookie()
    if(!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    
    const deletedItem = await VaultItem.findOneAndDelete({ _id: id, userId: user.userId })
    if(!deletedItem) return NextResponse.json({error:"Item not found"},{status:404})
    return NextResponse.json({ success: true });
    
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 })
    
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
