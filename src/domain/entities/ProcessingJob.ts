export type JobType = 'vision' | 'embedding' | 'batch';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';

export interface ProcessingJob {
  id: string;
  type: JobType;
  status: JobStatus;
  entityType: 'image' | 'post';
  entityId: string;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AiCostRecord {
  id: string;
  jobId?: string;
  operationType: 'vision' | 'embedding';
  provider: string;
  model: string;
  entityType: 'image' | 'post';
  entityId: string;
  tokensUsed?: number;
  estimatedCostUsd: number;
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
}

export interface BudgetStatus {
  dailyVisionCalls: number;
  dailyEmbeddingCalls: number;
  dailyCostUsd: number;
  visionLimit: number;
  embeddingLimit: number;
  budgetLimit: number;
}
