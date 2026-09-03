import { describe, it, expect } from 'vitest';

describe('Project Structure', () => {
  it('should have required directories', () => {
    const fs = require('fs');
    const path = require('path');

    const requiredDirs = [
      'src',
      'src/config',
      'src/api',
      'src/api/routes',
      'src/api/controllers',
      'src/api/schemas',
      'src/api/middleware',
      'src/application',
      'src/application/use-cases',
      'src/domain',
      'src/domain/entities',
      'src/domain/services',
      'src/domain/guards',
      'src/infrastructure',
      'src/infrastructure/ai',
      'src/infrastructure/database',
      'src/infrastructure/repositories',
      'src/infrastructure/jobs',
      'src/evaluation',
      'migrations',
      'src/scripts',
      'seed',
      'tests',
      'tests/unit',
      'tests/integration',
      'docs',
    ];

    requiredDirs.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      expect(fs.existsSync(dirPath)).toBe(true);
    });
  });

  it('should have required configuration files', () => {
    const fs = require('fs');
    const path = require('path');

    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'vitest.config.ts',
      'docker-compose.yml',
      '.env.example',
      '.gitignore',
      'README.md',
      'DESIGN.md',
      'STRUCTURE.md',
      'EVIDENCE.md',
      'BUILDLOG.md',
      'capstone.yaml',
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  it('should have required source files', () => {
    const fs = require('fs');
    const path = require('path');

    const requiredSourceFiles = [
      'src/server.ts',
      'src/config/index.ts',
      'src/api/routes/imageRoutes.ts',
      'src/api/routes/batchRoutes.ts',
      'src/api/routes/adminRoutes.ts',
      'src/api/controllers/ImageController.ts',
      'src/api/controllers/BatchController.ts',
      'src/api/schemas/imageMetadata.ts',
      'src/api/schemas/request.ts',
      'src/api/schemas/response.ts',
      'src/api/middleware/errorHandler.ts',
      'src/api/middleware/validate.ts',
      'src/api/middleware/rateLimiter.ts',
      'src/api/middleware/requestLogger.ts',
      'src/application/use-cases/IngestImage.ts',
      'src/application/use-cases/GenerateEmbedding.ts',
      'src/application/use-cases/MatchImages.ts',
      'src/domain/entities/Image.ts',
      'src/domain/entities/Post.ts',
      'src/domain/entities/ProcessingJob.ts',
      'src/domain/entities/Suggestion.ts',
      'src/domain/guards/MismatchGuard.ts',
      'src/domain/guards/BudgetGuard.ts',
      'src/domain/repositories/ImageRepository.ts',
      'src/domain/repositories/PostRepository.ts',
      'src/domain/repositories/JobRepository.ts',
      'src/domain/repositories/SuggestionRepository.ts',
      'src/infrastructure/ai/VisionProvider.ts',
      'src/infrastructure/ai/EmbeddingProvider.ts',
      'src/infrastructure/ai/GeminiVisionProvider.ts',
      'src/infrastructure/ai/GeminiEmbeddingProvider.ts',
      'src/infrastructure/ai/OllamaVisionProvider.ts',
      'src/infrastructure/ai/OllamaEmbeddingProvider.ts',
      'src/infrastructure/ai/ProviderFactory.ts',
      'src/infrastructure/database/pool.ts',
      'src/infrastructure/database/migrate.ts',
      'src/infrastructure/repositories/PostgresImageRepository.ts',
      'src/infrastructure/repositories/PostgresPostRepository.ts',
      'src/infrastructure/repositories/PostgresJobRepository.ts',
      'src/infrastructure/repositories/PostgresSuggestionRepository.ts',
      'src/infrastructure/jobs/BatchProcessor.ts',
      'src/evaluation/evaluate.ts',
      'migrations/001_initial_schema.sql',
      'src/scripts/seed.ts',
      'seed/evaluation-posts.json',
    ];

    requiredSourceFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
});
