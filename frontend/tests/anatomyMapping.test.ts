import { describe, it, expect } from 'vitest';
import { computeMeshStates, Target } from '../src/utils/anatomyMapping';
import { SKELETON_MESH_MAP } from '../src/config/skeleton_mesh_map';

describe('anatomyMapping', () => {
  const allMeshNames = Object.values(SKELETON_MESH_MAP).flat();

  it('sets all meshes to default when status is ok and no targets', () => {
    const states = computeMeshStates([], 'ok', null, allMeshNames);
    expect(states['hand_wrist'].color).toBe('#d1daeb');
    expect(states['hand_wrist'].emissiveIntensity).toBe(0);
  });

  it('ignores targets if status is region_uncertain', () => {
    const targets: Target[] = [{ region_id: 'leg_lower', type: 'bone_region', probability: 0.9 }];
    const states = computeMeshStates(targets, 'region_uncertain', null, allMeshNames);
    expect(states['leg_lower'].color).toBe('#d1daeb');
    expect(states['leg_lower'].emissiveIntensity).toBe(0);
  });

  it('highlights bone regions with red color', () => {
    const targets: Target[] = [{ region_id: 'forearm', type: 'bone_region', probability: 0.8 }];
    const states = computeMeshStates(targets, 'ok', null, allMeshNames);
    expect(states['forearm'].color).toBe('#ba1a1a');
    expect(states['forearm'].transparent).toBe(false);
    expect(states['forearm'].emissiveIntensity).toBe(0.8 * 0.8);
  });

  it('highlights organ zones with translucent red', () => {
    const targets: Target[] = [{ region_id: 'lung_right_lower', type: 'organ_zone', probability: 0.9 }];
    const states = computeMeshStates(targets, 'ok', null, allMeshNames);
    expect(states['ribs_sternum'].color).toBe('#ba1a1a');
    expect(states['ribs_sternum'].transparent).toBe(true);
    expect(states['ribs_sternum'].opacity).toBe(0.9 * 0.5);
  });

  it('filters by active finding', () => {
    const targets: Target[] = [
      { region_id: 'forearm', type: 'bone_region', finding_id: 'f1', probability: 0.8 },
      { region_id: 'leg_lower', type: 'bone_region', finding_id: 'f2', probability: 0.9 }
    ];
    const states = computeMeshStates(targets, 'ok', 'f2', allMeshNames);
    expect(states['leg_lower'].color).toBe('#ba1a1a');
    expect(states['forearm'].color).toBe('#d1daeb'); // not highlighted
  });
});
