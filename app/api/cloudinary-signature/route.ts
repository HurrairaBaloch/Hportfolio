import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Return Cloudinary config for unsigned upload
    // You'll need to enable unsigned uploads in your Cloudinary dashboard
    // and create an upload preset
    
    return NextResponse.json({
      success: true,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      uploadPreset: "hamza_portfolio_unsigned", // We'll create this preset
    });
  } catch (error) {
    console.error("Config error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get config" },
      { status: 500 }
    );
  }
}
