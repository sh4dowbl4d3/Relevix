import { describe, it, expect, beforeEach } from 'vitest';
import { MismatchGuard } from '../../src/domain/guards/MismatchGuard.js';
import { ImageMetadata } from '../../src/domain/entities/Image.js';

describe('MismatchGuard', () => {
  let guard: MismatchGuard;

  beforeEach(() => {
    guard = new MismatchGuard({
      similarityThreshold: 0.5,
      confidenceThreshold: 0.4,
      categoryMatchRequired: true,
    });
  });

  const createMetadata = (overrides: Partial<ImageMetadata>): ImageMetadata => ({
    id: 'test-id',
    imageId: 'img-001',
    subject: 'red fox',
    category: 'animal',
    attributes: ['orange fur', 'wild', 'forest'],
    caption: 'A red fox standing in a forest',
    confidence: 0.9,
    processedAt: new Date(),
    ...overrides,
  });

  describe('PROBE 3: Fox vs Wolf rejection', () => {
    it('should reject a wolf image for a fox post', () => {
      const metadata = createMetadata({
        subject: 'gray wolf',
        category: 'animal',
        caption: 'A gray wolf in the forest',
      });

      const decision = guard.evaluate({
        postTitle: 'The Behavior of Red Foxes',
        postContent: 'Red foxes are cunning predators that hunt small mammals.',
        imageMetadata: metadata,
        similarityScore: 0.7,
      });

      expect(decision.accepted).toBe(false);
      expect(decision.categoryMatch).toBe(true);
      expect(decision.reason).toContain('Subject mismatch');
    });

    it('should accept a red fox image for a fox post', () => {
      const metadata = createMetadata({
        subject: 'red fox',
        category: 'animal',
        caption: 'A red fox in autumn colors',
      });

      const decision = guard.evaluate({
        postTitle: 'The Behavior of Red Foxes',
        postContent: 'Red foxes are cunning predators that hunt small mammals.',
        imageMetadata: metadata,
        similarityScore: 0.85,
      });

      expect(decision.accepted).toBe(true);
      expect(decision.categoryMatch).toBe(true);
    });
  });

  describe('PROBE 4: No confident match', () => {
    it('should reject when similarity is below threshold', () => {
      const metadata = createMetadata({
        subject: 'mountain landscape',
        category: 'landscape',
        caption: 'A beautiful mountain view',
        confidence: 0.95,
      });

      const decision = guard.evaluate({
        postTitle: 'The Behavior of Red Foxes',
        postContent: 'Red foxes are cunning predators that hunt small mammals.',
        imageMetadata: metadata,
        similarityScore: 0.3,
      });

      expect(decision.accepted).toBe(false);
      expect(decision.reason).toContain('Similarity score');
    });

    it('should reject when confidence is below threshold', () => {
      const metadata = createMetadata({
        subject: 'red fox',
        category: 'animal',
        confidence: 0.2,
      });

      const decision = guard.evaluate({
        postTitle: 'The Behavior of Red Foxes',
        postContent: 'Red foxes are cunning predators that hunt small mammals.',
        imageMetadata: metadata,
        similarityScore: 0.8,
      });

      expect(decision.accepted).toBe(false);
      expect(decision.reason).toContain('confidence');
    });
  });

  describe('Category matching', () => {
    it('should match animal category correctly', () => {
      const metadata = createMetadata({
        subject: 'golden retriever',
        category: 'animal',
      });

      const decision = guard.evaluate({
        postTitle: 'Choosing the Right Dog Breed',
        postContent: 'Dogs are loyal companions.',
        imageMetadata: metadata,
        similarityScore: 0.7,
      });

      expect(decision.categoryMatch).toBe(true);
    });

    it('should reject category mismatch', () => {
      const metadata = createMetadata({
        subject: 'red fox',
        category: 'technology',
      });

      const decision = guard.evaluate({
        postTitle: 'The Behavior of Red Foxes',
        postContent: 'Red foxes are cunning predators that hunt small mammals.',
        imageMetadata: metadata,
        similarityScore: 0.7,
      });

      expect(decision.categoryMatch).toBe(false);
    });
  });

  describe('Guard decision structure', () => {
    it('should return valid guard decision', () => {
      const metadata = createMetadata({});

      const decision = guard.evaluate({
        postTitle: 'Test Post',
        postContent: 'Test content',
        imageMetadata: metadata,
        similarityScore: 0.8,
      });

      expect(decision).toHaveProperty('accepted');
      expect(decision).toHaveProperty('reason');
      expect(decision).toHaveProperty('categoryMatch');
      expect(decision).toHaveProperty('subjectSimilarity');
      expect(decision).toHaveProperty('overallConfidence');
      expect(typeof decision.accepted).toBe('boolean');
      expect(typeof decision.reason).toBe('string');
      expect(typeof decision.categoryMatch).toBe('boolean');
      expect(typeof decision.subjectSimilarity).toBe('number');
      expect(typeof decision.overallConfidence).toBe('number');
    });
  });
});
