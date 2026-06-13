import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface Particle {
  tx: number; // Target X coordinate
  ty: number; // Target Y coordinate
  x: number;  // Current X coordinate
  y: number;  // Current Y coordinate
  spawnY: number;
  delay: number; // Staggered delay in seconds
  seed: number;
  orbitRadius: number;
  orbitAngle: number;
}

export default function SwasthAIParticleText() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  // Mouse coordinates mapped to canvas 600x150 resolution
  const mouseRef = useRef({ x: -999, y: -999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // --- 1. Offscreen canvas to render target text and read pixel map ---
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 600;
    tempCanvas.height = 150;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.fillStyle = "#ffffff";
    tempCtx.font = "300 98px Georgia, serif";
    tempCtx.textAlign = "center";
    tempCtx.textBaseline = "middle";
    tempCtx.fillText("SwasthAI", 300, 75);

    const imgData = tempCtx.getImageData(0, 0, 600, 150);
    const data = imgData.data;

    // --- 2. Extract coordinates for particles ---
    const activePoints: Array<{ tx: number; ty: number }> = [];
    
    // Scan all pixels
    for (let y = 0; y < 150; y++) {
      for (let x = 0; x < 600; x++) {
        const idx = (y * 600 + x) * 4;
        if (data[idx + 3] > 120) {
          activePoints.push({ tx: x, ty: y });
        }
      }
    }

    // Target ~2000 particles. Select subset accordingly.
    const targetParticleCount = 2000;
    const step = Math.max(1, Math.floor(activePoints.length / targetParticleCount));
    const particles: Particle[] = [];

    for (let i = 0; i < activePoints.length; i += step) {
      if (particles.length >= targetParticleCount) break;
      const pt = activePoints[i];
      particles.push({
        tx: pt.tx,
        ty: pt.ty,
        x: -300, // Spawn from x = -300
        y: 0,
        spawnY: Math.random() * 150, // Random spawn height
        delay: Math.random() * 1.2, // Staggered delays (0 - 1.2s)
        seed: Math.random() * Math.PI * 2,
        orbitRadius: 80 + Math.random() * 100, // Initial orbit radius for spiral
        orbitAngle: Math.random() * Math.PI * 2
      });
    }

    // --- 3. Animation Loop ---
    let animationFrameId: number;
    const startTime = Date.now();
    const totalDuration = 3.2;

    const tick = () => {
      const elapsed = (Date.now() - startTime) / 1000; // time in seconds

      // Clear main canvas
      ctx.clearRect(0, 0, 600, 150);

      // Interpolate opacity of solid wordmark after assembly begins (starts at 1.8s, fully solid at 2.8s)
      const wordmarkOpacity = Math.min(Math.max((elapsed - 1.8) / 1.0, 0), 1);
      const particleOpacity = Math.max(0.08, 1.0 - (wordmarkOpacity * 0.85)); // particles fade to 15% opacity but stay active

      // Draw active particles
      const isDark = theme === "dark";
      ctx.fillStyle = isDark 
        ? `rgba(161, 161, 170, ${particleOpacity})` // Zinc-400 for dark mode particles
        : `rgba(82, 82, 91, ${particleOpacity})`;  // Zinc-600 for light mode particles

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        let px = p.x;
        let py = p.y;

        if (elapsed >= p.delay) {
          const at = elapsed - p.delay; // active time for particle
          const flowDuration = 0.8;
          const spiralDuration = 1.0;

          if (at < flowDuration) {
            // Flow phase: travel rightward with sine-wave drift
            const flowRatio = at / flowDuration;
            px = -300 + flowRatio * (p.tx + 300);
            py = p.spawnY + Math.sin(flowRatio * Math.PI * 3.5 + p.seed) * 22.0 * (1.0 - flowRatio);
          } else if (at < flowDuration + spiralDuration) {
            // Spiral phase: orbit around target with decaying radius
            const st = at - flowDuration;
            const decay = Math.exp(-st * 3.2); // decaying radius factor
            const r = p.orbitRadius * decay;
            const angle = p.orbitAngle + st * 14.0; // spiral angular velocity
            
            px = p.tx + Math.cos(angle) * r;
            py = p.ty + Math.sin(angle) * r;
          } else {
            // Fully assembled lock state
            px = p.tx;
            py = p.ty;
          }
        } else {
          // Stay at spawn location before delay trigger
          px = -300;
          py = p.spawnY;
        }

        // Apply mouse interaction/repulsion
        const mouse = mouseRef.current;
        if (mouse.active && elapsed >= p.delay) {
          const dx = mouse.x - px;
          const dy = mouse.y - py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repelRadius = 45;

          if (dist < repelRadius) {
            const ratio = (repelRadius - dist) / repelRadius;
            const push = ratio * ratio * 15.0; // push velocity factor
            const angle = Math.atan2(dy, dx);
            px -= Math.cos(angle) * push;
            py -= Math.sin(angle) * push;
          }
        }

        // Draw particle pixel
        ctx.fillRect(px, py, 1.2, 1.2);
      }

      // Draw solid wordmark once cross-fade opacity builds
      if (wordmarkOpacity > 0.01) {
        ctx.save();
        ctx.globalAlpha = wordmarkOpacity;
        ctx.font = "300 98px Georgia, serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Premium 2px offset shadow for subtle depth
        ctx.shadowColor = isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.18)";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 3;

        // Premium theme-aware metallic grey linear gradient
        const grad = ctx.createLinearGradient(120, 0, 480, 0);
        if (isDark) {
          grad.addColorStop(0, "rgb(180, 180, 185)");   // zinc-300 grey
          grad.addColorStop(0.5, "rgb(244, 244, 245)"); // zinc-100 silver grey
          grad.addColorStop(1, "rgb(113, 113, 122)");   // zinc-500 medium grey
        } else {
          grad.addColorStop(0, "rgb(63, 63, 70)");      // zinc-700 charcoal grey
          grad.addColorStop(0.5, "rgb(113, 113, 122)"); // zinc-500 medium grey
          grad.addColorStop(1, "rgb(39, 39, 42)");      // zinc-800 deep charcoal grey
        }
        ctx.fillStyle = grad;

        ctx.fillText("SwasthAI", 300, 75);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  // Handle canvas mouse tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = 600 / rect.width;
    const scaleY = 150 / rect.height;
    mouseRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      active: true
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
  };

  return (
    <div className="w-[210px] sm:w-[290px] md:w-[320px] h-[52px] sm:h-[72px] md:h-[80px] inline-block align-middle relative translate-y-[-2px] sm:translate-y-[-4px]">
      <canvas
        ref={canvasRef}
        width={600}
        height={150}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full block cursor-pointer select-none"
      />
    </div>
  );
}
