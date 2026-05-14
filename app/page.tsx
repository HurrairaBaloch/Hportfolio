"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import SectionBg from "@/components/SectionBg";
import HamsterLoader from "@/components/HamsterLoader";

const HeroBg = dynamic(() => import("@/components/HeroBg"), { ssr: false });

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

const SKILLS = [
  { name: "Unity",        icon: "🎮" }, { name: "C#",           icon: "⚙️" },
  { name: "Shader Graph", icon: "✨" }, { name: "VFX Graph",    icon: "💥" },
  { name: "HDRP / URP",  icon: "🌟" }, { name: "Photon",       icon: "🌐" },
  { name: "Git",          icon: "🔀" }, { name: "Blender",      icon: "🧊" },
  { name: "Substance",    icon: "🎨" }, { name: "Addressables", icon: "📦" },
  { name: "DOTween",      icon: "🎯" }, { name: "Cinemachine",  icon: "🎬" },
];

// ─── Shared styles ────────────────────────────────────────────────────────────
const inner: React.CSSProperties = { maxWidth: 1200, margin: "0 auto", padding: "0 48px" };
const secLabel: React.CSSProperties = {
  fontFamily: "'Space Grotesk',sans-serif", fontSize: 10, fontWeight: 700,
  color: "#a1ffc2", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: 14,
};
const secTitle: React.CSSProperties = {
  fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(30px,4vw,50px)",
  fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 14px", color: "#fff",
};
const secSub: React.CSSProperties = { color: "#555", fontSize: 15, margin: "0 0 56px", lineHeight: 1.6 };

