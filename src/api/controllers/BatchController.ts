import { Request, Response } from 'express';
import { BatchProcessor } from '../../infrastructure/jobs/BatchProcessor.js';
import { BudgetGuard } from '../../domain/guards/BudgetGuard.js';
import { JobRepository } from '../../domain/repositories/JobRepository.js';
import { ApiResponse, BatchJobStatusResponse, BudgetStatusResponse } from '../schemas/response.js';
import { BatchProcessQuery } from '../schemas/request.js';

export class BatchController {
  constructor(
    private batchProcessor: BatchProcessor,
    private budgetGuard: BudgetGuard,
    private jobRepo: JobRepository
  ) {}

  async startBatchProcess(req: Request, res: Response): Promise<void> {
    const queryResult = BatchProcessQuery.safeParse(req.query);
    if (!queryResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUERY',
          message: 'Invalid query parameters',
          details: queryResult.error.flatten(),
        },
      });
      return;
    }

    const budgetCheck = await this.budgetGuard.checkBudget(
      queryResult.data.entityType === 'image' ? 'vision' : 'embedding'
    );

    if (!budgetCheck.allowed) {
      res.status(429).json({
        success: false,
        error: {
          code: 'BUDGET_EXCEEDED',
          message: budgetCheck.reason,
          details: budgetCheck,
        },
      });
      return;
    }

    try {
      let result;
      if (queryResult.data.entityType === 'image') {
        result = await this.batchProcessor.processImages(queryResult.data.limit);
      } else {
        result = await this.batchProcessor.processPosts(queryResult.data.limit);
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'BATCH_FAILED',
          message: error instanceof Error ? error.message : 'Batch processing failed',
        },
      });
    }
  }

  async getJobStatus(req: Request, res: Response): Promise<void> {
    const jobId = req.params.jobId;

    try {
      const job = await this.jobRepo.findById(jobId);

      if (!job) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Job not found',
          },
        });
        return;
      }

      const response: ApiResponse<BatchJobStatusResponse> = {
        success: true,
        data: {
          jobId: job.id,
          type: job.type,
          status: job.status,
          entityType: job.entityType,
          entityId: job.entityId,
          attempts: job.attempts,
          startedAt: job.startedAt?.toISOString(),
          completedAt: job.completedAt?.toISOString(),
          error: job.lastError,
        },
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch job status',
        },
      });
    }
  }

  async getBudgetStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await this.budgetGuard.getBudgetStatus();

      const response: ApiResponse<BudgetStatusResponse> = {
        success: true,
        data: status,
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch budget status',
        },
      });
    }
  }

  async getCostTracking(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.jobRepo.getDailyCostStats();

      res.json({
        success: true,
        data: {
          totalCostUsd: stats.totalCostUsd,
          visionCalls: stats.visionCalls,
          embeddingCalls: stats.embeddingCalls,
          averageVisionCost: stats.visionCalls > 0 ? stats.totalCostUsd / stats.visionCalls : 0,
          averageEmbeddingCost: stats.embeddingCalls > 0 ? stats.totalCostUsd / stats.embeddingCalls : 0,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch cost tracking',
        },
      });
    }
  }
}
