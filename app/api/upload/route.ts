import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Game from "@/models/Game";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const formData = await req.formData();

    const type = (formData.get("type") as string) || "project";
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const link = formData.get("link") as string;
    const tagsRaw = formData.get("tags") as string;
    const imageFile = formData.get("image") as File;
    const videoUrl = formData.get("videoUrl") as string | null; // Now accepting URL instead of file

    if (!title || !description || !imageFile) {
      return NextResponse.json({ success: false, error: "Title, description, and image are required" }, { status: 400 });
    }

    const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

    // Upload thumbnail image
    const imageBytes = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(imageBytes);

    const imageUpload = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "hamza-gaming-portfolio", resource_type: "auto" },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        }
      ).end(imageBuffer);
    });

    const item = await Game.create({
      type,
      title,
      description,
      imageUrl: imageUpload.secure_url,
      imagePublicId: imageUpload.public_id,
      link: link || "",
      videoUrl: videoUrl || "",
      tags,
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
