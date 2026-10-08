import { SKELETON_MESH_MAP } from '../config/skeleton_mesh_map';

export interface Target {
  region_id: string;
  type: 'bone_region' | 'organ_zone';
  probability?: number;
  finding_id?: string;
}

export interface MaterialState {
  color: string;
  emissive: string;
  emissiveIntensity: number;
  transparent: boolean;
  opacity: number;
}

const DEFAULT_COLOR = '#d1daeb';
const HIGHLIGHT_COLOR = '#ba1a1a';

export function computeMeshStates(
  targets: Target[],
  status: 'ok' | 'region_uncertain' | 'not_applicable' = 'ok',
  activeFinding: string | null = null,
  allMeshNames: string[]
): Record<string, MaterialState> {
  const states: Record<string, MaterialState> = {};
  
  // Initialize all to default
  allMeshNames.forEach(name => {
    states[name] = {
      color: DEFAULT_COLOR,
      emissive: '#000000',
      emissiveIntensity: 0,
      transparent: false,
      opacity: 1
    };
  });

  if (status === 'region_uncertain' || status === 'not_applicable') {
    return states;
  }

  targets.forEach(target => {
    if (activeFinding && target.finding_id !== activeFinding) return;

    const meshNames = SKELETON_MESH_MAP[target.region_id] || [];
    meshNames.forEach(meshName => {
      if (!states[meshName]) return; // Only process known meshes

      const intensity = target.probability ? Math.max(0.2, target.probability) : 0.5;

      if (target.type === 'organ_zone') {
        states[meshName] = {
          color: HIGHLIGHT_COLOR,
          emissive: HIGHLIGHT_COLOR,
          emissiveIntensity: intensity * 0.3,
          transparent: true,
          opacity: intensity * 0.5
        };
      } else {
        states[meshName] = {
          color: HIGHLIGHT_COLOR,
          emissive: HIGHLIGHT_COLOR,
          emissiveIntensity: intensity * 0.8,
          transparent: false,
          opacity: 1
        };
      }
    });
  });

  return states;
}
