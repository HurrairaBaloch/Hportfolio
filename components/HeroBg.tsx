"use client";

import { useEffect, useRef } from "react";

// ─── Chase scene state machine ────────────────────────────────────────────────
// Phase 1: Man runs right chasing Cat (cat runs right faster)
// Phase 2: Cat reaches right edge → cat turns, now has sword AND rides a horse, chases Man left
// Phase 3: Man reaches left edge → man turns, now has sword, chases Cat right
// Loop forever

interface ChaseScene {
  manX: number;
  catX: number;
  phase: "man_chases_cat" | "cat_chases_man";
  manFrame: number;
  catFrame: number;
  frameTimer: number;
  manSpeed: number;
  catSpeed: number;
  groundY: number;
  // panic text
  panicTimer: number;
  panicText: string;
  showPanic: boolean;
}

interface FloatParticle {
  x: number; y: number; vx: number; vy: number;
  char: string; opacity: number; life: number; maxLife: number;
  size: number; color: string;
}

interface Bird {
  x: number; y: number; vx: number; frame: number;
}

interface Cloud {
  x: number; y: number; vx: number; size: number;
}

const CHARS = ["▲","◆","{ }","C#","//","[ ]","&&","∞","⚡","◈","01","</>"];
const PCOLS = ["rgba(161,255,194,","rgba(0,207,252,","rgba(172,137,255,"];

function spawnParticle(W: number, H: number): FloatParticle {
  const maxLife = 200 + Math.random() * 200;
  return {
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.3, vy: -0.15 - Math.random() * 0.3,
    char: CHARS[Math.floor(Math.random() * CHARS.length)],
    opacity: 0, life: Math.random() * maxLife, maxLife,
    size: 10 + Math.random() * 7,
    color: PCOLS[Math.floor(Math.random() * PCOLS.length)],
  };
}

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function drawMan(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  frame: number,
  flip: boolean,
  hasSword: boolean,
  scared: boolean
) {
  const s = 4; // pixel size
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.globalAlpha = 0.92;

  const bodyColor = scared ? "#ff9966" : "#a1ffc2";
  const skinColor = "#ffcc99";
  const hairColor = "#333";

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 2, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs (animated)
  const legSwing = Math.sin(frame * 0.8) * 6;
  ctx.fillStyle = "#4466aa";
  // left leg
  ctx.fillRect(-5, 10, s, 10 + legSwing);
  // right leg
  ctx.fillRect(1, 10, s, 10 - legSwing);

  // Feet
  ctx.fillStyle = "#222";
  ctx.fillRect(-6, 20 + legSwing, 6, s);
  ctx.fillRect(0, 20 - legSwing, 6, s);

  // Body
  ctx.fillStyle = bodyColor;
  ctx.fillRect(-6, 0, 12, 12);

  // Arms (animated)
  const armSwing = Math.sin(frame * 0.8) * 5;
  ctx.fillStyle = bodyColor;
  ctx.fillRect(-10, 2 + armSwing, 5, 8);
  ctx.fillRect(5, 2 - armSwing, 5, 8);

  // Head
  ctx.fillStyle = skinColor;
  ctx.fillRect(-5, -10, 10, 10);

  // Hair
  ctx.fillStyle = hairColor;
  ctx.fillRect(-5, -10, 10, 3);

  // Eyes — scared = wide open
  ctx.fillStyle = "#000";
  if (scared) {
    ctx.fillRect(-3, -8, 3, 4);
    ctx.fillRect(1, -8, 3, 4);
    // sweat drop
    ctx.fillStyle = "#88ccff";
    ctx.fillRect(5, -6, 2, 4);
  } else {
    ctx.fillRect(-3, -7, 2, 2);
    ctx.fillRect(1, -7, 2, 2);
  }

  // Sword (if has sword)
  if (hasSword) {
    ctx.fillStyle = "#aaddff";
    ctx.fillRect(8, -4, 3, 20); // blade
    ctx.fillStyle = "#ffaa00";
    ctx.fillRect(6, 4, 7, 3);   // guard
    ctx.fillStyle = "#884400";
    ctx.fillRect(9, 7, 2, 6);   // handle
  }

  ctx.restore();
}

