export type SuggestionStatus = 'pending' | 'approved' | 'rejected';

export interface Suggestion {
  id: string;
  postId: string;
  imageId: string;
  similarityScore: number;
  confidenceScore: number;
  status: SuggestionStatus;
  guardDecision: GuardDecision;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuardDecision {
  accepted: boolean;
  reason: string;
  categoryMatch: boolean;
  subjectSimilarity: number;
  overallConfidence: number;
  rejectionReason?: string;
}

export interface SuggestionWithDetails extends Suggestion {
  post?: {
    id: string;
    title: string;
    content: string;
  };
  image?: {
    id: string;
    filename: string;
    metadata?: {
      subject: string;
      category: string;
      caption: string;
      confidence: number;
    };
  };
}
