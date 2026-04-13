import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Game from "@/models/Game";

export async function GET() {
  try {
    await connectDB();
    const games = await Game.find({}).sort({ dateAdded: -1 });
    return NextResponse.json({ success: true, data: games });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch games" }, { status: 500 });
  }
}
