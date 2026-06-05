import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Stars, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function HealthcareSphere() {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  useEffect(() => {
    if (!particlesRef.current) return;

    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = (Math.random() - 0.5) * 8;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }

    particlesRef.current.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.0002;
      groupRef.current.rotation.y += 0.0005;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.x += 0.0001;
      particlesRef.current.rotation.y += 0.0003;
    }
  });

  return (
    <>
      <group ref={groupRef}>
        <Sphere args={[2, 128, 128]}>
          <meshPhongMaterial
            color="#60A5FA"
            emissive="#38BDF8"
            emissiveIntensity={0.3}
            wireframe={true}
            wireframeLinewidth={0.1}
          />
        </Sphere>
        <Sphere args={[2.05, 128, 128]}>
          <meshPhongMaterial
            color="#60A5FA"
            emissive="#38BDF8"
            emissiveIntensity={0.5}
            transparent={true}
            opacity={0.1}
          />
        </Sphere>
      </group>

      <points ref={particlesRef}>
        <bufferGeometry />
        <pointsMaterial
          size={0.05}
          color="#93C5FD"
          sizeAttenuation={true}
          transparent={true}
          opacity={0.6}
        />
      </points>

      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#60A5FA" />
      <pointLight position={[-10, -10, 10]} intensity={0.8} color="#38BDF8" />
    </>
  );
}

export default function HeroSphere() {
  return (
    <div className="relative w-full h-96 sm:h-[500px] md:h-[600px] rounded-2xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 50 }}>
        <HealthcareSphere />
        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
          enableRotate={false}
        />
      </Canvas>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
