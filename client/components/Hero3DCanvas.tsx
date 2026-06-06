import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// Check if WebGL is supported
function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

// 3D DNA Helix & Lines component
function InteractiveDnaHelix({ isMobile }: { isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Helix dimensions
  const count = isMobile ? 60 : 120; // Reduced count on mobile for performance
  const r = 2.4;
  const helixHeight = 12;
  const turns = 2.5;

  // Generate DNA strands positions & colors
  const { positions, colors } = useMemo(() => {
    const posArray = new Float32Array(count * 2 * 3);
    const colorArray = new Float32Array(count * 2 * 3);

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2 * turns;
      const y = (i / count) * helixHeight - helixHeight / 2;

      // Strand 1
      const x1 = r * Math.cos(t);
      const z1 = r * Math.sin(t);
      posArray[i * 6] = x1;
      posArray[i * 6 + 1] = y;
      posArray[i * 6 + 2] = z1;

      // Color 1: Primary Teal/Blue to Accent Purple gradient
      const ratio = i / count;
      colorArray[i * 6] = 0.2 + ratio * 0.4;      // Red
      colorArray[i * 6 + 1] = 0.6 + (1 - ratio) * 0.3; // Green
      colorArray[i * 6 + 2] = 0.9;                     // Blue

      // Strand 2 (180 deg out of phase)
      const x2 = r * Math.cos(t + Math.PI);
      const z2 = r * Math.sin(t + Math.PI);
      posArray[i * 6 + 3] = x2;
      posArray[i * 6 + 4] = y;
      posArray[i * 6 + 5] = z2;

      // Color 2: Violet/Pink accent
      colorArray[i * 6 + 3] = 0.7 + (1 - ratio) * 0.2;
      colorArray[i * 6 + 4] = 0.3 + ratio * 0.4;
      colorArray[i * 6 + 5] = 0.9;
    }

    return { positions: posArray, colors: colorArray };
  }, [count, r, helixHeight, turns]);

  // Generate DNA Rung lines connecting the two strands
  const linePositions = useMemo(() => {
    const lines = new Float32Array(count * 2 * 3); // 2 vertices per rung, 3 coords per vertex
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2 * turns;
      const y = (i / count) * helixHeight - helixHeight / 2;

      const x1 = r * Math.cos(t);
      const z1 = r * Math.sin(t);
      const x2 = r * Math.cos(t + Math.PI);
      const z2 = r * Math.sin(t + Math.PI);

      // Vertex 1 (Strand 1)
      lines[i * 6] = x1;
      lines[i * 6 + 1] = y;
      lines[i * 6 + 2] = z1;

      // Vertex 2 (Strand 2)
      lines[i * 6 + 3] = x2;
      lines[i * 6 + 4] = y;
      lines[i * 6 + 5] = z2;
    }
    return lines;
  }, [count, r, helixHeight, turns]);

  // Frame loop animations: Continuous rotate + Mouse parallax tilt
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Auto-spin helix
    groupRef.current.rotation.y += 0.003;
    
    // Gently wave the strands
    const elapsed = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(elapsed * 0.5) * 0.2;

    if (!isMobile) {
      // Interpolate rotation based on mouse coordinates for responsive parallax
      const targetX = state.mouse.x * 0.3;
      const targetY = state.mouse.y * 0.3;

      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetY, 0.05);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -targetX, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Helix Strands (Points) */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isMobile ? 0.18 : 0.22}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 2. Connecting DNA Rungs (Line Segments) */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#3B82F6"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

// Interactive floating background dust/particles
function AmbientFloatingDust({ count = 300 }) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30; // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20; // Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20; // Z
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const elapsed = state.clock.getElapsedTime();
    // Slowly drift particles down-right
    pointsRef.current.rotation.y = elapsed * 0.01;
    pointsRef.current.rotation.x = elapsed * 0.005;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#60A5FA"
        transparent
        opacity={0.4}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Hero3DCanvas() {
  const [webglSupported, setWebglSupported] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setWebglSupported(checkWebGLSupport());

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!webglSupported) {
    // Beautiful pure CSS animated gradient grid background fallback if WebGL is unavailable
    return (
      <div className="absolute inset-0 bg-slate-950 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 animate-pulse" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-5000" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[140px] mix-blend-screen animate-pulse duration-[7000ms]" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden bg-transparent select-none pointer-events-none">
      {/* Dynamic 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#3B82F6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#EC4899" />
        <InteractiveDnaHelix isMobile={isMobile} />
        <AmbientFloatingDust count={isMobile ? 120 : 400} />
      </Canvas>

      {/* Modern Vignette Layer & radial fade to focus overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(var(--background),0.85)_95%)] pointer-events-none" />
    </div>
  );
}
