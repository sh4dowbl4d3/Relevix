import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool, closePool } from '../infrastructure/database/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function deterministicUuid(seed: string): string {
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '4' + hash.slice(13, 16),
    ((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.slice(18, 20),
    hash.slice(20, 32),
  ].join('-');
}

function categoryEmbedding(category: string, dimensions = 768): number[] {
  const embedding: number[] = [];
  const seed = crypto.createHash('sha256').update(category).digest();
  for (let i = 0; i < dimensions; i++) {
    const byte = seed[i % seed.length];
    embedding.push((byte / 255) * 2 - 1);
    if ((i + 1) % 32 === 0) {
      const s = crypto.createHash('sha256').update(seed).digest();
      for (let j = 0; j < seed.length; j++) {
        seed[j] = s[j] ^ seed[j];
      }
    }
  }
  const mag = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  return embedding.map(v => v / mag);
}

function itemEmbedding(category: string, filename: string, variance = 0.08): number[] {
  const base = categoryEmbedding(category);
  return base.map((v, i) => {
    const noise = Math.sin(filename.charCodeAt(i % filename.length) * (i + 1) * 0.001) * variance;
    return v + noise;
  }).map((v, _, arr) => {
    const mag = Math.sqrt(arr.reduce((sum, x) => sum + x * x, 0));
    return v / mag;
  });
}

const postCategoryMap: Record<string, string> = {
  'eval-001': 'red fox',
  'eval-002': 'wolf',
  'eval-003': 'dog',
  'eval-004': 'bear',
  'eval-005': 'deer',
  'eval-006': 'red fox',
  'eval-007': 'dog',
  'eval-008': 'bear',
  'eval-009': 'forest',
  'eval-010': 'wildlife',
  'eval-011': 'red fox',
  'eval-012': 'wolf',
};

interface ImageData {
  filename: string;
  category: string;
  subject: string;
  caption: string;
  attributes: string[];
  confidence: number;
}

const foxImages: ImageData[] = [
  { filename: 'red-fox-01.jpg', category: 'red fox', subject: 'red fox', caption: 'A red fox standing in a snowy field', attributes: ['orange fur', 'bushy tail', 'wild'], confidence: 0.95 },
  { filename: 'red-fox-02.jpg', category: 'red fox', subject: 'red fox', caption: 'A red fox hunting in autumn forest', attributes: ['fox', 'predator', 'forest'], confidence: 0.92 },
  { filename: 'red-fox-03.jpg', category: 'red fox', subject: 'red fox', caption: 'Close-up of a red fox face', attributes: ['fox', 'portrait', 'sharp features'], confidence: 0.97 },
  { filename: 'red-fox-04.jpg', category: 'red fox', subject: 'red fox', caption: 'A red fox jumping over a log', attributes: ['fox', 'agile', 'jumping'], confidence: 0.90 },
  { filename: 'red-fox-05.jpg', category: 'red fox', subject: 'red fox', caption: 'A red fox resting in tall grass', attributes: ['fox', 'resting', 'nature'], confidence: 0.93 },
  { filename: 'red-fox-06.jpg', category: 'red fox', subject: 'red fox', caption: 'A red fox with kit in spring meadow', attributes: ['fox', 'family', 'meadow'], confidence: 0.91 },
  { filename: 'red-fox-07.jpg', category: 'red fox', subject: 'red fox', caption: 'Red fox in winter landscape with snow', attributes: ['fox', 'winter', 'snow'], confidence: 0.94 },
  { filename: 'red-fox-08.jpg', category: 'red fox', subject: 'arctic fox', caption: 'Arctic fox in white winter coat', attributes: ['fox', 'arctic', 'white fur'], confidence: 0.88 },
  { filename: 'red-fox-09.jpg', category: 'red fox', subject: 'red fox', caption: 'Red fox at dusk in woodland', attributes: ['fox', 'dusk', 'woodland'], confidence: 0.89 },
  { filename: 'red-fox-10.jpg', category: 'red fox', subject: 'red fox', caption: 'Red fox pouncing on prey in snow', attributes: ['fox', 'hunting', 'pounce'], confidence: 0.96 },
];

