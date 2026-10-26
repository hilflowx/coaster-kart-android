// Optional build step: shrinks textures inside dist/assets/models/*.glb to max 1024px
// and removes duplicate/unused data. Never fails the build: on any error the original stays.
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('dist/assets/models');
if (!fs.existsSync(dir)) {
  console.log('No models dir, skipping');
  process.exit(0);
}

let NodeIO, ALL_EXTENSIONS, dedup, prune, textureCompress, sharp;
try {
  ({ NodeIO } = await import('@gltf-transform/core'));
  ({ ALL_EXTENSIONS } = await import('@gltf-transform/extensions'));
  ({ dedup, prune, textureCompress } = await import('@gltf-transform/functions'));
  sharp = (await import('sharp')).default;
} catch (err) {
  console.log('Optimizer packages missing, skipping:', err.message);
  process.exit(0);
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.glb'))) {
  const full = path.join(dir, file);
  const before = fs.statSync(full).size;
  try {
    const doc = await io.read(full);
    await doc.transform(dedup(), prune(), textureCompress({ encoder: sharp, resize: [1024, 1024] }));
    const out = await io.writeBinary(doc);
    if (out.byteLength < before) {
      fs.writeFileSync(full, out);
      console.log(`${file}: ${(before / 1e6).toFixed(1)} MB -> ${(out.byteLength / 1e6).toFixed(1)} MB`);
    } else {
      console.log(`${file}: no gain, kept original`);
    }
  } catch (err) {
    console.log(`${file}: failed (${err.message}), kept original`);
  }
}
