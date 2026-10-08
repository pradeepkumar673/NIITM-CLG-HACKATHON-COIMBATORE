import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Bounds } from '@react-three/drei';
import * as THREE from 'three';
import { SKELETON_MESH_MAP } from '../config/skeleton_mesh_map';
import { Target, computeMeshStates } from '../utils/anatomyMapping';

interface SkeletonViewerProps {
  anatomyData?: {
    status?: 'ok' | 'region_uncertain' | 'not_applicable';
    targets?: Target[];
    findings?: { id: string; name: string }[];
  };
  onBoneClick?: (regionId: string, findingId?: string) => void;
}

const DEFAULT_COLOR = new THREE.Color('#d1daeb'); // surface-variant roughly
const HIGHLIGHT_COLOR = new THREE.Color('#ba1a1a'); // error

function SkeletonModel({ 
  anatomyData, 
  onBoneClick, 
  activeFinding,
  setHoveredRegion
}: { 
  anatomyData?: SkeletonViewerProps['anatomyData'];
  onBoneClick?: SkeletonViewerProps['onBoneClick'];
  activeFinding: string | null;
  setHoveredRegion: (r: string | null) => void;
}) {
  const { nodes } = useGLTF('/models/skeleton.glb', '/draco/', true) as any;
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();

  // Create base materials that we will clone per-mesh so we can mutate safely and dispose later
  const baseMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: DEFAULT_COLOR,
    roughness: 0.7,
    metalness: 0.1
  }), []);

  const transparentMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: HIGHLIGHT_COLOR,
    roughness: 0.3,
    metalness: 0.1,
    transparent: true,
    opacity: 0.3,
    emissive: HIGHLIGHT_COLOR,
    emissiveIntensity: 0.2
  }), []);

  // Clone materials per node
  const materials = useMemo(() => {
    const mats: Record<string, THREE.MeshStandardMaterial> = {};
    Object.values(nodes).forEach((node: any) => {
      if (node.isMesh) {
        mats[node.name] = baseMaterial.clone();
      }
    });
    return mats;
  }, [nodes, baseMaterial]);

  // Clean up materials on unmount
  useEffect(() => {
    return () => {
      Object.values(materials).forEach(m => m.dispose());
      baseMaterial.dispose();
      transparentMaterial.dispose();
    };
  }, [materials, baseMaterial, transparentMaterial]);

  const targets = anatomyData?.targets || [];
  const status = anatomyData?.status || 'ok';
  const showUncertain = status === 'region_uncertain' || status === 'not_applicable';

  const allMeshNames = useMemo(() => Object.values(nodes).filter((n: any) => n.isMesh).map((n: any) => n.name), [nodes]);

  // Compute mesh states
  useFrame(() => {
    if (!group.current) return;
    
    const states = computeMeshStates(targets, status, activeFinding, allMeshNames);

    // Apply states to materials
    allMeshNames.forEach(name => {
      const mat = materials[name];
      const state = states[name];
      if (mat && state) {
        mat.color.set(state.color);
        mat.emissive.set(state.emissive);
        mat.emissiveIntensity = state.emissiveIntensity;
        mat.transparent = state.transparent;
        mat.opacity = state.opacity;
      }
    });
    
    // Note: To test the Playwright assertions, we can expose the states to the window
    if (typeof window !== 'undefined') {
      (window as any).__skeletonDebugStates = states;
    }
  });

  const handlePointerOver = (e: any, nodeName: string) => {
    e.stopPropagation();
    // Find which region this maps to (reverse map)
    const entry = Object.entries(SKELETON_MESH_MAP).find(([_, meshes]) => meshes.includes(nodeName));
    if (entry) {
      setHoveredRegion(entry[0]);
    }
  };

  const handlePointerOut = () => {
    setHoveredRegion(null);
  };

  const handleClick = (e: any, nodeName: string) => {
    e.stopPropagation();
    const entry = Object.entries(SKELETON_MESH_MAP).find(([_, meshes]) => meshes.includes(nodeName));
    if (entry && onBoneClick) {
      const regionId = entry[0];
      const target = targets.find(t => t.region_id === regionId);
      onBoneClick(regionId, target?.finding_id);
    }
  };

  return (
    <group ref={group} dispose={null}>
      {Object.values(nodes).map((node: any) => {
        if (node.isMesh) {
          return (
            <mesh
              key={node.uuid}
              geometry={node.geometry}
              material={materials[node.name]}
              position={node.position}
              rotation={node.rotation}
              scale={node.scale}
              onPointerOver={(e) => handlePointerOver(e, node.name)}
              onPointerOut={handlePointerOut}
              onClick={(e) => handleClick(e, node.name)}
            />
          );
        }
        return null;
      })}
    </group>
  );
}

function WebGLFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-surface-dim text-on-surface-variant p-4 text-center">
      <div>
        <span className="material-symbols-outlined text-4xl mb-2">3d_rotation</span>
        <p className="font-body-md font-semibold">3D Viewer Unavailable</p>
        <p className="font-body-sm">Your browser or device does not support WebGL, which is required for the 3D anatomical map.</p>
      </div>
    </div>
  );
}

export function SkeletonViewer({ anatomyData, onBoneClick }: SkeletonViewerProps) {
  const [activeFinding, setActiveFinding] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebglSupported(false);
    } catch (e) {
      setWebglSupported(false);
    }
  }, []);

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  if (!webglSupported) {
    return <WebGLFallback />;
  }

  const showUncertain = anatomyData?.status === 'region_uncertain' || anatomyData?.status === 'not_applicable';

  return (
    <div className="w-full h-full relative bg-surface-dim rounded-xl overflow-hidden shadow-inner flex" role="region" aria-label="Interactive 3D Anatomical Map">
      
      {/* 3D Canvas */}
      <div className="flex-1 h-full cursor-grab active:cursor-grabbing">
        <Canvas 
          camera={{ position: [0, 1.5, 4], fov: 50 }} 
          dpr={[1, 2]} // cap pixel ratio to 2 for performance
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <directionalLight position={[-5, 5, -5]} intensity={0.5} />
          
          <Bounds fit clip observe margin={1.2}>
            <SkeletonModel 
              anatomyData={anatomyData} 
              onBoneClick={onBoneClick}
              activeFinding={activeFinding}
              setHoveredRegion={setHoveredRegion}
            />
          </Bounds>
          
          <OrbitControls 
            ref={controlsRef}
            enablePan={true} 
            panSpeed={0.5}
            minDistance={1} 
            maxDistance={6}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 1.5} // Prevent going fully under
            makeDefault
          />
        </Canvas>
      </div>

      {/* Side Legend & Controls */}
      <div className="w-48 bg-surface/90 backdrop-blur border-l border-outline-variant p-4 flex flex-col gap-4 z-10 overflow-y-auto">
        <div>
          <h3 className="font-label-md font-bold text-on-surface uppercase tracking-wider mb-1">3D Anatomy</h3>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase">
            Draft Mapping
          </div>
        </div>

        {/* Reset View */}
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface text-on-surface border border-outline hover:bg-surface-variant transition-colors text-sm font-semibold focus:ring-2 focus:ring-primary outline-none"
          aria-label="Reset 3D view"
        >
          <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
          Reset View
        </button>

        {/* Status indicator */}
        {showUncertain && (
          <div className="p-3 rounded-lg bg-error-container/50 border border-error/20">
            <span className="font-label-sm text-on-error-container font-semibold flex items-center gap-1 mb-1">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              Region Uncertain
            </span>
            <p className="text-xs text-on-error-container/80">Location not determined.</p>
          </div>
        )}

        {/* Hovered Region Display */}
        <div className="min-h-[40px]">
          {hoveredRegion && !showUncertain && (
            <div className="p-2 rounded bg-primary/10 border border-primary/20 text-primary text-xs font-bold capitalize">
              {hoveredRegion.replace(/_/g, ' ')}
            </div>
          )}
        </div>

        {/* Findings Toggle */}
        {anatomyData?.findings && anatomyData.findings.length > 0 && !showUncertain && (
          <div className="flex flex-col gap-2 mt-2">
            <h4 className="font-label-sm font-bold text-on-surface-variant uppercase">Filter by Finding</h4>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setActiveFinding(null)}
                className={`text-left px-3 py-2 rounded-md text-sm font-semibold transition-colors ${activeFinding === null ? 'bg-primary text-on-primary' : 'bg-surface text-on-surface hover:bg-surface-variant'}`}
              >
                All Findings
              </button>
              {anatomyData.findings.map(finding => (
                <button
                  key={finding.id}
                  onClick={() => setActiveFinding(finding.id)}
                  className={`text-left px-3 py-2 rounded-md text-sm font-semibold transition-colors ${activeFinding === finding.id ? 'bg-primary text-on-primary' : 'bg-surface text-on-surface hover:bg-surface-variant'}`}
                >
                  {finding.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Accessible visually hidden list of findings */}
      <div className="sr-only" aria-live="polite">
        {anatomyData?.targets?.map((t, i) => (
          <p key={i}>Highlighted region: {t.region_id}, Type: {t.type}, Probability: {Math.round((t.probability || 0) * 100)}%</p>
        ))}
      </div>
    </div>
  );
}

// Preload but explicitly disable CDN logic if missing
useGLTF.preload('/models/skeleton.glb', '/draco/');
