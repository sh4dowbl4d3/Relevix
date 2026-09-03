import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BudgetGuard } from '../../src/domain/guards/BudgetGuard.js';

vi.mock('../../src/infrastructure/database/pool.js', () => ({
  getPool: vi.fn(),
}));

describe('BudgetGuard', () => {
  let budgetGuard: BudgetGuard;
  let mockJobRepo: any;

  beforeEach(() => {
    mockJobRepo = {
      getDailyCostStats: vi.fn().mockResolvedValue({
        visionCalls: 10,
        embeddingCalls: 50,
        totalCostUsd: 0.5,
      }),
    };
    budgetGuard = new BudgetGuard(mockJobRepo);
  });

  it('should allow operations within budget', async () => {
    const result = await budgetGuard.checkBudget('vision');
    expect(result.allowed).toBe(true);
    expect(result.currentUsage.visionCalls).toBe(10);
  });

  it('should reject when vision calls exceed limit', async () => {
    mockJobRepo.getDailyCostStats.mockResolvedValue({
      visionCalls: 100,
      embeddingCalls: 50,
      totalCostUsd: 0.5,
    });

    const result = await budgetGuard.checkBudget('vision');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('vision call limit');
  });

  it('should reject when embedding calls exceed limit', async () => {
    mockJobRepo.getDailyCostStats.mockResolvedValue({
      visionCalls: 10,
      embeddingCalls: 500,
      totalCostUsd: 0.5,
    });

    const result = await budgetGuard.checkBudget('embedding');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('embedding call limit');
  });

  it('should reject when cost exceeds budget', async () => {
    mockJobRepo.getDailyCostStats.mockResolvedValue({
      visionCalls: 10,
      embeddingCalls: 50,
      totalCostUsd: 5.0,
    });

    const result = await budgetGuard.checkBudget('vision');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('budget limit');
  });

  it('should return budget status', async () => {
    const status = await budgetGuard.getBudgetStatus();
    expect(status).toHaveProperty('dailyVisionCalls');
    expect(status).toHaveProperty('dailyEmbeddingCalls');
    expect(status).toHaveProperty('dailyCostUsd');
    expect(status).toHaveProperty('visionRemaining');
    expect(status).toHaveProperty('embeddingRemaining');
    expect(status).toHaveProperty('budgetRemaining');
  });
});
