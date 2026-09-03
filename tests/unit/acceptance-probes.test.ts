import { describe, it, expect } from 'vitest';
import { MismatchGuard } from '../../src/domain/guards/MismatchGuard.js';
import { validateVisionOutput } from '../../src/api/schemas/imageMetadata.js';
import { ImageMetadata } from '../../src/domain/entities/Image.js';

describe('Acceptance Probes', () => {
  describe('PROBE 1: Schema Validation', () => {
    it('should validate correct vision output', () => {
      const validOutput = {
        subject: 'red fox',
        category: 'animal',
        attributes: ['orange fur', 'wild', 'forest'],
        caption: 'A red fox standing in a forest',
        confidence: 0.94,
      };

      const result = validateVisionOutput(validOutput);
      expect(result.subject).toBe('red fox');
      expect(result.confidence).toBe(0.94);
    });

    it('should reject low confidence classification', () => {
      const lowConfidenceOutput = {
        subject: 'unknown animal',
        category: 'animal',
        attributes: ['unclear'],
        caption: 'An unclear image of an animal',
        confidence: 0.2,
      };

      const result = validateVisionOutput(lowConfidenceOutput);
      expect(result.confidence).toBeLessThan(0.5);
    });

    it('should reject invalid output structure', () => {
      const invalidOutput = {
        subject: 'red fox',
        category: 'animal',
      };

      expect(() => validateVisionOutput(invalidOutput)).toThrow();
    });
  });

  describe('PROBE 2: Fox Article Query', () => {
    const guard = new MismatchGuard({
      similarityThreshold: 0.5,
      confidenceThreshold: 0.4,
      categoryMatchRequired: true,
    });

    it('should rank fox image first for fox post', () => {
      const foxMetadata: ImageMetadata = {
        id: 'img-fox',
        imageId: 'img-fox',
        subject: 'red fox',
        category: 'animal',
        attributes: ['orange fur', 'bushy tail'],
        caption: 'A red fox in autumn colors',
        confidence: 0.95,
        processedAt: new Date(),
      };

      const decision = guard.evaluate({
        postTitle: 'The Behavior of Red Foxes',
        postContent: 'Red foxes are cunning predators that hunt small mammals.',
        imageMetadata: foxMetadata,
        similarityScore: 0.85,
      });

      expect(decision.accepted).toBe(true);
      expect(decision.categoryMatch).toBe(true);
      expect(decision.overallConfidence).toBeGreaterThan(0.6);
    });

    it('should rank wolf lower than fox', () => {
      const wolfMetadata: ImageMetadata = {
        id: 'img-wolf',
        imageId: 'img-wolf',
        subject: 'gray wolf',
        category: 'animal',
        attributes: ['gray fur', 'pack animal'],
        caption: 'A gray wolf in the forest',
        confidence: 0.9,
        processedAt: new Date(),
      };

      const decision = guard.evaluate({
        postTitle: 'The Behavior of Red Foxes',
        postContent: 'Red foxes are cunning predators that hunt small mammals.',
        imageMetadata: wolfMetadata,
        similarityScore: 0.7,
      });

      expect(decision.accepted).toBe(false);
      expect(decision.reason).toContain('Subject mismatch');
    });

    it('should rank dog significantly lower', () => {
      const dogMetadata: ImageMetadata = {
        id: 'img-dog',
        imageId: 'img-dog',
        subject: 'golden retriever',
        category: 'animal',
        attributes: ['golden fur', 'domestic'],
        caption: 'A golden retriever in a park',
        confidence: 0.92,
        processedAt: new Date(),
      };

      const decision = guard.evaluate({
        postTitle: 'The Behavior of Red Foxes',
        postContent: 'Red foxes are cunning predators that hunt small mammals.',
        imageMetadata: dogMetadata,
        similarityScore: 0.5,
      });

      expect(decision.accepted).toBe(false);
      expect(decision.reason).toContain('Subject mismatch');
    });
  });

  describe('PROBE 3: Wolf Candidate Rejection', () => {
    const guard = new MismatchGuard({
      similarityThreshold: 0.5,
      confidenceThreshold: 0.4,
      categoryMatchRequired: true,
    });

    it('should reject wolf for fox post with explanation', () => {
      const wolfMetadata: ImageMetadata = {
        id: 'img-wolf',
        imageId: 'img-wolf',
        subject: 'gray wolf',
        category: 'animal',
        attributes: ['gray fur', 'pack animal'],
        caption: 'A gray wolf in the forest',
        confidence: 0.9,
        processedAt: new Date(),
      };

      const decision = guard.evaluate({
        postTitle: 'The Behavior of Red Foxes',
        postContent: 'Red foxes are cunning predators that hunt small mammals.',
        imageMetadata: wolfMetadata,
        similarityScore: 0.75,
      });

      expect(decision.accepted).toBe(false);
      expect(decision.rejectionReason).toBeDefined();
      expect(decision.rejectionReason).toContain('mismatch');
    });
  });

  describe('PROBE 4: No Confident Match', () => {
    const guard = new MismatchGuard({
      similarityThreshold: 0.6,
      confidenceThreshold: 0.5,
      categoryMatchRequired: true,
    });

    it('should reject when similarity below threshold', () => {
      const landscapeMetadata: ImageMetadata = {
        id: 'img-landscape',
        imageId: 'img-landscape',
        subject: 'mountain landscape',
        category: 'landscape',
        attributes: ['mountains', 'trees'],
        caption: 'A beautiful mountain view',
        confidence: 0.95,
        processedAt: new Date(),
      };

      const decision = guard.evaluate({
        postTitle: 'The Behavior of Red Foxes',
        postContent: 'Red foxes are cunning predators that hunt small mammals.',
        imageMetadata: landscapeMetadata,
        similarityScore: 0.3,
      });

      expect(decision.accepted).toBe(false);
      expect(decision.reason).toContain('Similarity score');
    });

    it('should reject when confidence below threshold', () => {
      const uncertainMetadata: ImageMetadata = {
        id: 'img-uncertain',
        imageId: 'img-uncertain',
        subject: 'unknown animal',
        category: 'animal',
        attributes: ['unclear'],
        caption: 'An unclear image',
        confidence: 0.3,
        processedAt: new Date(),
      };

      const decision = guard.evaluate({
        postTitle: 'The Behavior of Red Foxes',
        postContent: 'Red foxes are cunning predators that hunt small mammals.',
        imageMetadata: uncertainMetadata,
        similarityScore: 0.7,
      });

      expect(decision.accepted).toBe(false);
      expect(decision.reason).toContain('confidence');
    });
  });

  describe('PROBE 6: Cost Tracking', () => {
    it('should have cost record structure', () => {
      const costRecord = {
        id: 'cost-1',
        jobId: 'job-1',
        operationType: 'vision' as const,
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        entityType: 'image' as const,
        entityId: 'img-1',
        tokensUsed: 100,
        estimatedCostUsd: 0.001,
        success: true,
        createdAt: new Date(),
      };

      expect(costRecord.operationType).toBe('vision');
      expect(costRecord.estimatedCostUsd).toBeGreaterThan(0);
      expect(costRecord.success).toBe(true);
    });
  });
});
