import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool, closePool } from '../src/infrastructure/database/pool.js';
import { PostgresPostRepository } from '../src/infrastructure/repositories/PostgresPostRepository.js';
import { PostgresImageRepository } from '../src/infrastructure/repositories/PostgresImageRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SeedPost {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
}

interface SeedImage {
  filename: string;
  category: string;
  subject: string;
}

async function seed() {
  console.log('=== Seeding Relevix Database ===\n');

  const pool = getPool();
  const postRepo = new PostgresPostRepository(pool);
  const imageRepo = new PostgresImageRepository(pool);

  const seedPostsPath = path.resolve(__dirname, '../seed/evaluation-posts.json');
  const seedPosts: SeedPost[] = JSON.parse(fs.readFileSync(seedPostsPath, 'utf-8'));

  console.log(`Seeding ${seedPosts.length} evaluation posts...`);

  for (const seedPost of seedPosts) {
    const existing = await postRepo.findById(seedPost.id);
    if (!existing) {
      await postRepo.create({
        title: seedPost.title,
        content: seedPost.content,
        tags: seedPost.tags,
        category: seedPost.category,
      });
      console.log(`  Created post: ${seedPost.title}`);
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
