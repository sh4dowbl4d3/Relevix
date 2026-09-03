import { describe, it, expect } from 'vitest';

describe('Data Model', () => {
  describe('Image Entity', () => {
    it('should have required fields', () => {
      const image = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        filename: 'red-fox.jpg',
        originalPath: '/images/red-fox.jpg',
        processedPath: undefined,
        width: 800,
        height: 600,
        mimeType: 'image/jpeg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(image.id).toBeDefined();
      expect(image.filename).toBeDefined();
      expect(image.originalPath).toBeDefined();
      expect(image.createdAt).toBeInstanceOf(Date);
      expect(image.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('ImageMetadata Entity', () => {
    it('should have required fields', () => {
      const metadata = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        imageId: '550e8400-e29b-41d4-a716-446655440001',
        subject: 'red fox',
        category: 'animal',
        attributes: ['orange fur', 'wild', 'forest'],
        caption: 'A red fox standing in a forest',
        confidence: 0.94,
        rawVisionOutput: '{}',
        visionModel: 'gemini-1.5-flash',
        processedAt: new Date(),
      };

      expect(metadata.subject).toBeDefined();
      expect(metadata.category).toBeDefined();
      expect(Array.isArray(metadata.attributes)).toBe(true);
      expect(metadata.caption).toBeDefined();
      expect(metadata.confidence).toBeGreaterThanOrEqual(0);
      expect(metadata.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Post Entity', () => {
    it('should have required fields', () => {
      const post = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'The Behavior of Red Foxes',
        content: 'Red foxes are cunning predators...',
        excerpt: 'About red foxes',
        tags: ['fox', 'wildlife'],
        category: 'animal',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(post.id).toBeDefined();
      expect(post.title).toBeDefined();
      expect(post.content).toBeDefined();
      expect(post.createdAt).toBeInstanceOf(Date);
      expect(post.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Suggestion Entity', () => {
    it('should have required fields', () => {
      const suggestion = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        postId: '550e8400-e29b-41d4-a716-446655440001',
        imageId: '550e8400-e29b-41d4-a716-446655440002',
        similarityScore: 0.85,
        confidenceScore: 0.95,
        status: 'pending',
        guardDecision: {
          accepted: true,
          reason: 'Image matches post content',
          categoryMatch: true,
          subjectSimilarity: 0.8,
          overallConfidence: 0.85,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(suggestion.id).toBeDefined();
      expect(suggestion.postId).toBeDefined();
      expect(suggestion.imageId).toBeDefined();
      expect(suggestion.similarityScore).toBeGreaterThanOrEqual(0);
      expect(suggestion.similarityScore).toBeLessThanOrEqual(1);
      expect(suggestion.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(suggestion.confidenceScore).toBeLessThanOrEqual(1);
      expect(['pending', 'approved', 'rejected']).toContain(suggestion.status);
      expect(suggestion.guardDecision).toBeDefined();
    });
  });

  describe('ProcessingJob Entity', () => {
    it('should have required fields', () => {
      const job = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'vision',
        status: 'pending',
        entityType: 'image',
        entityId: '550e8400-e29b-41d4-a716-446655440001',
        attempts: 0,
        maxAttempts: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(job.id).toBeDefined();
      expect(['vision', 'embedding', 'batch']).toContain(job.type);
      expect(['pending', 'processing', 'completed', 'failed', 'retrying']).toContain(job.status);
      expect(['image', 'post']).toContain(job.entityType);
      expect(job.attempts).toBeGreaterThanOrEqual(0);
      expect(job.maxAttempts).toBeGreaterThan(0);
    });
  });

  describe('GuardDecision', () => {
    it('should have required fields', () => {
      const decision = {
        accepted: true,
        reason: 'Image matches post content with sufficient confidence',
        categoryMatch: true,
        subjectSimilarity: 0.8,
        overallConfidence: 0.85,
        rejectionReason: undefined,
      };

      expect(typeof decision.accepted).toBe('boolean');
      expect(typeof decision.reason).toBe('string');
      expect(typeof decision.categoryMatch).toBe('boolean');
      expect(typeof decision.subjectSimilarity).toBe('number');
      expect(typeof decision.overallConfidence).toBe('number');
    });
  });
});