function drawCat(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  frame: number,
  flip: boolean,
  hasSword: boolean
) {
  const s = 4;
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.globalAlpha = 0.92;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 4, 12, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs (4 legs visible from side, animated walking)
  const legSwing = Math.sin(frame * 1.1) * 5;
  ctx.fillStyle = "#ff6699";
  // Front legs
  ctx.fillRect(6, 4, s, 10 + legSwing);
  ctx.fillRect(10, 4, s, 10 - legSwing);
  // Back legs
  ctx.fillRect(-10, 4, s, 10 - legSwing);
  ctx.fillRect(-6, 4, s, 10 + legSwing);

  // Paws
  ctx.fillStyle = "#ff4488";
  ctx.fillRect(6, 14 + legSwing, 5, 2);
  ctx.fillRect(10, 14 - legSwing, 5, 2);
  ctx.fillRect(-10, 14 - legSwing, 5, 2);
  ctx.fillRect(-6, 14 + legSwing, 5, 2);

  // Body (elongated for side view)
  ctx.fillStyle = "#ff88bb";
  ctx.fillRect(-12, -6, 24, 12);

  // Tail (curved, wagging)
  const tailWag = Math.sin(frame * 0.6) * 8;
  ctx.strokeStyle = "#ff6699";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-12, 0);
  ctx.quadraticCurveTo(-20, 0 + tailWag, -18, -10 + tailWag);
  ctx.stroke();

  // Head (side profile)
  ctx.fillStyle = "#ff88bb";
  ctx.fillRect(10, -10, 12, 10);

  // Ear (pointed triangle)
  ctx.fillStyle = "#ff6699";
  ctx.beginPath();
  ctx.moveTo(14, -10);
  ctx.lineTo(16, -16);
  ctx.lineTo(18, -10);
  ctx.fill();

  // Eye (side view - one eye visible)
  ctx.fillStyle = "#000";
  if (hasSword) {
    // Angry eye
    ctx.fillRect(16, -8, 4, 2);
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(16, -7, 4, 1);
  } else {
    // Normal eye
    ctx.fillRect(16, -7, 3, 3);
    // Shine
    ctx.fillStyle = "#fff";
    ctx.fillRect(17, -7, 1, 1);
  }

  // Nose (side profile)
  ctx.fillStyle = "#ff4488";
  ctx.fillRect(21, -5, 2, 2);

  // Mouth (small line)
  ctx.strokeStyle = "#ff4488";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(22, -3);
  ctx.lineTo(20, -2);
  ctx.stroke();

  // Whiskers (from side)
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.moveTo(22, -6); ctx.lineTo(30, -7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(22, -4); ctx.lineTo(30, -4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(22, -2); ctx.lineTo(30, -1); ctx.stroke();
  ctx.globalAlpha = 0.92;

  // Sword (if has sword)
  if (hasSword) {
    ctx.fillStyle = "#aaddff";
    ctx.fillRect(12, -12, 3, 28); // blade (longer)
    ctx.fillStyle = "#ffaa00";
    ctx.fillRect(10, 4, 7, 3);   // guard
    ctx.fillStyle = "#884400";
    ctx.fillRect(13, 7, 2, 8);   // handle
  }

  ctx.restore();
}

function drawHorse(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  frame: number,
  flip: boolean
) {
  const s = 4;
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.globalAlpha = 0.92;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 8, 20, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs (animated gallop)
  const legSwing = Math.sin(frame * 1.2) * 8;
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(-12, 10, s, 12 + legSwing);
  ctx.fillRect(-4, 10, s, 12 - legSwing);
  ctx.fillRect(4, 10, s, 12 - legSwing);
  ctx.fillRect(12, 10, s, 12 + legSwing);

  // Hooves
  ctx.fillStyle = "#654321";
  ctx.fillRect(-13, 22 + legSwing, 6, s);
  ctx.fillRect(-5, 22 - legSwing, 6, s);
  ctx.fillRect(3, 22 - legSwing, 6, s);
  ctx.fillRect(11, 22 + legSwing, 6, s);

  // Body
  ctx.fillStyle = "#A0522D";
  ctx.fillRect(-16, -4, 32, 16);

  // Neck (pointing forward)
  ctx.fillRect(10, -12, 8, 12);

  // Head (at front)
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(12, -18, 10, 8);

  // Ear
  ctx.fillStyle = "#654321";
  ctx.fillRect(16, -22, 4, 5);

  // Eye
  ctx.fillStyle = "#000";
  ctx.fillRect(17, -16, 2, 2);

  // Mane
  ctx.fillStyle = "#654321";
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(10 + i * 3, -8 + Math.sin(frame * 0.5 + i) * 2, 3, 6);
  }

  // Tail (wagging at back)
  const tailWag = Math.sin(frame * 0.8) * 10;
  ctx.strokeStyle = "#654321";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-16, 4);
  ctx.quadraticCurveTo(-26, 4 + tailWag, -22, -8 + tailWag);
  ctx.stroke();

  ctx.restore();
}

