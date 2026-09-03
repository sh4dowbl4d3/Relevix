import { Pool } from 'pg';
import { JobRepository } from '../../domain/repositories/JobRepository.js';
import { ProcessingJob, AiCostRecord, JobType, JobStatus } from '../../domain/entities/ProcessingJob.js';

export class PostgresJobRepository implements JobRepository {
  constructor(private pool: Pool) {}

  async create(job: Omit<ProcessingJob, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProcessingJob> {
    const result = await this.pool.query(
      `INSERT INTO processing_jobs (type, status, entity_type, entity_id, attempts, max_attempts)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [job.type, job.status, job.entityType, job.entityId, job.attempts, job.maxAttempts]
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<ProcessingJob | null> {
    const result = await this.pool.query(
      'SELECT * FROM processing_jobs WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async update(id: string, updates: Partial<ProcessingJob>): Promise<ProcessingJob | null> {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.status !== undefined) {
      setClauses.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.attempts !== undefined) {
      setClauses.push(`attempts = $${paramIndex++}`);
      values.push(updates.attempts);
    }
    if (updates.lastError !== undefined) {
      setClauses.push(`last_error = $${paramIndex++}`);
      values.push(updates.lastError);
    }
    if (updates.startedAt !== undefined) {
      setClauses.push(`started_at = $${paramIndex++}`);
      values.push(updates.startedAt);
    }
    if (updates.completedAt !== undefined) {
      setClauses.push(`completed_at = $${paramIndex++}`);
      values.push(updates.completedAt);
    }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE processing_jobs SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async findByEntity(entityType: string, entityId: string): Promise<ProcessingJob[]> {
    const result = await this.pool.query(
      'SELECT * FROM processing_jobs WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC',
      [entityType, entityId]
    );
    return result.rows;
  }

  async findByStatus(type: JobType, status: JobStatus, limit = 100): Promise<ProcessingJob[]> {
    const result = await this.pool.query(
      'SELECT * FROM processing_jobs WHERE type = $1 AND status = $2 ORDER BY created_at ASC LIMIT $3',
      [type, status, limit]
    );
    return result.rows;
  }

  async findPendingJobs(type: JobType, limit = 100): Promise<ProcessingJob[]> {
    const result = await this.pool.query(
      `SELECT * FROM processing_jobs
       WHERE type = $1 AND status IN ('pending', 'retrying')
       ORDER BY created_at ASC
       LIMIT $2`,
      [type, limit]
    );
    return result.rows;
  }

  async incrementAttempts(id: string): Promise<ProcessingJob | null> {
    const result = await this.pool.query(
      `UPDATE processing_jobs SET attempts = attempts + 1 WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  }

  async markProcessing(id: string): Promise<ProcessingJob | null> {
    const result = await this.pool.query(
      `UPDATE processing_jobs SET status = 'processing', started_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  }

  async markCompleted(id: string): Promise<ProcessingJob | null> {
    const result = await this.pool.query(
      `UPDATE processing_jobs SET status = 'completed', completed_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  }

  async markFailed(id: string, error: string): Promise<ProcessingJob | null> {
    const result = await this.pool.query(
      `UPDATE processing_jobs SET status = 'failed', last_error = $1, completed_at = NOW() WHERE id = $2 RETURNING *`,
      [error, id]
    );
    return result.rows[0] || null;
  }

  async recordCost(record: Omit<AiCostRecord, 'id' | 'createdAt'>): Promise<AiCostRecord> {
    const result = await this.pool.query(
      `INSERT INTO ai_cost_records (job_id, operation_type, provider, model, entity_type, entity_id, tokens_used, estimated_cost_usd, success, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [record.jobId, record.operationType, record.provider, record.model,
       record.entityType, record.entityId, record.tokensUsed,
       record.estimatedCostUsd, record.success, record.errorMessage]
    );
    return result.rows[0];
  }

  async getDailyCostStats(): Promise<{
    visionCalls: number;
    embeddingCalls: number;
    totalCostUsd: number;
  }> {
    const result = await this.pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE operation_type = 'vision') as vision_calls,
         COUNT(*) FILTER (WHERE operation_type = 'embedding') as embedding_calls,
         COALESCE(SUM(estimated_cost_usd), 0) as total_cost_usd
       FROM ai_cost_records
       WHERE created_at >= CURRENT_DATE`
    );
    return {
      visionCalls: parseInt(result.rows[0].vision_calls) || 0,
      embeddingCalls: parseInt(result.rows[0].embedding_calls) || 0,
      totalCostUsd: parseFloat(result.rows[0].total_cost_usd) || 0,
    };
  }

  async getCostForEntity(entityType: string, entityId: string): Promise<AiCostRecord[]> {
    const result = await this.pool.query(
      'SELECT * FROM ai_cost_records WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC',
      [entityType, entityId]
    );
    return result.rows;
  }
}
