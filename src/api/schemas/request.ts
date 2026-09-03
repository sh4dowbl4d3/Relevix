import { z } from 'zod';

export const GetImagesForPostParams = z.object({
  id: z.string().uuid('Invalid post ID'),
});

export const GetImagesForPostQuery = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
  minSimilarity: z.coerce.number().min(0).max(1).optional(),
});

export const ApproveSuggestionBody = z.object({
  notes: z.string().max(500).optional(),
});

export const RejectSuggestionBody = z.object({
  reason: z.string().min(1, 'Rejection reason is required').max(500),
  notes: z.string().max(500).optional(),
});

export const CreatePostBody = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1).max(10000),
  excerpt: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().max(100).optional(),
});

export const BatchProcessQuery = z.object({
  entityType: z.enum(['image', 'post']).default('image'),
  limit: z.coerce.number().min(1).max(100).default(10),
});
