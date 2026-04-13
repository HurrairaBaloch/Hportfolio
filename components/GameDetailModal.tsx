"use client";

import { X, ExternalLink } from "lucide-react";

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

interface GameDetailModalProps {
  game: Game;
  onClose: () => void;
}

export default function GameDetailModal({ game, onClose }: GameDetailModalProps) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)" }} />

      {/* Modal */}
      <div style={{ position: "relative", width: "100%", maxWidth: 900, background: "#0f0f11", border: "1px solid rgba(161,255,194,0.15)", borderRadius: "16px", boxShadow: "0 40px 100px rgba(0,0,0,0.8)", overflow: "hidden", maxHeight: "90vh", overflowY: "auto" }}>
        
        {/* Close button */}
        <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, zIndex: 10, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(161,255,194,0.2)"; e.currentTarget.style.borderColor = "rgba(161,255,194,0.4)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.7)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
        >
          <X size={20} />
        </button>

        {/* Hero Image */}
        <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={game.imageUrl} alt={game.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0f0f11 0%, transparent 60%)" }} />
        </div>

        {/* Content */}
        <div style={{ padding: "32px 40px 40px" }}>
          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {game.tags?.map(t => (
              <span key={t} style={{ fontSize: 11, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "6px 12px", borderRadius: "6px", background: "rgba(161,255,194,0.08)", border: "1px solid rgba(161,255,194,0.2)", color: "#a1ffc2" }}>
                {t}
              </span>
            ))}
          </div>

          {/* Title */}
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.02em", color: "#fff", margin: "0 0 16px" }}>
            {game.title}
          </h2>

          {/* Description */}
          <p style={{ fontSize: 16, color: "#999", lineHeight: 1.8, margin: "0 0 32px", maxWidth: 700 }}>
            {game.description}
          </p>

          {/* Type Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "8px 16px", marginBottom: 24 }}>
            <span style={{ fontSize: 18 }}>
              {game.type === "game" ? "🎮" : game.type === "asset" ? "✨" : "📦"}
            </span>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#666" }}>
              {game.type}
            </span>
          </div>

          {/* Action Buttons */}
          {game.link && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href={game.link} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#a1ffc2", color: "#00643a", border: "none", padding: "14px 28px", borderRadius: "8px", fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#00fc9a")}
                onMouseLeave={e => (e.currentTarget.style.background = "#a1ffc2")}
              >
                <ExternalLink size={16} />
                Play / View Project
              </a>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
