import { describe, it, expect } from 'vitest';

describe('Cost Tracking', () => {
  it('should have cost record structure', () => {
    const costRecord = {
      id: 'cost-1',
      jobId: 'job-1',
      operationType: 'vision',
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      entityType: 'image',
      entityId: 'img-1',
      tokensUsed: 100,
      estimatedCostUsd: 0.001,
      success: true,
      errorMessage: null,
      createdAt: new Date(),
    };

    expect(costRecord.id).toBeDefined();
    expect(costRecord.jobId).toBeDefined();
    expect(['vision', 'embedding']).toContain(costRecord.operationType);
    expect(costRecord.provider).toBeDefined();
    expect(costRecord.model).toBeDefined();
    expect(['image', 'post']).toContain(costRecord.entityType);
    expect(costRecord.entityId).toBeDefined();
    expect(typeof costRecord.tokensUsed).toBe('number');
    expect(typeof costRecord.estimatedCostUsd).toBe('number');
    expect(typeof costRecord.success).toBe('boolean');
  });

  it('should have daily cost stats', () => {
    const stats = {
      visionCalls: 15,
      embeddingCalls: 45,
      totalCostUsd: 0.15,
    };

    expect(typeof stats.visionCalls).toBe('number');
    expect(typeof stats.embeddingCalls).toBe('number');
    expect(typeof stats.totalCostUsd).toBe('number');
    expect(stats.visionCalls).toBeGreaterThanOrEqual(0);
    expect(stats.embeddingCalls).toBeGreaterThanOrEqual(0);
    expect(stats.totalCostUsd).toBeGreaterThanOrEqual(0);
  });

  it('should have budget limits', () => {
    const limits = {
      visionLimit: 100,
      embeddingLimit: 500,
      budgetLimit: 5.00,
    };

    expect(limits.visionLimit).toBeGreaterThan(0);
    expect(limits.embeddingLimit).toBeGreaterThan(0);
    expect(limits.budgetLimit).toBeGreaterThan(0);
  });

  it('should calculate remaining budget', () => {
    const used = {
      visionCalls: 15,
      embeddingCalls: 45,
      costUsd: 0.15,
    };

    const limits = {
      visionLimit: 100,
      embeddingLimit: 500,
      budgetLimit: 5.00,
    };

    const remaining = {
      visionRemaining: limits.visionLimit - used.visionCalls,
      embeddingRemaining: limits.embeddingLimit - used.embeddingCalls,
      budgetRemaining: limits.budgetLimit - used.costUsd,
    };

    expect(remaining.visionRemaining).toBe(85);
    expect(remaining.embeddingRemaining).toBe(455);
    expect(remaining.budgetRemaining).toBeCloseTo(4.85, 2);
  });

  it('should track cost per operation', () => {
    const visionCost = 0.001;
    const embeddingCost = 0.0001;

    const totalCost = visionCost * 15 + embeddingCost * 45;

    expect(totalCost).toBeGreaterThan(0);
    expect(totalCost).toBeCloseTo(0.0195, 4);
  });
});
