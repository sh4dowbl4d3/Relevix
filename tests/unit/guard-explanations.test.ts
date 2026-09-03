import { describe, it, expect } from 'vitest';
import { MismatchGuard } from '../../src/domain/guards/MismatchGuard.js';
import { ImageMetadata } from '../../src/domain/entities/Image.js';

describe('Guard Explanations', () => {
  const guard = new MismatchGuard({
    similarityThreshold: 0.5,
    confidenceThreshold: 0.4,
    categoryMatchRequired: true,
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

  it('should provide clear similarity rejection reason', () => {
    const metadata = createMetadata({ subject: 'mountain', category: 'landscape' });

    const decision = guard.evaluate({
      postTitle: 'Fox Article',
      postContent: 'About red foxes',
      imageMetadata: metadata,
      similarityScore: 0.2,
    });

    expect(decision.reason).toContain('Similarity score');
    expect(decision.reason).toContain('below threshold');
  });

  it('should provide clear confidence rejection reason', () => {
    const metadata = createMetadata({ confidence: 0.2 });

    const decision = guard.evaluate({
      postTitle: 'Fox Article',
      postContent: 'About red foxes',
      imageMetadata: metadata,
      similarityScore: 0.8,
    });

    expect(decision.reason).toContain('confidence');
    expect(decision.reason).toContain('below threshold');
  });

  it('should provide clear category mismatch reason', () => {
    const metadata = createMetadata({ category: 'technology' });

    const decision = guard.evaluate({
      postTitle: 'Fox Article',
      postContent: 'About red foxes',
      imageMetadata: metadata,
      similarityScore: 0.7,
    });

    expect(decision.reason).toContain('Category mismatch');
  });

  it('should provide clear subject mismatch reason', () => {
    const metadata = createMetadata({ subject: 'gray wolf', caption: 'A gray wolf in the forest' });

    const decision = guard.evaluate({
      postTitle: 'The Behavior of Red Foxes',
      postContent: 'Red foxes are cunning predators.',
      imageMetadata: metadata,
      similarityScore: 0.7,
    });

    expect(decision.accepted).toBe(false);
    expect(decision.reason).toContain('Subject mismatch');
  });

  it('should combine multiple rejection reasons', () => {
    const metadata = createMetadata({
      subject: 'gray wolf',
      category: 'technology',
      confidence: 0.2,
    });

    const decision = guard.evaluate({
      postTitle: 'Fox Article',
      postContent: 'About red foxes',
      imageMetadata: metadata,
      similarityScore: 0.3,
    });

    expect(decision.accepted).toBe(false);
    const reasons = decision.reason.split('; ');
    expect(reasons.length).toBeGreaterThan(1);
  });

  it('should provide acceptance reason for good match', () => {
    const metadata = createMetadata({});

    const decision = guard.evaluate({
      postTitle: 'Fox Article',
      postContent: 'About red foxes',
      imageMetadata: metadata,
      similarityScore: 0.8,
    });

    expect(decision.accepted).toBe(true);
    expect(decision.reason).toContain('matches');
  });
});
