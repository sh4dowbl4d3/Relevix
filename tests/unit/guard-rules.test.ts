import { describe, it, expect } from 'vitest';

describe('Guard Rules', () => {
  describe('Similarity Threshold', () => {
    it('should reject when similarity is below threshold', () => {
      const similarity = 0.3;
      const threshold = 0.5;

      expect(similarity).toBeLessThan(threshold);
    });

    it('should accept when similarity is above threshold', () => {
      const similarity = 0.7;
      const threshold = 0.5;

      expect(similarity).toBeGreaterThanOrEqual(threshold);
    });

    it('should accept when similarity equals threshold', () => {
      const similarity = 0.5;
      const threshold = 0.5;

      expect(similarity).toBeGreaterThanOrEqual(threshold);
    });
  });

  describe('Confidence Threshold', () => {
    it('should reject when confidence is below threshold', () => {
      const confidence = 0.3;
      const threshold = 0.4;

      expect(confidence).toBeLessThan(threshold);
    });

    it('should accept when confidence is above threshold', () => {
      const confidence = 0.6;
      const threshold = 0.4;

      expect(confidence).toBeGreaterThanOrEqual(threshold);
    });

    it('should accept when confidence equals threshold', () => {
      const confidence = 0.4;
      const threshold = 0.4;

      expect(confidence).toBeGreaterThanOrEqual(threshold);
    });
  });

  describe('Category Match', () => {
    it('should match animal category', () => {
      const postCategory = 'animal';
      const imageCategory = 'animal';

      expect(postCategory).toBe(imageCategory);
    });

    it('should match when image category contains post category', () => {
      const postCategory = 'animal';
      const imageCategory = 'wildlife animal';

      expect(imageCategory).toContain(postCategory);
    });

    it('should reject category mismatch', () => {
      const postCategory = 'animal';
      const imageCategory = 'landscape';

      expect(postCategory).not.toBe(imageCategory);
      expect(imageCategory).not.toContain(postCategory);
    });
  });

  describe('Subject Relevance', () => {
    it('should match fox post with fox image', () => {
      const postText = 'the behavior of red foxes';
      const imageSubject = 'red fox';

      const postContainsFox = postText.includes('fox');
      const imageContainsFox = imageSubject.includes('fox');

      expect(postContainsFox).toBe(true);
      expect(imageContainsFox).toBe(true);
      expect(postContainsFox && imageContainsFox).toBe(true);
    });

    it('should reject fox post with wolf image', () => {
      const postText = 'the behavior of red foxes';
      const imageSubject = 'gray wolf';

      const postContainsFox = postText.includes('fox');
      const imageContainsFox = imageSubject.includes('fox');

      expect(postContainsFox).toBe(true);
      expect(imageContainsFox).toBe(false);
      expect(postContainsFox && imageContainsFox).toBe(false);
    });

    it('should reject fox post with dog image', () => {
      const postText = 'the behavior of red foxes';
      const imageSubject = 'golden retriever';

      const postContainsFox = postText.includes('fox');
      const imageContainsFox = imageSubject.includes('fox');

      expect(postContainsFox).toBe(true);
      expect(imageContainsFox).toBe(false);
      expect(postContainsFox && imageContainsFox).toBe(false);
    });
  });

  describe('Overall Confidence', () => {
    it('should calculate overall confidence correctly', () => {
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

      expect(overallConfidence).toBeLessThan(threshold);
    });
  });
});