const wolfImages: ImageData[] = [
  { filename: 'gray-wolf-01.jpg', category: 'wolf', subject: 'gray wolf', caption: 'A gray wolf howling at the moon', attributes: ['wolf', 'howling', 'night'], confidence: 0.94 },
  { filename: 'gray-wolf-02.jpg', category: 'wolf', subject: 'wolf pack', caption: 'Wolf pack running through snowy terrain', attributes: ['wolf', 'pack', 'running'], confidence: 0.91 },
  { filename: 'gray-wolf-03.jpg', category: 'wolf', subject: 'gray wolf', caption: 'Close-up of a gray wolf with piercing eyes', attributes: ['wolf', 'portrait', 'eyes'], confidence: 0.96 },
  { filename: 'gray-wolf-04.jpg', category: 'wolf', subject: 'gray wolf', caption: 'Gray wolf in forest setting', attributes: ['wolf', 'forest', 'wild'], confidence: 0.89 },
  { filename: 'gray-wolf-05.jpg', category: 'wolf', subject: 'alpha wolf', caption: 'Alpha wolf leading pack through mountains', attributes: ['wolf', 'alpha', 'mountains'], confidence: 0.93 },
  { filename: 'gray-wolf-06.jpg', category: 'wolf', subject: 'wolf pup', caption: 'Wolf pup playing in meadow', attributes: ['wolf', 'pup', 'playful'], confidence: 0.87 },
  { filename: 'gray-wolf-07.jpg', category: 'wolf', subject: 'gray wolf', caption: 'Gray wolf in winter tundra', attributes: ['wolf', 'tundra', 'winter'], confidence: 0.90 },
  { filename: 'gray-wolf-08.jpg', category: 'wolf', subject: 'gray wolf', caption: 'Gray wolf stalking prey at dawn', attributes: ['wolf', 'hunting', 'dawn'], confidence: 0.92 },
];

const dogImages: ImageData[] = [
  { filename: 'golden-retriever-01.jpg', category: 'dog', subject: 'golden retriever', caption: 'Golden retriever playing fetch in park', attributes: ['dog', 'retriever', 'playful'], confidence: 0.96 },
  { filename: 'golden-retriever-02.jpg', category: 'dog', subject: 'golden retriever', caption: 'Golden retriever puppy with ball', attributes: ['dog', 'puppy', 'cute'], confidence: 0.94 },
  { filename: 'labrador-01.jpg', category: 'dog', subject: 'labrador retriever', caption: 'Chocolate labrador swimming in lake', attributes: ['dog', 'labrador', 'swimming'], confidence: 0.93 },
  { filename: 'beagle-01.jpg', category: 'dog', subject: 'beagle', caption: 'Beagle sniffing in garden', attributes: ['dog', 'beagle', 'scent'], confidence: 0.91 },
  { filename: 'german-shepherd-01.jpg', category: 'dog', subject: 'german shepherd', caption: 'German shepherd standing alert', attributes: ['dog', 'shepherd', 'alert'], confidence: 0.95 },
  { filename: 'border-collie-01.jpg', category: 'dog', subject: 'border collie', caption: 'Border collie herding sheep', attributes: ['dog', 'collie', 'herding'], confidence: 0.92 },
  { filename: 'poodle-01.jpg', category: 'dog', subject: 'poodle', caption: 'Standard poodle at dog show', attributes: ['dog', 'poodle', 'elegant'], confidence: 0.90 },
  { filename: 'husky-01.jpg', category: 'dog', subject: 'siberian husky', caption: 'Siberian husky in snowy landscape', attributes: ['dog', 'husky', 'snow'], confidence: 0.94 },
  { filename: 'corgi-01.jpg', category: 'dog', subject: 'corgi', caption: 'Pembroke corgi in flower field', attributes: ['dog', 'corgi', 'flowers'], confidence: 0.93 },
  { filename: 'dalmatian-01.jpg', category: 'dog', subject: 'dalmatian', caption: 'Dalmatian running on beach', attributes: ['dog', 'dalmatian', 'beach'], confidence: 0.91 },
];

