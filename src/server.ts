import express from 'express';
import { getConfig } from './config/index.js';
import { getPool } from './infrastructure/database/pool.js';
import { PostgresImageRepository } from './infrastructure/repositories/PostgresImageRepository.js';
import { PostgresPostRepository } from './infrastructure/repositories/PostgresPostRepository.js';
import { PostgresJobRepository } from './infrastructure/repositories/PostgresJobRepository.js';
import { PostgresSuggestionRepository } from './infrastructure/repositories/PostgresSuggestionRepository.js';
import { getVisionProvider, getEmbeddingProvider } from './infrastructure/ai/ProviderFactory.js';
import { MismatchGuard } from './domain/guards/MismatchGuard.js';
import { BudgetGuard } from './domain/guards/BudgetGuard.js';
import { MatchImages } from './application/use-cases/MatchImages.js';
import { BatchProcessor } from './infrastructure/jobs/BatchProcessor.js';
import { ImageController } from './api/controllers/ImageController.js';
import { BatchController } from './api/controllers/BatchController.js';
import { createImageRoutes } from './api/routes/imageRoutes.js';
import { createBatchRoutes } from './api/routes/batchRoutes.js';
import { errorHandler, notFoundHandler } from './api/middleware/errorHandler.js';

async function main() {
  const config = getConfig();
  const pool = getPool();

  const imageRepo = new PostgresImageRepository(pool);
  const postRepo = new PostgresPostRepository(pool);
  const jobRepo = new PostgresJobRepository(pool);
  const suggestionRepo = new PostgresSuggestionRepository(pool);

  const visionProvider = getVisionProvider();
  const embeddingProvider = getEmbeddingProvider();

  const guard = new MismatchGuard();
  const budgetGuard = new BudgetGuard(jobRepo);

  const matchImages = new MatchImages(
    postRepo,
    imageRepo,
    suggestionRepo,
    embeddingProvider,
    guard
  );

  const batchProcessor = new BatchProcessor(
    imageRepo,
    postRepo,
    jobRepo,
    visionProvider,
    embeddingProvider
  );

  const imageController = new ImageController(matchImages, suggestionRepo);
  const batchController = new BatchController(batchProcessor, budgetGuard, jobRepo);

  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', createImageRoutes(imageController));
  app.use('/api', createBatchRoutes(batchController));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'relevix', timestamp: new Date().toISOString() });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(config.PORT, () => {
    console.log(`Relevix server running on port ${config.PORT}`);
    console.log(`Environment: ${config.NODE_ENV}`);
    console.log(`Vision provider: ${visionProvider.getProviderName()}`);
    console.log(`Embedding provider: ${embeddingProvider.getProviderName()}`);
  });

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await pool.end();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
