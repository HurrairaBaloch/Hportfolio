import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Game from "@/models/Game";
import cloudinary from "@/lib/cloudinary";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const game = await Game.findById(id);
    
    if (!game) {
      return NextResponse.json({ success: false, error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: game });
  } catch (error) {
    console.error("Get game error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch game" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const game = await Game.findById(id);
    if (!game) {
      return NextResponse.json({ success: false, error: "Game not found" }, { status: 404 });
    }

    // Remove image from Cloudinary
    if (game.imagePublicId) {
      await cloudinary.uploader.destroy(game.imagePublicId);
    }

    await Game.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Game deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete game" }, { status: 500 });
  }
}
