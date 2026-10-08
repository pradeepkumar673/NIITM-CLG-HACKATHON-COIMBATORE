import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface SkeletonViewerProps {
  anatomyData?: any;
}

function SkeletonModel({ anatomyData }: { anatomyData?: any }) {
  const { nodes } = useGLTF('/models/skeleton.glb') as any;
  const group = useRef<THREE.Group>(null);

  // Use useMemo to prevent recreating the highlight map on every render
  const highlights = useMemo(() => {
    const map = new Map<string, { severity: number; type: string }>();
    if (anatomyData && anatomyData.highlights) {
      anatomyData.highlights.forEach((h: any) => {
        // If it's an organ zone like lung_right_lower, we highlight ribs_sternum as a fallback
        const meshName = h.type === 'organ_zone' ? 'ribs_sternum' : h.region_id;
        if (!map.has(meshName) || map.get(meshName)!.severity < h.severity) {
          map.set(meshName, { severity: h.severity, type: h.type });
        }
      });
    }
    return map;
  }, [anatomyData]);

  const defaultMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#d1daeb',
    roughness: 0.6,
    metalness: 0.1
  }), []);

  const highlightMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ba1a1a', // Error / Highlight color from design system
    roughness: 0.3,
    metalness: 0.1,
    emissive: '#93000a',
    emissiveIntensity: 0.5
  }), []);

  const getMaterial = (nodeName: string) => {
    if (highlights.has(nodeName)) {
      return highlightMaterial;
    }
    return defaultMaterial;
  };

  // Slowly rotate the skeleton if not interacted with
  useFrame(() => {
    if (group.current) {
      // Very slow idle rotation
      group.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={group} dispose={null}>
      {Object.values(nodes).map((node: any) => {
        if (node.isMesh) {
          return (
            <mesh
              key={node.uuid}
              geometry={node.geometry}
              material={getMaterial(node.name)}
              position={node.position}
              rotation={node.rotation}
              scale={node.scale}
            />
          );
        }
        return null;
      })}
    </group>
  );
}

export function SkeletonViewer({ anatomyData }: SkeletonViewerProps) {
  return (
    <div className="w-full h-full relative bg-surface-dim rounded-xl overflow-hidden shadow-inner">
      <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        
        <SkeletonModel anatomyData={anatomyData} />
        <OrbitControls 
          enablePan={false} 
          minDistance={1} 
          maxDistance={8} 
          target={[0, 1, 0]}
        />
      </Canvas>
      
      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="px-3 py-1.5 rounded-lg bg-surface/80 backdrop-blur shadow-sm">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">3D Anatomical Map</span>
        </div>
        {anatomyData?.region_uncertain && (
          <div className="px-3 py-1.5 rounded-lg bg-error-container/90 backdrop-blur shadow-sm border border-error/20">
            <span className="font-label-sm text-label-sm text-on-error-container font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              Region Uncertain
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

useGLTF.preload('/models/skeleton.glb');
