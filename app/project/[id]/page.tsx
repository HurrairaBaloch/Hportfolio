"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import HamsterLoader from "@/components/HamsterLoader";

interface Game {
  _id: string;
  type: "game" | "asset" | "project";
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  tags: string[];
  link: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`/api/games/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setGame(data.data);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error(error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchGame();
  }, [params.id, router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0e0e0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <HamsterLoader />
      </div>
    );
  }

  if (!game) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#0e0e0f", color: "#fff" }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(14,14,15,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(161,255,194,0.07)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, color: "#a1ffc2", letterSpacing: "-0.03em", textDecoration: "none" }}>
            HAMZA.DEV
          </Link>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: "#555", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "#555")}
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div style={{ paddingTop: 64 }}>
        {/* Hero Image */}
        <div style={{ position: "relative", width: "100%", height: "60vh", minHeight: 400, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={game.imageUrl} alt={game.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0e0e0f 0%, transparent 60%)" }} />
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: 1000, margin: "-120px auto 0", padding: "0 48px 80px", position: "relative", zIndex: 1 }}>
          {/* Type Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 20px", marginBottom: 24 }}>
            <span style={{ fontSize: 20 }}>
              {game.type === "game" ? "🎮" : game.type === "asset" ? "✨" : "📦"}
            </span>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#a1ffc2" }}>
              {game.type}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 24px", lineHeight: 1.1 }}>
            {game.title}
          </h1>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
            {game.tags?.map(t => (
              <span key={t} style={{ fontSize: 12, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "8px 16px", borderRadius: "8px", background: "rgba(161,255,194,0.08)", border: "1px solid rgba(161,255,194,0.2)", color: "#a1ffc2" }}>
                {t}
              </span>
            ))}
          </div>

          {/* Description */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "32px", marginBottom: 40 }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#a1ffc2", margin: "0 0 16px" }}>
              About This Project
            </h2>
            <p style={{ fontSize: 18, color: "#aaa", lineHeight: 1.8, margin: 0 }}>
              {game.description}
            </p>
          </div>

          {/* Video Preview (if asset) */}
          {game.type === "asset" && game.videoUrl && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "32px", marginBottom: 40 }}>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#00cffc", margin: "0 0 20px" }}>
                Preview
              </h2>
              <div style={{ position: "relative", aspectRatio: "16/9", borderRadius: "8px", overflow: "hidden", background: "#000" }}>
                {game.videoUrl.match(/\.(gif)($|\?)/i) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={game.videoUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <video src={game.videoUrl} controls loop muted autoPlay style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          {game.link && (
            <a href={game.link} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "#a1ffc2", color: "#00643a", border: "none", padding: "18px 36px", borderRadius: "10px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#00fc9a")}
              onMouseLeave={e => (e.currentTarget.style.background = "#a1ffc2")}
            >
              <ExternalLink size={18} />
              Play / View Project
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
