import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

interface ParticleData {
  ox: number; // original X in pixels
  oy: number; // original Y in pixels
  alpha: number; // current opacity
  seed: number;  // noise offset seed
}

export default function InteractiveBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  // Reference to track theme for the animation loop
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Set initial size
    let width = window.innerWidth;
    let height = window.innerHeight;

    // --- 1. Three.js Scene Setup ---
    const scene = new THREE.Scene();

    // Orthographic Camera where 1 unit = 1 pixel
    const camera = new THREE.OrthographicCamera(0, width, height, 0, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- 2. Create Grid Data ---
    const particlesData: ParticleData[] = [];
    const geometry = new THREE.BufferGeometry();

    const buildGrid = (w: number, h: number) => {
      // Clear previous lists
      particlesData.length = 0;

      // Calculate perfect columns/rows to match screen aspect ratio for 6,000 points
      const cols = Math.round(Math.sqrt(6000 * (w / h)));
      const rows = Math.round(6000 / cols);
      const particleCount = cols * rows;

      const cellW = w / cols;
      const cellH = h / rows;

      const positions = new Float32Array(particleCount * 3);
      const alphas = new Float32Array(particleCount);

      let idx = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ox = c * cellW + cellW / 2;
          const oy = r * cellH + cellH / 2;

          particlesData.push({
            ox,
            oy,
            alpha: 0.0,
            seed: Math.random() * Math.PI * 2
          });

          positions[idx * 3] = ox;
          positions[idx * 3 + 1] = oy;
          positions[idx * 3 + 2] = 0;

          alphas[idx] = 0.0;
          idx++;
        }
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));
    };

    buildGrid(width, height);

    // --- 3. Custom WebGL Shader for Anti-Aliased Circle Points ---
    const isDark = themeRef.current === "dark";
    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float alpha;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 4.0; // point size in screen pixels
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        uniform vec3 uColor;
        void main() {
          // Calculate distance from center of the point
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;
          // Soft alpha edge transition
          float intensity = smoothstep(0.5, 0.25, dist);
          gl_FragColor = vec4(uColor, intensity * vAlpha);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color(isDark ? 0xa1a1aa : 0x52525b) }
      },
      transparent: true,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, shaderMaterial);
    scene.add(points);

    // --- 4. Mouse Tracking ---
    const mouse = { x: -9999, y: -9999 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = window.innerHeight - e.clientY; // Flip Y for WebGL viewport origin
    };

    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    // --- 5. Resize Handler ---
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      renderer.setSize(width, height);
      camera.right = width;
      camera.top = height;
      camera.updateProjectionMatrix();

      buildGrid(width, height);
    };
    window.addEventListener("resize", handleResize);

    // --- 6. Animation Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const timeVal = clock.getElapsedTime();

      // Dynamic theme color update
      const darkThemeActive = themeRef.current === "dark";
      const targetColor = new THREE.Color(darkThemeActive ? 0xa1a1aa : 0x52525b);
      shaderMaterial.uniforms.uColor.value.lerp(targetColor, 0.08);

      const posAttribute = geometry.attributes.position;
      if (!posAttribute) return;
      const posArray = posAttribute.array as Float32Array;

      const alphaAttribute = geometry.attributes.alpha;
      if (!alphaAttribute) return;
      const alphaArray = alphaAttribute.array as Float32Array;

      const revealRadius = 110;
      const repelRadius = 60;
      const particleCount = particlesData.length;

      for (let i = 0; i < particleCount; i++) {
        const p = particlesData[i];
        const ox = p.ox;
        const oy = p.oy;

        // Calculate distance from mouse spotlight coordinate
        const dx = ox - mouse.x;
        const dy = oy - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // spotlight spotlight reveal logic
        let targetAlpha = 0.0;
        if (dist < revealRadius) {
          // fade opacity smoothly to 1.0 inside spotlight radius
          targetAlpha = 1.0 - dist / revealRadius;
        }

        p.alpha = THREE.MathUtils.lerp(p.alpha, targetAlpha, 0.08);
        alphaArray[i] = p.alpha;

        let bx = 0;
        let by = 0;
        let rx = 0;
        let ry = 0;
        let wx = 0;
        let wy = 0;

        // Only run physics calculations for visible points to maximize CPU performance
        if (p.alpha > 0.005) {
          // 1. Idle breathing sine oscillation
          bx = Math.sin(timeVal * 1.6 + p.seed) * 2.8;
          by = Math.cos(timeVal * 1.3 + p.seed) * 2.8;

          const angle = Math.atan2(dy, dx);

          // 2. Magnetic Repulsion inside ~60px with squared falloff
          if (dist < repelRadius && dist > 0.1) {
            const ratio = (repelRadius - dist) / repelRadius;
            const repelForce = ratio * ratio * 20.0; // push up to 20px
            rx = Math.cos(angle) * repelForce;
            ry = Math.sin(angle) * repelForce;
          }

          // 3. Ripple wave: sin(dist - time) radiating outward
          const wavePhase = dist * 0.12 - timeVal * 10.0;
          const waveAmt = Math.sin(wavePhase) * 3.8 * (1.0 - dist / revealRadius);
          wx = Math.cos(angle) * waveAmt;
          wy = Math.sin(angle) * waveAmt;
        }

        // Apply offsets to original grid slot position
        posArray[i * 3] = ox + bx + rx + wx;
        posArray[i * 3 + 1] = oy + by + ry + wy;
      }

      posAttribute.needsUpdate = true;
      alphaAttribute.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      shaderMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block" 
      />
    </div>
  );
}
