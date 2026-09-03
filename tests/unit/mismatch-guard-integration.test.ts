import { describe, it, expect } from 'vitest';
import { MismatchGuard } from '../../src/domain/guards/MismatchGuard.js';
import { ImageMetadata } from '../../src/domain/entities/Image.js';

describe('Mismatch Guard Integration', () => {
  const createMetadata = (subject: string, category: string, confidence: number): ImageMetadata => ({
    id: 'test-id',
    imageId: 'img-001',
    subject,
    category,
    attributes: ['test'],
    caption: `A ${subject}`,
    confidence,
    processedAt: new Date(),
  });

  const evaluateGuard = (metadata: ImageMetadata, similarity: number, config?: { similarityThreshold?: number; confidenceThreshold?: number }) => {
    const guard = new MismatchGuard({
      similarityThreshold: config?.similarityThreshold ?? 0.5,
      confidenceThreshold: config?.confidenceThreshold ?? 0.4,
      categoryMatchRequired: true,
    });

    return guard.evaluate({
      postTitle: 'The Behavior of Red Foxes',
      postContent: 'Red foxes are cunning predators that hunt small mammals.',
      imageMetadata: metadata,
      similarityScore: similarity,
    });
  };

  describe('PROBE 2: Fox Article Query', () => {
    it('should rank fox image first for fox post', () => {
      const foxMetadata = createMetadata('red fox', 'animal', 0.95);
      const decision = evaluateGuard(foxMetadata, 0.85);

      expect(decision.accepted).toBe(true);
      expect(decision.categoryMatch).toBe(true);
      expect(decision.overallConfidence).toBeGreaterThan(0.6);
    });

    it('should rank wolf lower than fox', () => {
      const wolfMetadata = createMetadata('gray wolf', 'animal', 0.9);
      const decision = evaluateGuard(wolfMetadata, 0.7);

      expect(decision.accepted).toBe(false);
      expect(decision.reason).toContain('Subject mismatch');
    });

    it('should rank dog significantly lower', () => {
      const dogMetadata = createMetadata('golden retriever', 'animal', 0.92);
      const decision = evaluateGuard(dogMetadata, 0.5);

      expect(decision.accepted).toBe(false);
      expect(decision.reason).toContain('Subject mismatch');
    });
  });

  describe('PROBE 3: Wolf Candidate Rejection', () => {
    it('should reject wolf for fox post with explanation', () => {
      const wolfMetadata = createMetadata('gray wolf', 'animal', 0.9);
      const decision = evaluateGuard(wolfMetadata, 0.75);

      expect(decision.accepted).toBe(false);
      expect(decision.rejectionReason).toBeDefined();
      expect(decision.rejectionReason).toContain('mismatch');
    });
  });

  describe('PROBE 4: No Confident Match', () => {
    it('should reject when similarity below threshold', () => {
      const landscapeMetadata = createMetadata('mountain landscape', 'landscape', 0.95);
      const decision = evaluateGuard(landscapeMetadata, 0.3, { similarityThreshold: 0.6 });

      expect(decision.accepted).toBe(false);
      expect(decision.reason).toContain('Similarity score');
    });

    it('should reject when confidence below threshold', () => {
      const uncertainMetadata = createMetadata('unknown animal', 'animal', 0.3);
      const decision = evaluateGuard(uncertainMetadata, 0.7, { confidenceThreshold: 0.5 });

      expect(decision.accepted).toBe(false);
      expect(decision.reason).toContain('confidence');
    });
  });
});
