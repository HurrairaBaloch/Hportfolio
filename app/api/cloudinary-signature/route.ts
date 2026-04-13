import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST() {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "hamza-gaming-portfolio/videos";

    // Generate signature for secure upload
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        resource_type: "auto",
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      success: true,
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
    });
  } catch (error) {
    console.error("Signature generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate signature" },
      { status: 500 }
    );
  }
}
