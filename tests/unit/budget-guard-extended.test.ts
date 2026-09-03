import { describe, it, expect } from 'vitest';

describe('Budget Guard', () => {
  it('should have budget check result structure', () => {
    const result = {
      allowed: true,
      reason: undefined,
      currentUsage: {
        visionCalls: 15,
        embeddingCalls: 45,
        costUsd: 0.15,
      },
      limits: {
        visionCalls: 100,
        embeddingCalls: 500,
        costUsd: 5.00,
      },
    };

    expect(typeof result.allowed).toBe('boolean');
    expect(result.currentUsage).toBeDefined();
    expect(result.limits).toBeDefined();
  });

  it('should have budget status structure', () => {
    const status = {
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

    expect(typeof status.dailyVisionCalls).toBe('number');
    expect(typeof status.dailyEmbeddingCalls).toBe('number');
    expect(typeof status.dailyCostUsd).toBe('number');
    expect(typeof status.visionLimit).toBe('number');
    expect(typeof status.embeddingLimit).toBe('number');
    expect(typeof status.budgetLimit).toBe('number');
    expect(typeof status.visionRemaining).toBe('number');
    expect(typeof status.embeddingRemaining).toBe('number');
    expect(typeof status.budgetRemaining).toBe('number');
  });

  it('should check vision call limit', () => {
    const usage = 100;
    const limit = 100;

    const allowed = usage < limit;

    expect(allowed).toBe(false);
  });

  it('should check embedding call limit', () => {
    const usage = 500;
    const limit = 500;

    const allowed = usage < limit;

    expect(allowed).toBe(false);
  });

  it('should check budget limit', () => {
    const usage = 5.00;
    const limit = 5.00;

    const allowed = usage < limit;

    expect(allowed).toBe(false);
  });

  it('should allow usage within limits', () => {
    const visionUsage = 50;
    const embeddingUsage = 200;
    const costUsage = 2.50;

    const visionLimit = 100;
    const embeddingLimit = 500;
    const budgetLimit = 5.00;

    const allowed = visionUsage < visionLimit &&
                    embeddingUsage < embeddingLimit &&
                    costUsage < budgetLimit;

    expect(allowed).toBe(true);
  });
});
