import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MatchImages } from '../../src/application/use-cases/MatchImages.js';
import { MismatchGuard } from '../../src/domain/guards/MismatchGuard.js';

describe('MatchImages Use Case', () => {
  let matchImages: MatchImages;
  let mockPostRepo: any;
  let mockImageRepo: any;
  let mockSuggestionRepo: any;
  let mockEmbeddingProvider: any;
  let guard: MismatchGuard;

  beforeEach(() => {
    guard = new MismatchGuard({
      similarityThreshold: 0.3,
      confidenceThreshold: 0.3,
      categoryMatchRequired: true,
    });

    mockPostRepo = {
      findWithVector: vi.fn(),
      saveVector: vi.fn(),
    };

    mockImageRepo = {
      findSimilarVectorsForPost: vi.fn(),
      findWithMetadata: vi.fn(),
      getMetadata: vi.fn(),
    };

    mockSuggestionRepo = {
      create: vi.fn(),
    };

    mockEmbeddingProvider = {
      generateEmbedding: vi.fn().mockResolvedValue({
        embedding: new Array(768).fill(0.1),
        dimension: 768,
        model: 'test-model',
      }),
    };

    matchImages = new MatchImages(
      mockPostRepo,
      mockImageRepo,
      mockSuggestionRepo,
      mockEmbeddingProvider,
      guard
    );
  });

  it('should throw error for non-existent post', async () => {
    mockPostRepo.findWithVector.mockResolvedValue(null);

    await expect(
      matchImages.execute({ postId: 'non-existent' })
    ).rejects.toThrow('Post non-existent not found');
  });

  it('should generate embedding for post without vector', async () => {
    mockPostRepo.findWithVector.mockResolvedValue({
      id: 'post-1',
      title: 'Fox Article',
      content: 'About red foxes',
      vector: null,
    });

    mockImageRepo.findSimilarVectorsForPost.mockResolvedValue([]);
    mockSuggestionRepo.create.mockResolvedValue({});

    await matchImages.execute({ postId: 'post-1' });

    expect(mockEmbeddingProvider.generateEmbedding).toHaveBeenCalled();
    expect(mockPostRepo.saveVector).toHaveBeenCalled();
  });

  it('should return suggestions with guard decisions', async () => {
    mockPostRepo.findWithVector.mockResolvedValue({
      id: 'post-1',
      title: 'Fox Article',
      content: 'About red foxes',
      vector: { embedding: new Array(768).fill(0.1) },
    });

    mockImageRepo.findSimilarVectorsForPost.mockResolvedValue([
      {
        imageId: 'img-1',
        similarity: 0.8,
        embedding: new Array(768).fill(0.1),
      },
    ]);

    mockImageRepo.findWithMetadata.mockResolvedValue({
      id: 'img-1',
      filename: 'fox.jpg',
      metadata: {
        subject: 'red fox',
        category: 'animal',
        attributes: ['orange fur'],
        caption: 'A red fox',
        confidence: 0.9,
      },
    });

    mockSuggestionRepo.create.mockResolvedValue({
      id: 'sug-1',
      postId: 'post-1',
      imageId: 'img-1',
    });

    const result = await matchImages.execute({ postId: 'post-1' });

    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0].guardDecision).toHaveProperty('accepted');
    expect(result.suggestions[0].guardDecision).toHaveProperty('reason');
  });

  it('should mark noConfidentMatch when no suggestions accepted', async () => {
    mockPostRepo.findWithVector.mockResolvedValue({
      id: 'post-1',
      title: 'Fox Article',
      content: 'About red foxes',
      vector: { embedding: new Array(768).fill(0.1) },
    });

    mockImageRepo.findSimilarVectorsForPost.mockResolvedValue([
      {
        imageId: 'img-1',
        similarity: 0.4,
        embedding: new Array(768).fill(0.1),
      },
    ]);

    mockImageRepo.findWithMetadata.mockResolvedValue({
      id: 'img-1',
      filename: 'wolf.jpg',
      metadata: {
        subject: 'gray wolf',
        category: 'animal',
        attributes: ['gray fur'],
        caption: 'A gray wolf',
        confidence: 0.8,
      },
    });

    mockSuggestionRepo.create.mockResolvedValue({
      id: 'sug-1',
      postId: 'post-1',
      imageId: 'img-1',
    });

    const result = await matchImages.execute({ postId: 'post-1' });

    expect(result.noConfidentMatch).toBe(true);
    expect(result.topSuggestion).toBeNull();
  });
});
