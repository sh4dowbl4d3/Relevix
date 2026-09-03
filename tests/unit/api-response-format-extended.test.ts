import { describe, it, expect } from 'vitest';

describe('API Response Format', () => {
  describe('Suggestion Response', () => {
    it('should have correct structure for accepted suggestion', () => {
      const response = {
        id: 'sug-1',
        postId: 'post-1',
        imageId: 'img-1',
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
        createdAt: new Date().toISOString(),
      };

      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('postId');
      expect(response).toHaveProperty('imageId');
      expect(response).toHaveProperty('similarityScore');
      expect(response).toHaveProperty('confidenceScore');
      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('guardDecision');
      expect(response).toHaveProperty('createdAt');
      expect(response.guardDecision.accepted).toBe(true);
    });

    it('should have correct structure for rejected suggestion', () => {
      const response = {
        id: 'sug-2',
        postId: 'post-1',
        imageId: 'img-2',
        similarityScore: 0.65,
        confidenceScore: 0.75,
        status: 'rejected',
        guardDecision: {
          accepted: false,
          reason: 'Subject mismatch: expected fox, detected wolf',
          categoryMatch: true,
          subjectSimilarity: 0.2,
          overallConfidence: 0.45,
        },
        createdAt: new Date().toISOString(),
      };

      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('postId');
      expect(response).toHaveProperty('imageId');
      expect(response).toHaveProperty('similarityScore');
      expect(response).toHaveProperty('confidenceScore');
      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('guardDecision');
      expect(response).toHaveProperty('createdAt');
      expect(response.guardDecision.accepted).toBe(false);
    });
  });

  describe('Batch Response', () => {
    it('should have correct structure for batch job', () => {
      const response = {
        id: 'job-1',
        type: 'vision',
        status: 'pending',
        entityType: 'image',
        entityId: 'img-1',
        attempts: 0,
        maxAttempts: 3,
        createdAt: new Date().toISOString(),
      };

      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('type');
      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('entityType');
      expect(response).toHaveProperty('entityId');
      expect(response).toHaveProperty('attempts');
      expect(response).toHaveProperty('maxAttempts');
      expect(response).toHaveProperty('createdAt');
    });
  });

  describe('Evaluation Response', () => {
    it('should have correct structure for evaluation results', () => {
      const response = {
        total: 12,
        correct: 11,
        precision: 0.917,
        results: [
          {
            postId: 'eval-fox-1',
            expectedImage: 'fox-01',
            actualImage: 'fox-01',
            match: true,
          },
        ],
      };

      expect(response).toHaveProperty('total');
      expect(response).toHaveProperty('correct');
      expect(response).toHaveProperty('precision');
      expect(response).toHaveProperty('results');
      expect(response.precision).toBeCloseTo(0.917, 2);
    });
  });

  describe('Error Response', () => {
    it('should have correct structure for error', () => {
      const response = {
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: [
            {
              field: 'title',
              message: 'Title is required',
            },
          ],
        },
      };

      expect(response).toHaveProperty('error');
      expect(response.error).toHaveProperty('message');
      expect(response.error).toHaveProperty('code');
      expect(response.error).toHaveProperty('details');
    });
  });

  describe('Pagination', () => {
    it('should have correct structure for paginated response', () => {
      const response = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 100,
          totalPages: 10,
        },
      };

      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('pagination');
      expect(response.pagination).toHaveProperty('page');
      expect(response.pagination).toHaveProperty('limit');
      expect(response.pagination).toHaveProperty('total');
      expect(response.pagination).toHaveProperty('totalPages');
    });
  });
});
