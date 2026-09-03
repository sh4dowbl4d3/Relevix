import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { getPool, closePool } from '../infrastructure/database/pool.js';
import { PostgresImageRepository } from '../infrastructure/repositories/PostgresImageRepository.js';
import { PostgresPostRepository } from '../infrastructure/repositories/PostgresPostRepository.js';
import { PostgresSuggestionRepository } from '../infrastructure/repositories/PostgresSuggestionRepository.js';
import { getEmbeddingProvider } from '../infrastructure/ai/ProviderFactory.js';
import { MismatchGuard } from '../domain/guards/MismatchGuard.js';
import { MatchImages } from '../application/use-cases/MatchImages.js';

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

interface EvaluationPost {
  id: string;
  title: string;
  content: string;
  correctImageCategory: string;
  tags: string[];
}

interface EvaluationResult {
  postId: string;
  postTitle: string;
  expectedCategory: string;
  topSuggestionCategory: string | null;
  topSimilarity: number;
  accepted: boolean;
  correct: boolean;
  explanation?: string;
}

async function runEvaluation() {
  console.log('=== Relevix Evaluation ===\n');

  const pool = getPool();
  const imageRepo = new PostgresImageRepository(pool);
  const postRepo = new PostgresPostRepository(pool);
  const suggestionRepo = new PostgresSuggestionRepository(pool);
  const embeddingProvider = getEmbeddingProvider();
  const guard = new MismatchGuard();

  const matchImages = new MatchImages(
    postRepo,
    imageRepo,
    suggestionRepo,
    embeddingProvider,
    guard
  );

  const evalPostsPath = path.resolve(__dirname, '../../seed/evaluation-posts.json');
  const evalPosts: EvaluationPost[] = JSON.parse(fs.readFileSync(evalPostsPath, 'utf-8'));

  console.log(`Evaluating ${evalPosts.length} posts...\n`);

  const results: EvaluationResult[] = [];

  for (const evalPost of evalPosts) {
    const uuid = deterministicUuid(evalPost.id);
    let post = await postRepo.findById(uuid);

    if (!post) {
      post = await postRepo.create({
        title: evalPost.title,
        content: evalPost.content,
        tags: evalPost.tags,
        category: evalPost.correctImageCategory,
      });
    }

    try {
      const matchResult = await matchImages.execute({
        postId: post.id,
        limit: 5,
      });

      let topSuggestionCategory: string | null = null;
      let topSimilarity = 0;
      let accepted = false;

      if (matchResult.suggestions.length > 0) {
        const topSuggestion = matchResult.suggestions[0];
        topSuggestionCategory = topSuggestion.category;
        topSimilarity = topSuggestion.similarity;
        accepted = topSuggestion.guardDecision.accepted;
      }

      const correct = topSuggestionCategory?.toLowerCase().includes(evalPost.correctImageCategory.toLowerCase()) || false;

      results.push({
        postId: evalPost.id,
        postTitle: evalPost.title,
        expectedCategory: evalPost.correctImageCategory,
        topSuggestionCategory,
        topSimilarity,
        accepted,
        correct,
        explanation: matchResult.explanation,
      });

      console.log(`Post: ${evalPost.title}`);
      console.log(`  Expected: ${evalPost.correctImageCategory}`);
      console.log(`  Got: ${topSuggestionCategory || 'none'} (similarity: ${topSimilarity.toFixed(3)})`);
      console.log(`  Correct: ${correct ? 'YES' : 'NO'}`);
      console.log('');
    } catch (error) {
      console.error(`Error evaluating post ${evalPost.id}:`, error);
      results.push({
        postId: evalPost.id,
        postTitle: evalPost.title,
        expectedCategory: evalPost.correctImageCategory,
        topSuggestionCategory: null,
        topSimilarity: 0,
        accepted: false,
        correct: false,
        explanation: error instanceof Error ? error.message : 'Evaluation failed',
      });
    }
  }

  const correctCount = results.filter(r => r.correct).length;
  const totalCount = results.length;
  const top1Precision = totalCount > 0 ? correctCount / totalCount : 0;

  console.log('=== Evaluation Results ===');
  console.log(`Total posts evaluated: ${totalCount}`);
  console.log(`Correct top-1 predictions: ${correctCount}`);
  console.log(`Top-1 Precision: ${(top1Precision * 100).toFixed(1)}%`);
  console.log('');

  const report = {
    timestamp: new Date().toISOString(),
    totalPosts: totalCount,
    correctPredictions: correctCount,
    top1Precision: top1Precision,
    results: results,
  };

  const reportPath = path.resolve(__dirname, '../../docs/evaluation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Evaluation report saved to: ${reportPath}`);

  await closePool();

  return report;
}

runEvaluation().catch((err) => {
  console.error('Evaluation failed:', err);
  process.exit(1);
});
