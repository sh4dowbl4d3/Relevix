import { describe, it, expect } from 'vitest';

describe('Review Workflow', () => {
  describe('Approval', () => {
    it('should approve suggestion', () => {
      const suggestion = {
        id: 'sug-1',
        status: 'pending',
      };

      const approved = {
        ...suggestion,
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: 'api-user',
      };

      expect(approved.status).toBe('approved');
      expect(approved.reviewedAt).toBeInstanceOf(Date);
      expect(approved.reviewedBy).toBe('api-user');
    });

    it('should add review notes', () => {
      const notes = 'Good match for the article';

      const suggestion = {
        id: 'sug-1',
        status: 'approved',
        reviewNotes: notes,
      };

      expect(suggestion.reviewNotes).toBe(notes);
    });
  });

  describe('Rejection', () => {
    it('should reject suggestion', () => {
      const suggestion = {
        id: 'sug-1',
        status: 'pending',
      };

      const rejected = {
        ...suggestion,
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: 'api-user',
        reviewNotes: 'Subject mismatch',
      };

      expect(rejected.status).toBe('rejected');
      expect(rejected.reviewedAt).toBeInstanceOf(Date);
      expect(rejected.reviewedBy).toBe('api-user');
      expect(rejected.reviewNotes).toBe('Subject mismatch');
    });

    it('should add rejection reason', () => {
      const reason = 'Subject mismatch: expected fox, detected wolf';

      const suggestion = {
        id: 'sug-1',
        status: 'rejected',
        guardDecision: {
          rejectionReason: reason,
        },
      };

      expect(suggestion.guardDecision.rejectionReason).toBe(reason);
    });
  });

  describe('Inspection', () => {
    it('should inspect suggestion details', () => {
      const suggestion = {
        id: 'sug-1',
        postId: 'post-1',
        imageId: 'img-1',
        similarityScore: 0.85,
        confidenceScore: 0.95,
        status: 'pending',
        guardDecision: {
          accepted: true,
          reason: 'Image matches post content',
          categoryMatch: true,
          subjectSimilarity: 0.8,
          overallConfidence: 0.85,
        },
        post: {
          id: 'post-1',
          title: 'Fox Article',
          content: 'About red foxes...',
        },
        image: {
          id: 'img-1',
          filename: 'red-fox.jpg',
          metadata: {
            subject: 'red fox',
            category: 'animal',
            caption: 'A red fox',
            confidence: 0.95,
          },
        },
      };

      expect(suggestion.post).toBeDefined();
      expect(suggestion.image).toBeDefined();
      expect(suggestion.image.metadata).toBeDefined();
      expect(suggestion.guardDecision).toBeDefined();
    });

    it('should explain why image was selected', () => {
      const guardDecision = {
        accepted: true,
        reason: 'Image matches post content with sufficient confidence',
        categoryMatch: true,
        subjectSimilarity: 0.8,
        overallConfidence: 0.85,
      };

      expect(guardDecision.reason).toContain('matches');
      expect(guardDecision.categoryMatch).toBe(true);
      expect(guardDecision.overallConfidence).toBeGreaterThan(0.6);
    });

    it('should explain why image was rejected', () => {
      const guardDecision = {
        accepted: false,
        reason: 'Subject mismatch: expected fox, detected wolf',
        categoryMatch: true,
        subjectSimilarity: 0.2,
        overallConfidence: 0.45,
        rejectionReason: 'Subject mismatch: expected fox, detected wolf',
      };

      expect(guardDecision.accepted).toBe(false);
      expect(guardDecision.reason).toContain('mismatch');
      expect(guardDecision.rejectionReason).toBeDefined();
    });
  });
});