// ─── Game Card (image only, link on click) ────────────────────────────────────
function GameCard({ game }: { game: Game }) {
  const [hov, setHov] = useState(false);
  const router = useRouter();
  
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#0f0f11",
        border: `1px solid ${hov ? "rgba(161,255,194,0.28)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: "12px",
        overflow: "hidden", cursor: "pointer",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hov ? "0 20px 50px rgba(0,0,0,0.5),0 0 24px rgba(161,255,194,0.05)" : "none",
        transition: "all 0.35s ease",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={game.imageUrl} alt={game.title} style={{
          width: "100%", height: "100%", objectFit: "cover", display: "block",
          transform: hov ? "scale(1.06)" : "scale(1)", transition: "transform 0.6s ease",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,#0f0f11 0%,transparent 55%)" }} />
        {game.tags?.[0] && (
          <div style={{
            position: "absolute", top: 12, left: 12,
            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(161,255,194,0.2)", borderRadius: "6px", padding: "3px 10px",
            fontSize: 10, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
            color: "#a1ffc2", letterSpacing: "0.1em", textTransform: "uppercase",
          }}>{game.tags[0]}</div>
        )}
        
        {/* Show Details button on hover */}
        {hov && (
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/project/${game._id}`); }}
            style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              background: "rgba(161,255,194,0.95)", color: "#00643a",
              border: "none", padding: "12px 24px", borderRadius: "6px",
              fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em",
              cursor: "pointer", zIndex: 10,
              animation: "fadeIn 0.3s ease",
            }}
          >
            Show Details
          </button>
        )}
      </div>
      <div style={{ padding: "18px 22px 22px" }}>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, color: hov ? "#a1ffc2" : "#fff", margin: "0 0 8px", transition: "color 0.3s" }}>
          {game.title}
        </h3>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.65, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {game.description}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
          {game.tags?.map(t => (
            <span key={t} style={{ fontSize: 10, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "2px 7px", borderRadius: "4px", background: "rgba(161,255,194,0.05)", border: "1px solid rgba(161,255,194,0.12)", color: "rgba(161,255,194,0.55)" }}>{t}</span>
          ))}
        </div>
        {game.link && (
          <a href={game.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#00cffc", textDecoration: "none" }}>
            ↗ Play / View
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Asset Card — media plays on hover ───────────────────────────────────────
function AssetCard({ game }: { game: Game }) {
  const [hov, setHov] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaUrl = (game.videoUrl || "").trim();
  const [mediaError, setMediaError] = useState(false);
  const isGif = mediaUrl.match(/\.(gif)($|\?)/i);

  useEffect(() => {
    setMediaError(false);
  }, [mediaUrl]);

  const handleEnter = () => {
    setHov(true);
    // Play video on hover
    if (videoRef.current && !isGif) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };
  
  const handleLeave = () => {
    setHov(false);
    // Pause video when not hovering
    if (videoRef.current && !isGif) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        background: "#0f0f11",
        border: `1px solid ${hov ? "rgba(0,207,252,0.35)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: "12px",
        overflow: "hidden", cursor: "pointer",
        transform: hov ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
        boxShadow: hov ? "0 24px 60px rgba(0,0,0,0.6),0 0 30px rgba(0,207,252,0.08)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      {/* ── Media container ── */}
      <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", background: "#000" }}>
        {/* Thumbnail — fades out when hovering */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={game.imageUrl}
          alt={game.title}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", display: "block",
            opacity: hov && mediaUrl && !mediaError ? 0 : 1,
            transition: "opacity 0.4s ease",
            zIndex: 1,
          }}
        />

        {/* Animated media (GIF/video) — shows on hover */}
        {mediaUrl && !mediaError && (
          <>
            {isGif ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={hov ? 'gif-play' : 'gif-pause'}
                src={mediaUrl}
                alt={`${game.title} preview`}
                onError={() => setMediaError(true)}
                style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%",
                  objectFit: "cover", display: "block",
                  opacity: hov ? 1 : 0,
                  transition: "opacity 0.4s ease",
                  zIndex: 2,
                }}
              />
            ) : (
              <video
                ref={videoRef}
                muted
                loop
                playsInline
                preload="auto"
                onError={() => setMediaError(true)}
                style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%",
                  objectFit: "cover",
                  opacity: hov ? 1 : 0,
                  transition: "opacity 0.4s ease",
                  zIndex: 2,
                }}
              >
                <source src={mediaUrl} type="video/mp4" />
              </video>
            )}
          </>
        )}

        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,#0f0f11 0%,transparent 60%)", zIndex: 3 }} />

        {/* Tag */}
        {game.tags?.[0] && (
          <div style={{
            position: "absolute", top: 12, left: 12, zIndex: 4,
            background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(0,207,252,0.3)", borderRadius: "6px", padding: "3px 10px",
            fontSize: 10, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
            color: "#00cffc", letterSpacing: "0.1em", textTransform: "uppercase",
          }}>{game.tags[0]}</div>
        )}

        {/* Play indicator — shows when not hovering */}
        {mediaUrl && !hov && !mediaError && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
              border: "1.5px solid rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 14, color: "#fff", marginLeft: 3 }}>▶</span>
            </div>
          </div>
        )}

        {/* "PLAYING" badge on hover */}
        {mediaUrl && hov && !mediaError && (
          <div style={{
            position: "absolute", top: 12, right: 12, zIndex: 4,
            background: "rgba(0,207,252,0.15)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(0,207,252,0.4)", borderRadius: "6px", padding: "3px 10px",
            fontSize: 9, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
            color: "#00cffc", letterSpacing: "0.15em", textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{ width: 5, height: 5, background: "#00cffc", borderRadius: "50%", animation: "pulse 1s infinite" }} />
            PLAYING
          </div>
        )}

        {/* Error hint if media URL is invalid/unplayable */}
        {mediaUrl && mediaError && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 4,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 14, textAlign: "center",
            background: "linear-gradient(to top, rgba(15,15,17,0.95) 0%, rgba(15,15,17,0.35) 60%)",
            color: "rgba(255,255,255,0.85)",
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            Preview unavailable — use a direct .mp4/.webm/.gif URL
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div style={{ padding: "16px 20px 20px" }}>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, color: hov ? "#00cffc" : "#ddd", margin: "0 0 6px", transition: "color 0.3s" }}>
          {game.title}
        </h3>
        <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6, margin: "0 0 12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {game.description}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {game.tags?.map(t => (
            <span key={t} style={{ fontSize: 9, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "2px 7px", borderRadius: "4px", background: "rgba(0,207,252,0.05)", border: "1px solid rgba(0,207,252,0.12)", color: "rgba(0,207,252,0.5)" }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [all, setAll] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/games")
      .then(r => r.json())
      .then(d => { if (d.success) setAll(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const games  = all.filter(g => g.type === "game" || g.type === "project");
  const assets = all.filter(g => g.type === "asset");
  const gamesWithLinks = all.filter(g => (g.type === "game" || g.type === "project") && g.link);

  return (
    <div style={{ background: "#0e0e0f", minHeight: "100vh", color: "#fff", overflowX: "hidden" }}>
      <HeroBg />

      {/* ── NAV ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(14,14,15,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(161,255,194,0.07)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, color: "#a1ffc2", letterSpacing: "-0.03em" }}>HAMZA.DEV</span>
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {[["Work","#work"],["Assets","#assets"],["Games","#games"],["About","#about"]].map(([l,h]) => (
              <a key={l} href={h} style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: "#555", textDecoration: "none", letterSpacing: "0.02em", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color="#fff")}
                onMouseLeave={e => (e.currentTarget.style.color="#555")}
              >{l}</a>
            ))}
            <a href="#contact" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 700, background: "#a1ffc2", color: "#00643a", padding: "8px 20px", textDecoration: "none", letterSpacing: "0.05em", textTransform: "uppercase" }}>Hire Me</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "120px 48px 80px", maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 680 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <span style={{ width: 8, height: 8, background: "#a1ffc2", borderRadius: "50%", boxShadow: "0 0 12px #a1ffc2", flexShrink: 0 }} />
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, fontWeight: 700, color: "#a1ffc2", letterSpacing: "0.3em", textTransform: "uppercase" }}>Unity Game Developer</span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(64px,10vw,110px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, margin: "0 0 24px" }}>
            HAMZA<span style={{ color: "#a1ffc2" }}>.</span>
          </h1>
          <p style={{ fontSize: "clamp(16px,2vw,19px)", color: "#666", lineHeight: 1.75, margin: "0 0 48px", maxWidth: 520 }}>
            Crafting immersive game experiences through clean C# architecture, stunning visual effects, and polished gameplay systems.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <a href="#work" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 700, background: "#a1ffc2", color: "#00643a", padding: "14px 32px", textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase" }}>View Work</a>
            <a href="#contact" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 700, border: "1px solid rgba(255,255,255,0.12)", color: "#00cffc", padding: "14px 32px", textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase" }}>Get In Touch</a>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 48, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.3 }}>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase" }}>Scroll</span>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom,#a1ffc2,transparent)" }} />
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: "120px 0", background: "#0e0e0f", position: "relative", zIndex: 1, overflow: "hidden" }}>
        <SectionBg color="#a1ffc2" variant="dots" />
        <div style={{ ...inner, display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"start", position:"relative", zIndex:1 }}>
          <div>
            <div style={secLabel}>About Me</div>
            <h2 style={secTitle}>THE_DEVELOPER</h2>
            <p style={{ color:"#777", fontSize:16, lineHeight:1.8, margin:"0 0 20px" }}>
              I&apos;m Hamza — a Unity game developer passionate about building polished, performant games. I focus on clean code architecture, immersive visual effects, and smooth gameplay feel.
            </p>
            <p style={{ color:"#555", fontSize:15, lineHeight:1.8, margin:"0 0 48px" }}>
              From indie prototypes to commercial releases, I&apos;ve shipped projects across mobile, PC, and VR. I love pushing Unity&apos;s rendering pipeline to its limits with custom shaders and VFX Graph.
            </p>
            <div style={{ display:"flex", gap:48, marginBottom:56 }}>
            </div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:10, fontWeight:700, color:"#00cffc", textTransform:"uppercase", letterSpacing:"0.25em", marginBottom:20 }}>Experience</div>
            {[{role:"Unity Developer",company:"Freelance",period:"2022 — Present"},{role:"Game Dev Intern",company:"Indie Studio",period:"2020 — 2022"}].map(e => (
              <div key={e.role} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <div style={{ fontSize:15, color:"#ddd", fontWeight:500 }}>{e.role}</div>
                  <div style={{ fontSize:12, color:"#444", marginTop:2 }}>{e.company}</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:10, fontWeight:700, color:"#a1ffc2", textTransform:"uppercase", letterSpacing:"0.25em", marginBottom:28 }}>Tools &amp; Technologies</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
              {SKILLS.map(s => (
                <div key={s.name} style={{ display:"flex", alignItems:"center", gap:8, background:"#0f0f11", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"8px", padding:"10px 16px", cursor:"default", transition:"border-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor="rgba(161,255,194,0.3)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor="rgba(255,255,255,0.06)")}
                >
                  <span style={{ fontSize:16 }}>{s.icon}</span>
                  <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13, fontWeight:600, color:"#888" }}>{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WORK (games) ── */}
      <section id="work" style={{ padding: "120px 0", background: "#0e0e0f", position: "relative", zIndex: 1, overflow: "hidden" }}>
        <SectionBg color="#00cffc" variant="dots" />
        <div style={inner}>
          <div style={secLabel}>Selected Work</div>
          <h2 style={secTitle}>PROJECTS</h2>
          <p style={secSub}>Games shipped across PC, mobile, and web.</p>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
              <HamsterLoader />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 24 }}>
              {games.map(g => <GameCard key={g._id} game={g} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── ASSETS (hover-play videos) ── */}
      <section id="assets" style={{ padding: "120px 0", background: "#0e0e0f", position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.04)", overflow: "hidden" }}>
        <SectionBg color="#00cffc" variant="dots" />
        <div style={inner}>
          <div style={{ ...secLabel, color: "#00cffc" }}>Assets &amp; Clips</div>
          <h2 style={secTitle}>ASSET_SHOWCASE</h2>
          <p style={secSub}>Hover any card to watch the clip play instantly.</p>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
              <HamsterLoader />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
              {assets.map(g => <AssetCard key={g._id} game={g} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── GAME LINKS ── */}
      <section id="games" style={{ padding: "120px 0", background: "#0e0e0f", position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.04)", overflow: "hidden" }}>
        <SectionBg color="#a1ffc2" variant="dots" />
        <div style={inner}>
          <div style={secLabel}>Play My Games</div>
          <h2 style={secTitle}>GAME_LINKS</h2>
          <p style={secSub}>Live builds you can play right now.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
            {gamesWithLinks.map(g => (
              <a key={g._id} href={g.link} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 18, background: "#0f0f11", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "18px 22px", textDecoration: "none", transition: "border-color 0.3s,transform 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(161,255,194,0.3)"; e.currentTarget.style.transform="translateX(4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; e.currentTarget.style.transform="translateX(0)"; }}
              >
                <div style={{ width: 56, height: 56, flexShrink: 0, overflow: "hidden", borderRadius: "6px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.imageUrl} alt={g.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:14, fontWeight:700, color:"#fff", marginBottom:4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{g.title}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                    {g.tags?.slice(0,2).map(t => (
                      <span key={t} style={{ fontSize:9, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", padding:"2px 6px", borderRadius:"4px", background:"rgba(161,255,194,0.05)", border:"1px solid rgba(161,255,194,0.1)", color:"rgba(161,255,194,0.5)" }}>{t}</span>
                    ))}
                  </div>
                </div>
                <span style={{ fontSize:18, color:"#a1ffc2", flexShrink:0 }}>↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding:"120px 48px", background:"#0e0e0f", position:"relative", zIndex:1, overflow:"hidden" }}>
        <SectionBg color="#00cffc" variant="dots" />
        <div style={{ maxWidth:800, margin:"0 auto", background:"#0f0f11", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"16px", padding:"80px 64px", textAlign:"center", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 0%,rgba(161,255,194,0.06) 0%,transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"relative", zIndex:1 }}>
            <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"clamp(28px,4vw,48px)", fontWeight:800, letterSpacing:"-0.03em", margin:"0 0 20px" }}>LET&apos;S BUILD SOMETHING</h2>
            <p style={{ color:"#555", fontSize:17, margin:"0 0 48px", lineHeight:1.6 }}>Open for freelance projects, collaborations, and full-time roles.</p>
            <a href="mailto:hamza@example.com" style={{ display:"inline-block", fontFamily:"'Space Grotesk',sans-serif", fontSize:12, fontWeight:700, background:"#a1ffc2", color:"#00643a", padding:"16px 40px", textDecoration:"none", letterSpacing:"0.12em", textTransform:"uppercase" }}>Get In Touch</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.04)", padding:"40px 48px", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:10, color:"#333", textTransform:"uppercase", letterSpacing:"0.15em" }}>© 2024 HAMZA — UNITY GAME DEVELOPER</span>
          <div style={{ display:"flex", gap:28 }}>
            {["Twitter","LinkedIn","GitHub","Itch.io"].map(s => (
              <a key={s} href="#" style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:10, color:"#333", textDecoration:"none", textTransform:"uppercase", letterSpacing:"0.15em", transition:"color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color="#a1ffc2")}
                onMouseLeave={e => (e.currentTarget.style.color="#333")}
              >{s}</a>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ width:6, height:6, background:"#a1ffc2", borderRadius:"50%", boxShadow:"0 0 6px #a1ffc2" }} />
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:10, color:"#333", textTransform:"uppercase", letterSpacing:"0.15em" }}>Available for Work</span>
          </div>
        </div>
      </footer>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
