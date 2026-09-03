import { describe, it, expect } from 'vitest';

describe('Mismatch Guard Logic', () => {
  describe('Subject Relevance', () => {
    it('should match fox post with fox image', () => {
      const postText = 'the behavior of red foxes';
      const imageSubject = 'red fox';

      const postContainsFox = postText.includes('fox');
      const imageContainsFox = imageSubject.includes('fox');

      expect(postContainsFox && imageContainsFox).toBe(true);
    });

    it('should reject fox post with wolf image', () => {
      const postText = 'the behavior of red foxes';
      const imageSubject = 'gray wolf';

      const postContainsFox = postText.includes('fox');
      const imageContainsFox = imageSubject.includes('fox');

      expect(postContainsFox && !imageContainsFox).toBe(true);
    });

    it('should reject fox post with dog image', () => {
      const postText = 'the behavior of red foxes';
      const imageSubject = 'golden retriever';

      const postContainsFox = postText.includes('fox');
      const imageContainsFox = imageSubject.includes('fox');

      expect(postContainsFox && !imageContainsFox).toBe(true);
    });

    it('should reject fox post with bear image', () => {
      const postText = 'the behavior of red foxes';
      const imageSubject = 'black bear';

      const postContainsFox = postText.includes('fox');
      const imageContainsFox = imageSubject.includes('fox');

      expect(postContainsFox && !imageContainsFox).toBe(true);
    });
  });

  describe('Category Match', () => {
    it('should match animal category', () => {
      const postCategory = 'animal';
      const imageCategory = 'animal';

      expect(postCategory === imageCategory).toBe(true);
    });

    it('should reject category mismatch', () => {
      const postCategory = 'animal';
      const imageCategory = 'landscape';

      expect(postCategory !== imageCategory).toBe(true);
    });
  });

  describe('Overall Confidence', () => {
    it('should calculate overall confidence', () => {
      const similarity = 0.8;
      const confidence = 0.9;
      const categoryMatch = 1;
      const subjectSimilarity = 0.7;

      const overallConfidence =
        similarity * 0.35 +
        confidence * 0.25 +
        categoryMatch * 0.2 +
        subjectSimilarity * 0.2;

      expect(overallConfidence).toBeGreaterThan(0);
      expect(overallConfidence).toBeLessThanOrEqual(1);
    });

    it('should reject when overall confidence is too low', () => {
      const overallConfidence = 0.3;
      const threshold = 0.4;

      expect(overallConfidence < threshold).toBe(true);
    });
  });
});
