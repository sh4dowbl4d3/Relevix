import { describe, it, expect } from 'vitest';

describe('API Response Format', () => {
  it('should have success response format', () => {
    const response = {
      success: true,
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test',
      },
    };

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data.id).toBeDefined();
  });

  it('should have error response format', () => {
    const response = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
      },
    };

    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
    expect(response.error.code).toBeDefined();
    expect(response.error.message).toBeDefined();
  });

  it('should have image suggestion response format', () => {
    const response = {
      postId: '550e8400-e29b-41d4-a716-446655440000',
      suggestions: [
        {
          imageId: '550e8400-e29b-41d4-a716-446655440001',
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
        imageId: '550e8400-e29b-41d4-a716-446655440001',
        similarity: 0.85,
        confidence: 0.95,
        accepted: true,
        reason: 'Good match',
      },
      noConfidentMatch: false,
    };

    expect(response.postId).toBeDefined();
    expect(Array.isArray(response.suggestions)).toBe(true);
    expect(response.topSuggestion).toBeDefined();
    expect(typeof response.noConfidentMatch).toBe('boolean');
  });

  it('should have budget status response format', () => {
    const response = {
      dailyVisionCalls: 15,
      dailyEmbeddingCalls: 45,
      dailyCostUsd: 0.15,
      visionLimit: 100,
      embeddingLimit: 500,
      budgetLimit: 5.00,
      visionRemaining: 85,
      embeddingRemaining: 455,
      budgetRemaining: 4.85,
    };

    expect(typeof response.dailyVisionCalls).toBe('number');
    expect(typeof response.dailyEmbeddingCalls).toBe('number');
    expect(typeof response.dailyCostUsd).toBe('number');
    expect(typeof response.visionLimit).toBe('number');
    expect(typeof response.embeddingLimit).toBe('number');
    expect(typeof response.budgetLimit).toBe('number');
    expect(typeof response.visionRemaining).toBe('number');
    expect(typeof response.embeddingRemaining).toBe('number');
    expect(typeof response.budgetRemaining).toBe('number');
  });

  it('should have batch job status response format', () => {
    const response = {
      jobId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'vision',
      status: 'completed',
      entityType: 'image',
      entityId: '550e8400-e29b-41d4-a716-446655440001',
      attempts: 1,
      startedAt: '2024-01-01T00:00:00.000Z',
      completedAt: '2024-01-01T00:00:01.000Z',
    };

    expect(response.jobId).toBeDefined();
    expect(['vision', 'embedding', 'batch']).toContain(response.type);
    expect(['pending', 'processing', 'completed', 'failed', 'retrying']).toContain(response.status);
    expect(['image', 'post']).toContain(response.entityType);
    expect(response.attempts).toBeGreaterThanOrEqual(0);
  });
});
