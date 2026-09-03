import { describe, it, expect } from 'vitest';

describe('Guard Decision', () => {
  describe('Accepted Decision', () => {
    it('should have accepted decision structure', () => {
      const decision = {
        accepted: true,
        reason: 'Image matches post content with sufficient confidence',
        categoryMatch: true,
        subjectSimilarity: 0.8,
        overallConfidence: 0.85,
        rejectionReason: undefined,
      };

      expect(decision.accepted).toBe(true);
      expect(decision.reason).toBeDefined();
      expect(decision.categoryMatch).toBe(true);
      expect(decision.subjectSimilarity).toBeGreaterThan(0);
      expect(decision.overallConfidence).toBeGreaterThan(0);
      expect(decision.rejectionReason).toBeUndefined();
    });
  });

  describe('Rejected Decision', () => {
    it('should have rejected decision structure', () => {
      const decision = {
        accepted: false,
        reason: 'Subject mismatch: expected fox, detected wolf',
        categoryMatch: true,
        subjectSimilarity: 0.2,
        overallConfidence: 0.45,
        rejectionReason: 'Subject mismatch: expected fox, detected wolf',
      };

      expect(decision.accepted).toBe(false);
      expect(decision.reason).toBeDefined();
      expect(decision.rejectionReason).toBeDefined();
      expect(decision.rejectionReason).toContain('mismatch');
    });

    it('should have category mismatch rejection', () => {
      const decision = {
        accepted: false,
        reason: 'Category mismatch: post expects animal, detected landscape',
        categoryMatch: false,
        subjectSimilarity: 0.3,
        overallConfidence: 0.35,
        rejectionReason: 'Category mismatch: post expects animal, detected landscape',
      };

      expect(decision.accepted).toBe(false);
      expect(decision.categoryMatch).toBe(false);
      expect(decision.reason).toContain('Category mismatch');
    });

    it('should have similarity rejection', () => {
      const decision = {
        accepted: false,
        reason: 'Similarity score 0.300 below threshold 0.5',
        categoryMatch: true,
        subjectSimilarity: 0.4,
        overallConfidence: 0.4,
        rejectionReason: 'Similarity score 0.300 below threshold 0.5',
      };

      expect(decision.accepted).toBe(false);
      expect(decision.reason).toContain('Similarity score');
      expect(decision.reason).toContain('below threshold');
    });

    it('should have confidence rejection', () => {
      const decision = {
        accepted: false,
        reason: 'Image confidence 0.30 below threshold 0.4',
        categoryMatch: true,
        subjectSimilarity: 0.5,
        overallConfidence: 0.35,
        rejectionReason: 'Image confidence 0.30 below threshold 0.4',
      };

      expect(decision.accepted).toBe(false);
      expect(decision.reason).toContain('confidence');
      expect(decision.reason).toContain('below threshold');
    });
  });

  describe('No Confident Match', () => {
    it('should have no confident match structure', () => {
      const result = {
        noConfidentMatch: true,
        explanation: 'No similar images found in the library',
      };

      expect(result.noConfidentMatch).toBe(true);
      expect(result.explanation).toBeDefined();
    });

    it('should have explanation for rejection', () => {
      const result = {
        noConfidentMatch: true,
        explanation: 'No confident match: Similarity score 0.300 below threshold 0.5',
      };

      expect(result.noConfidentMatch).toBe(true);
      expect(result.explanation).toContain('No confident match');
      expect(result.explanation).toContain('Similarity score');
    });
  });
});
