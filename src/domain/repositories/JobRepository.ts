import { ProcessingJob, AiCostRecord, JobType, JobStatus } from '../entities/ProcessingJob.js';

export interface JobRepository {
  create(job: Omit<ProcessingJob, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProcessingJob>;
  findById(id: string): Promise<ProcessingJob | null>;
  update(id: string, updates: Partial<ProcessingJob>): Promise<ProcessingJob | null>;
  findByEntity(entityType: string, entityId: string): Promise<ProcessingJob[]>;
  findByStatus(type: JobType, status: JobStatus, limit?: number): Promise<ProcessingJob[]>;
  findPendingJobs(type: JobType, limit?: number): Promise<ProcessingJob[]>;
  incrementAttempts(id: string): Promise<ProcessingJob | null>;
  markProcessing(id: string): Promise<ProcessingJob | null>;
  markCompleted(id: string): Promise<ProcessingJob | null>;
  markFailed(id: string, error: string): Promise<ProcessingJob | null>;

  recordCost(record: Omit<AiCostRecord, 'id' | 'createdAt'>): Promise<AiCostRecord>;
  getDailyCostStats(): Promise<{
    visionCalls: number;
    embeddingCalls: number;
    totalCostUsd: number;
  }>;
  getCostForEntity(entityType: string, entityId: string): Promise<AiCostRecord[]>;
}
