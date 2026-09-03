import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { getPool, closePool } from '../../src/infrastructure/database/pool.js';
import { PostgresImageRepository } from '../../src/infrastructure/repositories/PostgresImageRepository.js';
import { PostgresPostRepository } from '../../src/infrastructure/repositories/PostgresPostRepository.js';
import { PostgresJobRepository } from '../../src/infrastructure/repositories/PostgresJobRepository.js';
import { PostgresSuggestionRepository } from '../../src/infrastructure/repositories/PostgresSuggestionRepository.js';

describe.skip('Repository Integration Tests (requires PostgreSQL)', () => {
  let pool: any;
  let imageRepo: PostgresImageRepository;
  let postRepo: PostgresPostRepository;
  let jobRepo: PostgresJobRepository;
  let suggestionRepo: PostgresSuggestionRepository;

  beforeAll(async () => {
    pool = getPool();
    imageRepo = new PostgresImageRepository(pool);
    postRepo = new PostgresPostRepository(pool);
    jobRepo = new PostgresJobRepository(pool);
    suggestionRepo = new PostgresSuggestionRepository(pool);
  });

  afterAll(async () => {
    await closePool();
  });

  beforeEach(async () => {
    await pool.query('DELETE FROM suggestions');
    await pool.query('DELETE FROM ai_cost_records');
    await pool.query('DELETE FROM processing_jobs');
    await pool.query('DELETE FROM post_vectors');
    await pool.query('DELETE FROM image_vectors');
    await pool.query('DELETE FROM image_metadata');
    await pool.query('DELETE FROM posts');
    await pool.query('DELETE FROM images');
  });

  describe('Image Repository', () => {
    it('should create and retrieve an image', async () => {
      const image = await imageRepo.create({
        filename: 'test-fox.jpg',
        originalPath: '/images/test-fox.jpg',
        width: 800,
        height: 600,
        mimeType: 'image/jpeg',
      });

      expect(image.id).toBeDefined();
      expect(image.filename).toBe('test-fox.jpg');

      const retrieved = await imageRepo.findById(image.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.filename).toBe('test-fox.jpg');
    });

    it('should save and retrieve metadata', async () => {
      const image = await imageRepo.create({
        filename: 'test-fox.jpg',
        originalPath: '/images/test-fox.jpg',
      });

      const metadata = await imageRepo.saveMetadata({
        imageId: image.id,
        subject: 'red fox',
        category: 'animal',
        attributes: ['orange fur', 'wild'],
        caption: 'A red fox in the forest',
        confidence: 0.9,
        visionModel: 'gemini-1.5-flash',
        processedAt: new Date(),
      });

      expect(metadata.id).toBeDefined();
      expect(metadata.subject).toBe('red fox');

      const retrieved = await imageRepo.getMetadata(image.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.subject).toBe('red fox');
    });
  });

  describe('Post Repository', () => {
    it('should create and retrieve a post', async () => {
      const post = await postRepo.create({
        title: 'Test Post',
        content: 'Test content about red foxes',
        tags: ['fox', 'wildlife'],
        category: 'animal',
      });

      expect(post.id).toBeDefined();
      expect(post.title).toBe('Test Post');

      const retrieved = await postRepo.findById(post.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.title).toBe('Test Post');
    });
  });

  describe('Job Repository', () => {
    it('should create and track a job', async () => {
      const job = await jobRepo.create({
        type: 'vision',
        status: 'pending',
        entityType: 'image',
        entityId: 'test-image-id',
        attempts: 0,
        maxAttempts: 3,
      });

      expect(job.id).toBeDefined();
      expect(job.status).toBe('pending');

      const processing = await jobRepo.markProcessing(job.id);
      expect(processing!.status).toBe('processing');

      const completed = await jobRepo.markCompleted(job.id);
      expect(completed!.status).toBe('completed');
    });

    it('should track costs', async () => {
      const job = await jobRepo.create({
        type: 'vision',
        status: 'completed',
        entityType: 'image',
        entityId: 'test-image-id',
        attempts: 1,
        maxAttempts: 3,
      });

      await jobRepo.recordCost({
        jobId: job.id,
        operationType: 'vision',
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        entityType: 'image',
        entityId: 'test-image-id',
        estimatedCostUsd: 0.001,
        success: true,
      });

      const stats = await jobRepo.getDailyCostStats();
      expect(stats.visionCalls).toBeGreaterThan(0);
      expect(stats.totalCostUsd).toBeGreaterThan(0);
    });
  });

  describe('Suggestion Repository', () => {
    it('should create and approve a suggestion', async () => {
      const post = await postRepo.create({
        title: 'Test Post',
        content: 'Test content',
      });

      const image = await imageRepo.create({
        filename: 'test.jpg',
        originalPath: '/images/test.jpg',
      });

      const suggestion = await suggestionRepo.create({
        postId: post.id,
        imageId: image.id,
        similarityScore: 0.85,
        confidenceScore: 0.9,
        status: 'pending',
        guardDecision: {
          accepted: true,
          reason: 'Good match',
          categoryMatch: true,
          subjectSimilarity: 0.8,
          overallConfidence: 0.85,
        },
      });

      expect(suggestion.id).toBeDefined();

      const approved = await suggestionRepo.approve(suggestion.id, 'test-user');
      expect(approved.status).toBe('approved');
    });

    it('should reject a suggestion with reason', async () => {
      const post = await postRepo.create({
        title: 'Test Post',
        content: 'Test content',
      });

      const image = await imageRepo.create({
        filename: 'test.jpg',
        originalPath: '/images/test.jpg',
      });

      const suggestion = await suggestionRepo.create({
        postId: post.id,
        imageId: image.id,
        similarityScore: 0.5,
        confidenceScore: 0.6,
        status: 'pending',
        guardDecision: {
          accepted: false,
          reason: 'Category mismatch',
          categoryMatch: false,
          subjectSimilarity: 0.3,
          overallConfidence: 0.45,
        },
      });

      const rejected = await suggestionRepo.reject(suggestion.id, 'Wrong category', 'test-user');
      expect(rejected.status).toBe('rejected');
    });
  });
});
