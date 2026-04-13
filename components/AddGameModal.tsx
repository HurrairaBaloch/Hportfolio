"use client";

import { useState, useRef } from "react";
import { X, Upload, Loader2, ImageIcon } from "lucide-react";

interface AddGameModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const TYPES = [
  { value: "game",    emoji: "🎮", label: "Game",    hint: "Projects + Game Links sections" },
  { value: "asset",   emoji: "✨", label: "Asset",   hint: "Asset Clips section (video plays on hover)" },
  { value: "project", emoji: "📦", label: "Project", hint: "Projects section only" },
];

export default function AddGameModal({ onClose, onSuccess }: AddGameModalProps) {
  const [type, setType] = useState("game");
  const [form, setForm] = useState({ title: "", description: "", link: "", tags: "" });
  const [file, setFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => { setFile(f); setPreview(URL.createObjectURL(f)); };
  
  const handleVideoFile = (f: File) => {
    // Check file size (max 15MB)
    if (f.size > 15 * 1024 * 1024) {
      setError("Video file must be under 15MB");
      return;
    }
    setVideoFile(f);
    setVideoPreview(URL.createObjectURL(f));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setError("Please select a thumbnail image");
    if (type === "asset" && !videoFile) return setError("Asset clips need a video/GIF file (max 15MB)");
    
    setLoading(true); setError(""); setUploadProgress("");
    try {
      let videoUrl = "";
      
      // If video file exists, upload directly to Cloudinary
      if (videoFile) {
        setUploadProgress("Uploading video to Cloudinary...");
        
        // Get signature from our API
        const sigRes = await fetch("/api/cloudinary-signature", { method: "POST" });
        const sigData = await sigRes.json();
        
        if (!sigData.success) throw new Error("Failed to get upload signature");
        
        // Upload directly to Cloudinary
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append("file", videoFile);
        cloudinaryFormData.append("api_key", sigData.apiKey);
        cloudinaryFormData.append("timestamp", sigData.timestamp);
        cloudinaryFormData.append("signature", sigData.signature);
        cloudinaryFormData.append("folder", sigData.folder);
        
        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`,
          { method: "POST", body: cloudinaryFormData }
        );
        
        const cloudinaryData = await cloudinaryRes.json();
        if (!cloudinaryData.secure_url) throw new Error("Video upload failed");
        
        videoUrl = cloudinaryData.secure_url;
        setUploadProgress("Video uploaded! Saving project...");
      } else {
        setUploadProgress("Uploading...");
      }
      
      // Now upload the rest via our API
      const fd = new FormData();
      fd.append("type", type);
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("link", form.link);
      fd.append("tags", form.tags);
      fd.append("image", file);
      if (videoUrl) fd.append("videoUrl", videoUrl); // Send URL instead of file
      
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Upload failed");
      
      setUploadProgress("Success!");
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploadProgress("");
    } finally { setLoading(false); }
  };

  const field: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
    padding: "11px 14px", fontSize: 13, color: "#fff", outline: "none",
    fontFamily: "'Manrope',sans-serif", boxSizing: "border-box",
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)" }} />

      <div style={{ position:"relative", width:"100%", maxWidth:500, background:"#0f0f11", border:"1px solid rgba(255,255,255,0.1)", boxShadow:"0 40px 100px rgba(0,0,0,0.7)", overflow:"hidden" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, fontWeight:700, color:"#fff" }}>Add New Entry</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", display:"flex", padding:4 }}><X size={18}/></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding:24, display:"flex", flexDirection:"column", gap:14, maxHeight:"82vh", overflowY:"auto" }}>

          {/* ── TYPE SELECTOR ── */}
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:10, fontWeight:700, color:"#a1ffc2", textTransform:"uppercase", letterSpacing:"0.25em", marginBottom:10 }}>
              Entry Type *
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => setType(t.value)} style={{
                  background: type === t.value ? "rgba(161,255,194,0.1)" : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${type === t.value ? "rgba(161,255,194,0.5)" : "rgba(255,255,255,0.07)"}`,
                  padding:"12px 8px", cursor:"pointer", textAlign:"center", transition:"all 0.2s",
                }}>
                  <div style={{ fontSize:20, marginBottom:5 }}>{t.emoji}</div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:12, fontWeight:700, color: type === t.value ? "#a1ffc2" : "#666", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>{t.label}</div>
                  <div style={{ fontSize:9, color:"#444", lineHeight:1.4 }}>{t.hint}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ── IMAGE DROP ZONE ── */}
          <div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:10, fontWeight:700, color:"#a1ffc2", textTransform:"uppercase", letterSpacing:"0.25em", marginBottom:10 }}>
              Thumbnail Image *
            </div>
            <div
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if(f) handleFile(f); }}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              style={{ position:"relative", aspectRatio:"16/9", border:"2px dashed rgba(255,255,255,0.08)", cursor:"pointer", overflow:"hidden", background:"rgba(255,255,255,0.02)", display:"flex", alignItems:"center", justifyContent:"center", transition:"border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor="rgba(161,255,194,0.35)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor="rgba(255,255,255,0.08)")}
            >
              {preview
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={preview} alt="preview" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                : <div style={{ textAlign:"center" }}>
                    <ImageIcon size={28} color="#333" style={{ marginBottom:8 }} />
                    <p style={{ fontSize:12, color:"#444", margin:0 }}>Drop image or click to browse</p>
                  </div>
              }
              <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }}
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
          </div>

          {/* ── VIDEO/GIF DROP ZONE (for assets) ── */}
          {type === "asset" && (
            <div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:10, fontWeight:700, color:"#00cffc", textTransform:"uppercase", letterSpacing:"0.25em", marginBottom:10 }}>
                Video/GIF File * (plays on hover, max 15MB)
              </div>
              <div
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if(f) handleVideoFile(f); }}
                onDragOver={e => e.preventDefault()}
                onClick={() => videoRef.current?.click()}
                style={{ position:"relative", aspectRatio:"16/9", border:"2px dashed rgba(0,207,252,0.2)", cursor:"pointer", overflow:"hidden", background:"rgba(0,207,252,0.03)", display:"flex", alignItems:"center", justifyContent:"center", transition:"border-color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor="rgba(0,207,252,0.5)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor="rgba(0,207,252,0.2)")}
              >
                {videoPreview
                  ? (videoFile?.type.startsWith('video/')
                      ? <video src={videoPreview} style={{ width:"100%", height:"100%", objectFit:"cover" }} muted loop autoPlay />
                      // eslint-disable-next-line @next/next/no-img-element
                      : <img src={videoPreview} alt="video preview" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    )
                  : <div style={{ textAlign:"center" }}>
                      <Upload size={28} color="#00cffc" style={{ marginBottom:8, opacity:0.5 }} />
                      <p style={{ fontSize:12, color:"#00cffc", margin:0, opacity:0.7 }}>Drop video/GIF or click to browse</p>
                      <p style={{ fontSize:10, color:"#00cffc", margin:"4px 0 0", opacity:0.5 }}>MP4, WEBM, MOV, or GIF (max 15MB)</p>
                    </div>
                }
                <input ref={videoRef} type="file" accept="video/*,.gif" style={{ display:"none" }}
                  onChange={e => e.target.files?.[0] && handleVideoFile(e.target.files[0])} />
              </div>
              {videoFile && (
                <p style={{ fontSize:11, color:"#00cffc", margin:"8px 0 0", opacity:0.8 }}>
                  ✓ {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)}MB)
                </p>
              )}
            </div>
          )}

          {/* Title */}
          <input required type="text" placeholder="Title *" value={form.title}
            onChange={e => setForm({...form, title:e.target.value})} style={field}
            onFocus={e => (e.target.style.borderColor="rgba(161,255,194,0.4)")}
            onBlur={e => (e.target.style.borderColor="rgba(255,255,255,0.09)")} />

          {/* Description */}
          <textarea required rows={3} placeholder="Short description *" value={form.description}
            onChange={e => setForm({...form, description:e.target.value})} 
            style={{...field, resize:"vertical", minHeight:"80px"}}
            onFocus={e => (e.target.style.borderColor="rgba(161,255,194,0.4)")}
            onBlur={e => (e.target.style.borderColor="rgba(255,255,255,0.09)")} />

          {/* Tags */}
          <input type="text" placeholder="Tags: Unity, C#, VFX (comma separated)" value={form.tags}
            onChange={e => setForm({...form, tags:e.target.value})} style={field}
            onFocus={e => (e.target.style.borderColor="rgba(161,255,194,0.4)")}
            onBlur={e => (e.target.style.borderColor="rgba(255,255,255,0.09)")} />

          {/* Project link */}
          <input type="url" placeholder="Project / game link (optional)" value={form.link}
            onChange={e => setForm({...form, link:e.target.value})} style={field}
            onFocus={e => (e.target.style.borderColor="rgba(161,255,194,0.4)")}
            onBlur={e => (e.target.style.borderColor="rgba(255,255,255,0.09)")} />

          {error && (
            <div style={{ background:"rgba(255,80,80,0.08)", border:"1px solid rgba(255,80,80,0.2)", padding:"10px 14px", fontSize:12, color:"#ff6b6b" }}>
              {error}
            </div>
          )}

          {uploadProgress && (
            <div style={{ background:"rgba(161,255,194,0.08)", border:"1px solid rgba(161,255,194,0.2)", padding:"10px 14px", fontSize:12, color:"#a1ffc2", textAlign:"center" }}>
              {uploadProgress}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            background: loading ? "rgba(161,255,194,0.5)" : "#a1ffc2",
            color:"#00643a", border:"none", padding:"14px 0",
            fontFamily:"'Space Grotesk',sans-serif", fontSize:13, fontWeight:700,
            textTransform:"uppercase", letterSpacing:"0.1em",
            cursor: loading ? "not-allowed" : "pointer", width:"100%", transition:"background 0.2s",
          }}>
            {loading
              ? <><Loader2 size={15} style={{ animation:"spin 1s linear infinite" }} /> {uploadProgress || "Uploading..."}</>
              : <><Upload size={15} /> Add Entry</>
            }
          </button>
        </form>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
