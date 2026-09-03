export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface ImageSuggestionResponse {
  postId: string;
  suggestions: Array<{
    imageId: string;
    filename: string;
    subject: string;
    category: string;
    caption: string;
    similarity: number;
    confidence: number;
    guardDecision: {
      accepted: boolean;
      reason: string;
      categoryMatch: boolean;
    };
  }>;
  topSuggestion?: {
    imageId: string;
    similarity: number;
    confidence: number;
    accepted: boolean;
    reason: string;
  } | null;
  noConfidentMatch: boolean;
  explanation?: string;
}

export interface BatchJobStatusResponse {
  jobId: string;
  type: string;
  status: string;
  entityType: string;
  entityId: string;
  attempts: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface CostTrackingResponse {
  totalCostUsd: number;
  visionCalls: number;
  embeddingCalls: number;
  averageVisionCost: number;
  averageEmbeddingCost: number;
}

export interface BudgetStatusResponse {
  dailyVisionCalls: number;
  dailyEmbeddingCalls: number;
  dailyCostUsd: number;
  visionLimit: number;
  embeddingLimit: number;
  budgetLimit: number;
  visionRemaining: number;
  embeddingRemaining: number;
  budgetRemaining: number;
}
