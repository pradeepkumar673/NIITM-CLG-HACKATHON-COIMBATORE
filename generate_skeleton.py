import trimesh
import numpy as np

def create_capsule(height, radius, name, transform):
    capsule = trimesh.creation.capsule(height=height, radius=radius)
    capsule.apply_transform(transform)
    return {name: capsule}

def get_transform(trans, scale):
    matrix = np.eye(4)
    matrix[:3, :3] *= scale
    matrix[:3, 3] = trans
    return matrix

meshes = {}

# 1. Spine (Thoracic)
meshes.update(create_capsule(0.6, 0.08, 'spine_thoracic', get_transform([0, 1.2, 0], 1.0)))

# 2. Ribs/Sternum
ribs = trimesh.creation.box(extents=[0.5, 0.5, 0.3])
ribs.apply_transform(get_transform([0, 1.3, 0], 1.0))
meshes['ribs_sternum'] = ribs

# 3. Clavicle / Shoulder
clavicle = trimesh.creation.box(extents=[0.7, 0.1, 0.1])
clavicle.apply_transform(get_transform([0, 1.6, 0], 1.0))
meshes['clavicle_shoulder'] = clavicle

# 4. Upper Arm (Humerus) - Left & Right (Merge them into one mesh for simplicity or keep one name)
arm_l = trimesh.creation.capsule(height=0.4, radius=0.06)
arm_l.apply_transform(get_transform([0.4, 1.2, 0], 1.0))
arm_r = trimesh.creation.capsule(height=0.4, radius=0.06)
arm_r.apply_transform(get_transform([-0.4, 1.2, 0], 1.0))
meshes['upper_arm'] = trimesh.util.concatenate([arm_l, arm_r])

# 5. Forearm (Radius / Ulna)
farm_l = trimesh.creation.capsule(height=0.35, radius=0.05)
farm_l.apply_transform(get_transform([0.4, 0.8, 0], 1.0))
farm_r = trimesh.creation.capsule(height=0.35, radius=0.05)
farm_r.apply_transform(get_transform([-0.4, 0.8, 0], 1.0))
meshes['forearm'] = trimesh.util.concatenate([farm_l, farm_r])

# 6. Hand / Wrist
hand_l = trimesh.creation.box(extents=[0.1, 0.2, 0.05])
hand_l.apply_transform(get_transform([0.4, 0.5, 0], 1.0))
hand_r = trimesh.creation.box(extents=[0.1, 0.2, 0.05])
hand_r.apply_transform(get_transform([-0.4, 0.5, 0], 1.0))
meshes['hand_wrist'] = trimesh.util.concatenate([hand_l, hand_r])

# 7. Pelvis / Hip
pelvis = trimesh.creation.box(extents=[0.5, 0.3, 0.2])
pelvis.apply_transform(get_transform([0, 0.8, 0], 1.0))
meshes['pelvis_hip'] = pelvis

# 8. Thigh (Femur)
thigh_l = trimesh.creation.capsule(height=0.5, radius=0.08)
thigh_l.apply_transform(get_transform([0.2, 0.4, 0], 1.0))
thigh_r = trimesh.creation.capsule(height=0.5, radius=0.08)
thigh_r.apply_transform(get_transform([-0.2, 0.4, 0], 1.0))
meshes['thigh'] = trimesh.util.concatenate([thigh_l, thigh_r])

# 9. Knee
knee_l = trimesh.creation.icosphere(radius=0.08)
knee_l.apply_transform(get_transform([0.2, 0.1, 0.05], 1.0))
knee_r = trimesh.creation.icosphere(radius=0.08)
knee_r.apply_transform(get_transform([-0.2, 0.1, 0.05], 1.0))
meshes['knee'] = trimesh.util.concatenate([knee_l, knee_r])

# 10. Lower Leg (Tibia / Fibula)
leg_l = trimesh.creation.capsule(height=0.45, radius=0.06)
leg_l.apply_transform(get_transform([0.2, -0.4, 0], 1.0))
leg_r = trimesh.creation.capsule(height=0.45, radius=0.06)
leg_r.apply_transform(get_transform([-0.2, -0.4, 0], 1.0))
meshes['leg_lower'] = trimesh.util.concatenate([leg_l, leg_r])

# 11. Foot / Ankle
foot_l = trimesh.creation.box(extents=[0.15, 0.1, 0.25])
foot_l.apply_transform(get_transform([0.2, -0.7, 0.1], 1.0))
foot_r = trimesh.creation.box(extents=[0.15, 0.1, 0.25])
foot_r.apply_transform(get_transform([-0.2, -0.7, 0.1], 1.0))
meshes['foot_ankle'] = trimesh.util.concatenate([foot_l, foot_r])

scene = trimesh.Scene(meshes)
scene.export('frontend/public/models/skeleton.glb')
print("Successfully generated frontend/public/models/skeleton.glb")
