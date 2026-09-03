import { Suggestion, SuggestionWithDetails, SuggestionStatus } from '../entities/Suggestion.js';

export interface SuggestionRepository {
  create(suggestion: Omit<Suggestion, 'id' | 'createdAt' | 'updatedAt'>): Promise<Suggestion>;
  findById(id: string): Promise<SuggestionWithDetails | null>;
  findByPostId(postId: string): Promise<SuggestionWithDetails[]>;
  findByImageId(imageId: string): Promise<Suggestion[]>;
  findByStatus(status: SuggestionStatus): Promise<SuggestionWithDetails[]>;
  update(id: string, updates: Partial<Suggestion>): Promise<Suggestion | null>;
  approve(id: string, reviewedBy?: string, notes?: string): Promise<Suggestion>;
  reject(id: string, reason: string, reviewedBy?: string, notes?: string): Promise<Suggestion>;
  findTopSuggestionForPost(postId: string): Promise<SuggestionWithDetails | null>;
}