function drawBird(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = 0.6;
  
  const wingFlap = Math.sin(frame * 0.3) * 8;
  
  // Body
  ctx.fillStyle = "#666";
  ctx.fillRect(-3, -2, 6, 4);
  
  // Wings
  ctx.fillStyle = "#555";
  ctx.beginPath();
  ctx.moveTo(-3, 0);
  ctx.lineTo(-8, -4 + wingFlap);
  ctx.lineTo(-6, 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(3, 0);
  ctx.lineTo(8, -4 + wingFlap);
  ctx.lineTo(6, 2);
  ctx.fill();
  
  ctx.restore();
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "#fff";
  
  ctx.beginPath();
  ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
  ctx.arc(x + size * 0.4, y, size * 0.4, 0, Math.PI * 2);
  ctx.arc(x - size * 0.4, y, size * 0.4, 0, Math.PI * 2);
  ctx.arc(x, y - size * 0.3, size * 0.35, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function drawSpeechBubble(ctx: CanvasRenderingContext2D, x: number, y: number, text: string) {
  ctx.save();
  const pad = 8;
  ctx.font = "bold 13px 'Space Grotesk', sans-serif";
  const tw = ctx.measureText(text).width;
  const bw = tw + pad * 2;
  const bh = 26;
  const bx = x - bw / 2;
  const by = y - bh - 10;

  // Bubble
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 6);
  ctx.fill();

  // Tail
  ctx.beginPath();
  ctx.moveTo(x - 5, by + bh);
  ctx.lineTo(x, by + bh + 8);
  ctx.lineTo(x + 5, by + bh);
  ctx.fill();

  // Text
  ctx.fillStyle = "#111";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, by + bh / 2);
  ctx.restore();
}

export default function HeroBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<FloatParticle[]>([]);
  const birdsRef = useRef<Bird[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const sceneRef = useRef<ChaseScene | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Reset scene on resize
      sceneRef.current = makeScene(canvas.width, canvas.height);
    };

    const makeScene = (W: number, H: number): ChaseScene => ({
      manX: W * 0.25,
      catX: W * 0.45,
      phase: "man_chases_cat",
      manFrame: 0,
      catFrame: 0,
      frameTimer: 0,
      manSpeed: 2.2,
      catSpeed: 3.0,
      groundY: H * 0.72,
      panicTimer: 0,
      panicText: "WAIT!!",
      showPanic: false,
    });

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; });

    // Init particles
    for (let i = 0; i < 40; i++) particlesRef.current.push(spawnParticle(canvas.width, canvas.height));

    // Init birds
    for (let i = 0; i < 3; i++) {
      birdsRef.current.push({
        x: Math.random() * canvas.width,
        y: 50 + Math.random() * 150,
        vx: 0.5 + Math.random() * 1,
        frame: Math.random() * 100,
      });
    }

    // Init clouds
    for (let i = 0; i < 5; i++) {
      cloudsRef.current.push({
        x: Math.random() * canvas.width,
        y: 30 + Math.random() * 100,
        vx: 0.1 + Math.random() * 0.3,
        size: 40 + Math.random() * 30,
      });
    }

    const MAN_TEXTS_CHASE  = ["WAIT!!","COME BACK!","MEOW??","MY SWORD!","NOOOO!"];
    const CAT_TEXTS_CHASE  = ["HISSSS","REVENGE!","GET HIM!","MEOWR!!","⚔️ DIE!"];
    const MAN_TEXTS_SCARED = ["HELP!!","OH NO!","AHHHHH!","MAMA!!","RUN RUN!"];

    let tick = 0;

    const draw = () => {
      tick++;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // ── Grid ──
      ctx.strokeStyle = "rgba(161,255,194,0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      // ── Mouse glow ──
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      if (mx > 0) {
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, 280);
        g.addColorStop(0, "rgba(161,255,194,0.055)");
        g.addColorStop(1, "rgba(161,255,194,0)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }

      // ── Ground line ──
      const sc = sceneRef.current;
      if (sc) {
        const gg = ctx.createLinearGradient(0, 0, W, 0);
        gg.addColorStop(0, "transparent");
        gg.addColorStop(0.2, "rgba(161,255,194,0.08)");
        gg.addColorStop(0.8, "rgba(161,255,194,0.08)");
        gg.addColorStop(1, "transparent");
        ctx.strokeStyle = gg; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, sc.groundY + 24); ctx.lineTo(W, sc.groundY + 24); ctx.stroke();
      }

      // ── Particles ──
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life++; p.x += p.vx; p.y += p.vy;
        const prog = p.life / p.maxLife;
        p.opacity = prog < 0.15 ? prog / 0.15 : prog > 0.75 ? 1 - (prog - 0.75) / 0.25 : 1;
        const dx = p.x - mx, dy = p.y - my, dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < 100) { p.vx += (dx/dist)*0.05; p.vy += (dy/dist)*0.05; }
        p.vx *= 0.99; p.vy *= 0.99;
        ctx.save();
        ctx.globalAlpha = p.opacity * 0.4;
        ctx.font = `${p.size}px 'Space Grotesk',monospace`;
        ctx.fillStyle = `${p.color}${p.opacity * 0.4})`;
        ctx.fillText(p.char, p.x, p.y);
        ctx.restore();
        if (p.life >= p.maxLife || p.y < -20 || p.x < -50 || p.x > W + 50)
          particlesRef.current[i] = spawnParticle(W, H);
      }

      // ── Clouds ──
      for (const cloud of cloudsRef.current) {
        cloud.x += cloud.vx;
        if (cloud.x > W + cloud.size) cloud.x = -cloud.size;
        drawCloud(ctx, cloud.x, cloud.y, cloud.size);
      }

      // ── Birds ──
      for (const bird of birdsRef.current) {
        bird.x += bird.vx;
        bird.frame++;
        if (bird.x > W + 20) {
          bird.x = -20;
          bird.y = 50 + Math.random() * 150;
        }
        drawBird(ctx, bird.x, bird.y, bird.frame);
      }

      // ── Chase scene ──
      if (sc) {
        sc.frameTimer++;
        if (sc.frameTimer % 6 === 0) {
          sc.manFrame++;
          sc.catFrame++;
        }

        // Panic text timer
        if (sc.showPanic) {
          sc.panicTimer--;
          if (sc.panicTimer <= 0) sc.showPanic = false;
        }
        // Randomly show panic text
        if (!sc.showPanic && tick % 90 === 0) {
          sc.showPanic = true;
          sc.panicTimer = 60;
          if (sc.phase === "man_chases_cat") {
            sc.panicText = MAN_TEXTS_CHASE[Math.floor(Math.random() * MAN_TEXTS_CHASE.length)];
          } else {
            sc.panicText = MAN_TEXTS_SCARED[Math.floor(Math.random() * MAN_TEXTS_SCARED.length)];
          }
        }
        // Cat text
        const showCatText = tick % 120 === 0;
        let catText = "";
        if (showCatText) {
          catText = sc.phase === "cat_chases_man"
            ? CAT_TEXTS_CHASE[Math.floor(Math.random() * CAT_TEXTS_CHASE.length)]
            : "...";
        }

        if (sc.phase === "man_chases_cat") {
          // Man runs right, cat runs right faster
          sc.manX += sc.manSpeed;
          sc.catX += sc.catSpeed;

          // Cat reaches right edge → flip phase
          if (sc.catX > W + 60) {
            sc.catX = W + 20;
            sc.phase = "cat_chases_man";
            sc.showPanic = true;
            sc.panicTimer = 80;
            sc.panicText = "OH NO!!";
          }

          // Draw man (running right, no sword, not scared yet)
          drawMan(ctx, sc.manX, sc.groundY, sc.manFrame, false, false, false);
          // Draw cat (running right, no sword)
          drawCat(ctx, sc.catX, sc.groundY, sc.catFrame, false, false);

          // Speech bubble on man
          if (sc.showPanic) drawSpeechBubble(ctx, sc.manX, sc.groundY - 30, sc.panicText);

          // Man wraps around left if he goes off right
          if (sc.manX > W + 60) sc.manX = -40;

        } else {
          // Cat runs left (flipped), man runs left faster (scared)
          // CAT IS NOW RIDING A HORSE!
          sc.catX -= sc.catSpeed + 0.5;
          sc.manX -= sc.manSpeed + 1.5;

          // Man reaches left edge → flip phase back
          if (sc.manX < -80) {
            sc.manX = -30;
            sc.catX = sc.manX + 120;
            sc.phase = "man_chases_cat";
            sc.showPanic = true;
            sc.panicTimer = 80;
            sc.panicText = "COME BACK!";
          }

          // Draw horse first (behind cat)
          drawHorse(ctx, sc.catX, sc.groundY + 10, sc.catFrame, true);
          
          // Draw cat on horse (running left = flipped, has sword, angry)
          drawCat(ctx, sc.catX, sc.groundY - 20, sc.catFrame, true, true);
          
          // Draw man (running left = flipped, scared, no sword)
          drawMan(ctx, sc.manX, sc.groundY, sc.manFrame, true, false, true);

          // Speech bubble on man (scared)
          if (sc.showPanic) drawSpeechBubble(ctx, sc.manX, sc.groundY - 30, sc.panicText);
          // Cat speech
          if (catText && catText !== "...") drawSpeechBubble(ctx, sc.catX, sc.groundY - 50, catText);
        }
      }

      // ── Scanlines ──
      for (let y = 0; y < H; y += 4) {
        ctx.fillStyle = "rgba(0,0,0,0.02)";
        ctx.fillRect(0, y, W, 1);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position:"fixed", top:0, left:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0 }}
    />
  );
}
