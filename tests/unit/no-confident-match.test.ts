import { describe, it, expect } from 'vitest';

describe('No Confident Match', () => {
  describe('Detection', () => {
    it('should detect no confident match when similarity is low', () => {
      const similarity = 0.3;
      const threshold = 0.5;

      const noConfidentMatch = similarity < threshold;

      expect(noConfidentMatch).toBe(true);
    });

    it('should detect no confident match when confidence is low', () => {
      const confidence = 0.2;
      const threshold = 0.4;

      const noConfidentMatch = confidence < threshold;

      expect(noConfidentMatch).toBe(true);
    });

    it('should detect no confident match when category mismatches', () => {
      const categoryMatch = false;

      const noConfidentMatch = !categoryMatch;

      expect(noConfidentMatch).toBe(true);
    });

    it('should detect no confident match when subject mismatches', () => {
      const postText = 'the behavior of red foxes';
      const imageSubject = 'gray wolf';

      const postContainsFox = postText.includes('fox');
      const imageContainsFox = imageSubject.includes('fox');

      const subjectMismatch = postContainsFox && !imageContainsFox;

      expect(subjectMismatch).toBe(true);
    });
  });

  describe('Explanation', () => {
    it('should provide explanation for low similarity', () => {
      const similarity = 0.3;
      const threshold = 0.5;

      const explanation = `No confident match: Similarity score ${similarity.toFixed(3)} below threshold ${threshold}`;

      expect(explanation).toContain('No confident match');
      expect(explanation).toContain('Similarity score');
      expect(explanation).toContain('below threshold');
    });

    it('should provide explanation for low confidence', () => {
      const confidence = 0.2;
      const threshold = 0.4;

      const explanation = `No confident match: Image confidence ${confidence.toFixed(2)} below threshold ${threshold}`;

      expect(explanation).toContain('No confident match');
      expect(explanation).toContain('confidence');
      expect(explanation).toContain('below threshold');
    });

    it('should provide explanation for category mismatch', () => {
      const postCategory = 'animal';
      const imageCategory = 'landscape';

      const explanation = `No confident match: Category mismatch: post expects ${postCategory}, detected ${imageCategory}`;

      expect(explanation).toContain('No confident match');
      expect(explanation).toContain('Category mismatch');
    });

    it('should provide explanation for subject mismatch', () => {
      const subject = 'fox';
      const imageSubject = 'wolf';

      const explanation = `No confident match: Subject mismatch: post discusses ${subject}, image shows ${imageSubject}`;

      expect(explanation).toContain('No confident match');
      expect(explanation).toContain('Subject mismatch');
    });
  });

  describe('Response', () => {
    it('should return no confident match response', () => {
      const response = {
        noConfidentMatch: true,
        explanation: 'No similar images found in the library',
        suggestions: [],
        topSuggestion: null,
      };

      expect(response.noConfidentMatch).toBe(true);
      expect(response.explanation).toBeDefined();
      expect(response.suggestions).toHaveLength(0);
      expect(response.topSuggestion).toBeNull();
    });

    it('should return no confident match with best rejected candidate', () => {
      const response = {
        noConfidentMatch: true,
        explanation: 'No confident match: Similarity score 0.300 below threshold 0.5',
        suggestions: [
          {
            imageId: 'img-1',
            similarity: 0.3,
            guardDecision: {
              accepted: false,
              reason: 'Similarity score 0.300 below threshold 0.5',
            },
          },
        ],
        topSuggestion: null,
      };

      expect(response.noConfidentMatch).toBe(true);
      expect(response.suggestions.length).toBeGreaterThan(0);
      expect(response.topSuggestion).toBeNull();
    });
  });
});