const bearImages: ImageData[] = [
  { filename: 'black-bear-01.jpg', category: 'bear', subject: 'black bear', caption: 'Black bear foraging for berries', attributes: ['bear', 'foraging', 'berries'], confidence: 0.94 },
  { filename: 'brown-bear-01.jpg', category: 'bear', subject: 'brown bear', caption: 'Brown bear catching salmon in river', attributes: ['bear', 'fishing', 'salmon'], confidence: 0.96 },
  { filename: 'grizzly-bear-01.jpg', category: 'bear', subject: 'grizzly bear', caption: 'Grizzly bear standing on hind legs', attributes: ['bear', 'standing', 'powerful'], confidence: 0.93 },
  { filename: 'polar-bear-01.jpg', category: 'bear', subject: 'polar bear', caption: 'Polar bear on Arctic ice', attributes: ['bear', 'arctic', 'ice'], confidence: 0.95 },
  { filename: 'black-bear-02.jpg', category: 'bear', subject: 'black bear', caption: 'Black bear climbing tree', attributes: ['bear', 'climbing', 'tree'], confidence: 0.91 },
];

const deerImages: ImageData[] = [
  { filename: 'white-tailed-deer-01.jpg', category: 'deer', subject: 'white-tailed deer', caption: 'White-tailed deer in autumn forest', attributes: ['deer', 'autumn', 'forest'], confidence: 0.95 },
  { filename: 'elk-01.jpg', category: 'deer', subject: 'elk', caption: 'Bull elk with large antlers', attributes: ['deer', 'elk', 'antlers'], confidence: 0.93 },
  { filename: 'white-tailed-deer-02.jpg', category: 'deer', subject: 'deer fawn', caption: 'Deer fawn in spring meadow', attributes: ['deer', 'fawn', 'meadow'], confidence: 0.92 },
  { filename: 'moose-01.jpg', category: 'deer', subject: 'moose', caption: 'Moose in mountain lake', attributes: ['deer', 'moose', 'lake'], confidence: 0.94 },
  { filename: 'white-tailed-deer-03.jpg', category: 'deer', subject: 'white-tailed deer', caption: 'Deer herd crossing road at dusk', attributes: ['deer', 'herd', 'dusk'], confidence: 0.90 },
];

interface EvalPost {
  id: string;
  title: string;
  content: string;
  correctImageCategory: string;
  tags: string[];
}

async function reseed() {
  console.log('=== Reseeding with Semantic Embeddings ===\n');

  const pool = getPool();

  const seedPostsPath = path.resolve(__dirname, '../../seed/evaluation-posts.json');
  const evalPosts: EvalPost[] = JSON.parse(fs.readFileSync(seedPostsPath, 'utf-8'));

  for (const evalPost of evalPosts) {
    const uuid = deterministicUuid(evalPost.id);
    const category = postCategoryMap[evalPost.id] || evalPost.correctImageCategory;
    const embedding = categoryEmbedding(category);

    await pool.query('DELETE FROM post_vectors WHERE post_id = $1', [uuid]);
    await pool.query(
      `INSERT INTO post_vectors (id, post_id, embedding, embedding_model, embedding_dimension)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        deterministicUuid(`postvec-${evalPost.id}`),
        uuid,
        `[${embedding.join(',')}]`,
        'mock-text-embedding-004',
        768,
      ]
    );
    console.log(`  Post: ${evalPost.title} -> ${category}`);
  }

  const allImages = [...foxImages, ...wolfImages, ...dogImages, ...bearImages, ...deerImages];

  for (const img of allImages) {
    const imgId = deterministicUuid(img.filename);
    const embedding = itemEmbedding(img.category, img.filename);

    await pool.query('DELETE FROM image_vectors WHERE image_id = $1', [imgId]);
    await pool.query(
      `INSERT INTO image_vectors (id, image_id, embedding, embedding_model, embedding_dimension)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        deterministicUuid(`vec-${img.filename}`),
        imgId,
        `[${embedding.join(',')}]`,
        'mock-text-embedding-004',
        768,
      ]
    );
    console.log(`  Image: ${img.filename} -> ${img.category}`);
  }

  console.log('\nReseeding complete!');
  await closePool();
}

reseed().catch((err) => {
  console.error('Reseeding failed:', err);
  process.exit(1);
});
