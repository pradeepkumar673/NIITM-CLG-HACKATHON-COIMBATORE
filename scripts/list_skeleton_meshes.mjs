import fs from 'fs';
import path from 'path';

// Parse a GLB file structure to find all mesh names
function parseGLB(buffer) {
  const magic = buffer.readUInt32LE(0);
  if (magic !== 0x46546C67) {
    throw new Error('Not a GLB file');
  }

  const version = buffer.readUInt32LE(4);
  const length = buffer.readUInt32LE(8);
  
  let chunkOffset = 12;
  
  // Read chunks
  while (chunkOffset < length) {
    const chunkLength = buffer.readUInt32LE(chunkOffset);
    const chunkType = buffer.readUInt32LE(chunkOffset + 4);
    
    if (chunkType === 0x4E4F534A) { // 'JSON'
      const jsonContent = buffer.subarray(chunkOffset + 8, chunkOffset + 8 + chunkLength).toString('utf-8');
      const gltf = JSON.parse(jsonContent);
      
      const meshes = [];
      
      if (gltf.meshes) {
        gltf.meshes.forEach(mesh => {
          if (mesh.name) {
            meshes.push(mesh.name);
          }
        });
      }
      
      return meshes;
    }
    
    chunkOffset += 8 + chunkLength;
  }
  
  return [];
}

const glbPath = 'frontend/public/models/skeleton.glb';
if (!fs.existsSync(glbPath)) {
  console.error(`File not found: ${glbPath}`);
  process.exit(1);
}

const buffer = fs.readFileSync(glbPath);
try {
  const meshes = parseGLB(buffer);
  fs.writeFileSync('config/skeleton_meshes.json', JSON.stringify({ meshes }, null, 2));
  console.log(`Found ${meshes.length} meshes. Written to config/skeleton_meshes.json`);
} catch (e) {
  console.error('Failed to parse GLB:', e);
  process.exit(1);
}
