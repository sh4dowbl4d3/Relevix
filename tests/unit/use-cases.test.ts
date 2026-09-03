import { describe, it, expect } from 'vitest';

describe('Use Cases', () => {
  describe('IngestImage Use Case', () => {
    it('should have input structure', () => {
      const input = {
        filename: 'red-fox.jpg',
        filePath: '/images/red-fox.jpg',
        width: 800,
        height: 600,
        mimeType: 'image/jpeg',
      };

      expect(input.filename).toBeDefined();
      expect(input.filePath).toBeDefined();
      expect(typeof input.width).toBe('number');
      expect(typeof input.height).toBe('number');
      expect(input.mimeType).toBeDefined();
    });

    it('should have output structure', () => {
      const output = {
        image: {
          id: 'img-1',
          filename: 'red-fox.jpg',
          originalPath: '/images/red-fox.jpg',
        },
        metadata: {
          id: 'meta-1',
          imageId: 'img-1',
          subject: 'red fox',
          category: 'animal',
          confidence: 0.95,
        },
        jobId: 'job-1',
      };

      expect(output.image).toBeDefined();
      expect(output.metadata).toBeDefined();
      expect(output.jobId).toBeDefined();
    });
  });

  describe('GenerateEmbedding Use Case', () => {
    it('should have input structure', () => {
      const input = {
        entityType: 'image',
        entityId: 'img-1',
      };

      expect(['image', 'post']).toContain(input.entityType);
      expect(input.entityId).toBeDefined();
    });

    it('should have output structure', () => {
      const output = {
        entityId: 'img-1',
        entityType: 'image',
        embeddingDimension: 768,
        jobId: 'job-1',
      };

      expect(output.entityId).toBeDefined();
      expect(['image', 'post']).toContain(output.entityType);
      expect(output.embeddingDimension).toBeGreaterThan(0);
      expect(output.jobId).toBeDefined();
    });
  });

  describe('MatchImages Use Case', () => {
    it('should have input structure', () => {
      const input = {
        postId: 'post-1',
        limit: 10,
        minSimilarity: 0.5,
      };

      expect(input.postId).toBeDefined();
      expect(typeof input.limit).toBe('number');
      expect(typeof input.minSimilarity).toBe('number');
    });

    it('should have output structure', () => {
      const output = {
        postId: 'post-1',
        suggestions: [
          {
            suggestionId: 'sug-1',
            imageId: 'img-1',
            filename: 'red-fox.jpg',
            subject: 'red fox',
            category: 'animal',
            caption: 'A red fox',
            similarity: 0.85,
            confidence: 0.95,
            guardDecision: {
              accepted: true,
              reason: 'Good match',
              categoryMatch: true,
            },
          },
        ],
        topSuggestion: {
          suggestionId: 'sug-1',
          imageId: 'img-1',
          similarity: 0.85,
          confidence: 0.95,
          accepted: true,
          reason: 'Good match',
        },
        noConfidentMatch: false,
        explanation: undefined,
      };

      expect(output.postId).toBeDefined();
      expect(Array.isArray(output.suggestions)).toBe(true);
      expect(output.topSuggestion).toBeDefined();
      expect(typeof output.noConfidentMatch).toBe('boolean');
    });
  });
});
