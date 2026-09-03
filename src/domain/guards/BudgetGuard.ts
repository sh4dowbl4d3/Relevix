import { JobRepository } from '../repositories/JobRepository.js';
import { getConfig } from '../../config/index.js';

export interface BudgetCheckResult {
  allowed: boolean;
  reason?: string;
  currentUsage: {
    visionCalls: number;
    embeddingCalls: number;
    costUsd: number;
  };
  limits: {
    visionCalls: number;
    embeddingCalls: number;
    costUsd: number;
  };
}

export class BudgetGuard {
  constructor(private jobRepo: JobRepository) {}

  async checkBudget(operationType: 'vision' | 'embedding'): Promise<BudgetCheckResult> {
    const config = getConfig();
    const stats = await this.jobRepo.getDailyCostStats();

    const limits = {
      visionCalls: config.MAX_VISION_CALLS_PER_DAY,
      embeddingCalls: config.MAX_EMBEDDING_CALLS_PER_DAY,
      costUsd: config.DAILY_BUDGET_LIMIT_USD,
    };

    const currentUsage = {
      visionCalls: stats.visionCalls,
      embeddingCalls: stats.embeddingCalls,
      costUsd: stats.totalCostUsd,
    };

    if (operationType === 'vision' && stats.visionCalls >= limits.visionCalls) {
      return {
        allowed: false,
        reason: `Daily vision call limit reached (${limits.visionCalls})`,
        currentUsage,
        limits,
      };
    }

    if (operationType === 'embedding' && stats.embeddingCalls >= limits.embeddingCalls) {
      return {
        allowed: false,
        reason: `Daily embedding call limit reached (${limits.embeddingCalls})`,
        currentUsage,
        limits,
      };
    }

    if (stats.totalCostUsd >= limits.costUsd) {
      return {
        allowed: false,
        reason: `Daily budget limit reached ($${limits.costUsd})`,
        currentUsage,
        limits,
      };
    }

    return {
      allowed: true,
      currentUsage,
      limits,
    };
  }

  async getBudgetStatus(): Promise<{
    dailyVisionCalls: number;
    dailyEmbeddingCalls: number;
    dailyCostUsd: number;
    visionLimit: number;
    embeddingLimit: number;
    budgetLimit: number;
    visionRemaining: number;
    embeddingRemaining: number;
    budgetRemaining: number;
  }> {
    const config = getConfig();
    const stats = await this.jobRepo.getDailyCostStats();

    return {
      dailyVisionCalls: stats.visionCalls,
      dailyEmbeddingCalls: stats.embeddingCalls,
      dailyCostUsd: stats.totalCostUsd,
      visionLimit: config.MAX_VISION_CALLS_PER_DAY,
      embeddingLimit: config.MAX_EMBEDDING_CALLS_PER_DAY,
      budgetLimit: config.DAILY_BUDGET_LIMIT_USD,
      visionRemaining: Math.max(0, config.MAX_VISION_CALLS_PER_DAY - stats.visionCalls),
      embeddingRemaining: Math.max(0, config.MAX_EMBEDDING_CALLS_PER_DAY - stats.embeddingCalls),
      budgetRemaining: Math.max(0, config.DAILY_BUDGET_LIMIT_USD - stats.totalCostUsd),
    };
  }
}
