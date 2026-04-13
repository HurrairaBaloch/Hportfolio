import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Game from "@/models/Game";

// Using GIFs instead of videos to avoid CORS issues
// These are used as demo placeholders — replace with your own Cloudinary uploads via dashboard
const FREE_VIDS = {
  minecraft: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
  temple:    "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
  soldier:   "https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif",
  birds:     "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif",
};

const dummyData = [
  // ── GAMES ─────────────────────────────────────────────────────────────────
  {
    type: "game",
    title: "Shadow Realm: Awakening",
    description: "Dark fantasy action RPG. Procedural dungeons, custom fog shaders, and dynamic lighting built in Unity.",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    imagePublicId: "seed_g1",
    videoUrl: "",
    tags: ["Unity", "C#", "RPG", "Shaders"],
    link: "https://itch.io",
  },
  {
    type: "game",
    title: "Neon Drift",
    description: "High-speed arcade racer with procedurally generated neon cityscapes and custom vehicle physics.",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
    imagePublicId: "seed_g2",
    videoUrl: "",
    tags: ["Unity", "HDRP", "Racing", "Physics"],
    link: "https://itch.io",
  },
  {
    type: "game",
    title: "Void Protocol",
    description: "Tactical top-down shooter with destructible environments, AI behavior trees, and Photon multiplayer.",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    imagePublicId: "seed_g3",
    videoUrl: "",
    tags: ["Unity", "Photon", "AI", "Multiplayer"],
    link: "https://itch.io",
  },
  {
    type: "game",
    title: "Iron Citadel",
    description: "Real-time strategy with base building and tower defense. Custom LOD system and GPU instancing for mobile.",
    imageUrl: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&q=80",
    imagePublicId: "seed_g4",
    videoUrl: "",
    tags: ["Unity", "Mobile", "RTS", "Optimization"],
    link: "https://itch.io",
  },
  {
    type: "game",
    title: "Echoes of the Abyss",
    description: "Atmospheric horror puzzle game with custom post-processing, dynamic audio reactivity, and narrative design.",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
    imagePublicId: "seed_g5",
    videoUrl: "",
    tags: ["Unity", "Horror", "Post-FX", "Puzzle"],
    link: "https://itch.io",
  },

  // ── ASSETS (with hover-play videos) ───────────────────────────────────────
  {
    type: "asset",
    title: "Minecraft Steve Dance",
    description: "Green screen character animation asset — Minecraft Steve dance loop. Perfect for game UI and cutscene overlays.",
    imageUrl: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&q=80",
    imagePublicId: "seed_a1",
    videoUrl: FREE_VIDS.minecraft,
    tags: ["Character", "Animation", "Green Screen"],
    link: "",
  },
  {
    type: "asset",
    title: "Temple Adventure Cinematic",
    description: "Lara-style temple run cinematic clip. Used as reference for camera movement and environment lighting in Unity.",
    imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800&q=80",
    imagePublicId: "seed_a2",
    videoUrl: FREE_VIDS.temple,
    tags: ["Cinematic", "Environment", "Camera"],
    link: "",
  },
  {
    type: "asset",
    title: "GI Soldier Combat Rig",
    description: "Military soldier animation reference. Used for rigging and motion capture integration in Unity Animator.",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    imagePublicId: "seed_a3",
    videoUrl: FREE_VIDS.soldier,
    tags: ["Animation", "Rigging", "Combat"],
    link: "",
  },
  {
    type: "asset",
    title: "Nature VFX Reference",
    description: "Bird flocking simulation reference for Unity VFX Graph. Used to build procedural flock behavior systems.",
    imageUrl: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800&q=80",
    imagePublicId: "seed_a4",
    videoUrl: FREE_VIDS.birds,
    tags: ["VFX Graph", "Procedural", "Nature"],
    link: "",
  },
];

export async function GET() {
  try {
    await connectDB();
    
    // Only seed if database is empty
    const existingCount = await Game.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json({ 
        success: true, 
        message: `Database already has ${existingCount} items. Skipping seed.` 
      });
    }
    
    // Seed with dummy data
    await Game.insertMany(dummyData);
    return NextResponse.json({ success: true, message: `Seeded ${dummyData.length} items.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
