// app/api/link-telegram/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import client from "@/app/utilis/db";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const telegramId = searchParams.get("telegramId");

  if (!telegramId) {
    return NextResponse.json(
      { error: "telegramId is required" },
      { status: 400 }
    );
  }

  const db = client.db();
  const users = db.collection("users");

  await users.updateOne(
    { _id: new ObjectId(session.user.id) },
    { $set: { telegramId: telegramId.toString() } }
  );

  return NextResponse.json({ message: "✅ Telegram linked successfully!" });
}
