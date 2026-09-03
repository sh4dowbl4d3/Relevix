import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { getPool, closePool } from '../infrastructure/database/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SeedPost {
  id: string;
  title: string;
  content: string;
  correctImageCategory: string;
  tags: string[];
}

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

async function seed() {
  console.log('=== Seeding Relevix Database ===\n');

  const pool = getPool();

  const seedPostsPath = path.resolve(__dirname, '../../seed/evaluation-posts.json');
  const seedPosts: SeedPost[] = JSON.parse(fs.readFileSync(seedPostsPath, 'utf-8'));

  console.log(`Seeding ${seedPosts.length} evaluation posts...`);

  for (const seedPost of seedPosts) {
    const uuid = deterministicUuid(seedPost.id);

    const existing = await pool.query('SELECT id FROM posts WHERE id = $1', [uuid]);
    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO posts (id, title, content, tags, category)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          uuid,
          seedPost.title,
          seedPost.content,
          JSON.stringify(seedPost.tags || []),
          seedPost.correctImageCategory,
        ]
      );
      console.log(`  Created post: ${seedPost.title} (${uuid})`);
    } else {
      console.log(`  Post already exists: ${seedPost.title}`);
    }
  }

  console.log('\nSeeding complete!');
  console.log('Note: Image files should be placed in the images/ directory');
  console.log('Run the batch processor to analyze images and generate embeddings');

  await closePool();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
