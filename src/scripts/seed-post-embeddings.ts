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

function categoryBaseEmbedding(category: string, dimensions = 768): number[] {
  const embedding: number[] = [];
  let s = crypto.createHash('sha256').update(category).digest();
  for (let i = 0; i < dimensions; i++) {
    const byte = s[i % s.length];
    embedding.push((byte / 255) * 2 - 1);
    if ((i + 1) % 32 === 0) {
      s = crypto.createHash('sha256').update(s).digest();
    }
  }
  const mag = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  return embedding.map(v => v / mag);
}

function varietyEmbedding(base: number[], seed: string, variance = 0.1): number[] {
  const shifted = base.map((v, i) => {
    const noise = Math.sin(seed.charCodeAt(i % seed.length) * (i + 1) * 0.01) * variance;
    return v + noise;
  });
  const mag = Math.sqrt(shifted.reduce((sum, v) => sum + v * v, 0));
  return shifted.map(v => v / mag);
}

const categoryBases: Record<string, number[]> = {};

function getBase(category: string): number[] {
  if (!categoryBases[category]) {
    categoryBases[category] = categoryBaseEmbedding(category);
  }
  return categoryBases[category];
}

interface EvalPost {
  id: string;
  title: string;
  content: string;
  correctImageCategory: string;
  tags: string[];
}

const categoryMapping: Record<string, string> = {
  'red fox': 'red fox',
  'wolf': 'wolf',
  'dog': 'dog',
  'bear': 'bear',
  'deer': 'deer',
  'arctic fox': 'red fox',
  'forest': 'forest',
  'wildlife': 'wildlife',
};

async function seedPostEmbeddings() {
  console.log('=== Seeding Post Embeddings (Semantic) ===\n');

  const pool = getPool();

  const seedPostsPath = path.resolve(__dirname, '../../seed/evaluation-posts.json');
  const evalPosts: EvalPost[] = JSON.parse(fs.readFileSync(seedPostsPath, 'utf-8'));

  for (const evalPost of evalPosts) {
    const uuid = deterministicUuid(evalPost.id);
    const existing = await pool.query('SELECT id FROM post_vectors WHERE post_id = $1', [uuid]);
    if (existing.rows.length === 0) {
      const postCategory = categoryMapping[evalPost.correctImageCategory] || evalPost.correctImageCategory;
      const base = getBase(postCategory);
      const embedding = varietyEmbedding(base, evalPost.id);

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
      console.log(`  Created embedding for: ${evalPost.title} (category: ${postCategory})`);
    } else {
      console.log(`  Embedding already exists for: ${evalPost.title}`);
    }
  }

  console.log('\nPost embedding seeding complete!');
  await closePool();
}

seedPostEmbeddings().catch((err) => {
  console.error('Post embedding seeding failed:', err);
  process.exit(1);
});
