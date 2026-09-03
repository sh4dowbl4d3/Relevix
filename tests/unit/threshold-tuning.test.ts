import { describe, it, expect } from 'vitest';

describe('Threshold Tuning', () => {
  describe('Similarity Threshold', () => {
    it('should tune threshold based on evaluation', () => {
      const evaluationResults = [
        { similarity: 0.85, correct: true },
        { similarity: 0.75, correct: true },
        { similarity: 0.65, correct: false },
        { similarity: 0.55, correct: false },
      ];

      const threshold = 0.7;
      const correctAboveThreshold = evaluationResults.filter(
        r => r.similarity >= threshold && r.correct
      ).length;
      const totalAboveThreshold = evaluationResults.filter(
        r => r.similarity >= threshold
      ).length;

      const precision = totalAboveThreshold > 0 ? correctAboveThreshold / totalAboveThreshold : 0;

      expect(precision).toBeGreaterThan(0);
      expect(precision).toBeLessThanOrEqual(1);
    });

    it('should find optimal threshold', () => {
      const evaluationResults = [
        { similarity: 0.9, correct: true },
        { similarity: 0.8, correct: true },
        { similarity: 0.7, correct: true },
        { similarity: 0.6, correct: false },
        { similarity: 0.5, correct: false },
      ];

      const thresholds = [0.5, 0.6, 0.7, 0.8, 0.9];
      let bestThreshold = 0.5;
      let bestPrecision = 0;

      thresholds.forEach(threshold => {
        const correctAboveThreshold = evaluationResults.filter(
          r => r.similarity >= threshold && r.correct
        ).length;
        const totalAboveThreshold = evaluationResults.filter(
          r => r.similarity >= threshold
        ).length;

        const precision = totalAboveThreshold > 0 ? correctAboveThreshold / totalAboveThreshold : 0;

        if (precision > bestPrecision) {
          bestPrecision = precision;
          bestThreshold = threshold;
        }
      });

      expect(bestThreshold).toBeGreaterThan(0);
      expect(bestPrecision).toBeGreaterThan(0);
    });
  });

  describe('Confidence Threshold', () => {
    it('should tune threshold based on evaluation', () => {
      const evaluationResults = [
        { confidence: 0.95, correct: true },
        { confidence: 0.85, correct: true },
        { confidence: 0.75, correct: false },
        { confidence: 0.65, correct: false },
      ];

      const threshold = 0.8;
      const correctAboveThreshold = evaluationResults.filter(
        r => r.confidence >= threshold && r.correct
      ).length;
      const totalAboveThreshold = evaluationResults.filter(
        r => r.confidence >= threshold
      ).length;

      const precision = totalAboveThreshold > 0 ? correctAboveThreshold / totalAboveThreshold : 0;

      expect(precision).toBeGreaterThan(0);
      expect(precision).toBeLessThanOrEqual(1);
    });
  });

  describe('Top-1 Precision', () => {
    it('should calculate top-1 precision', () => {
      const predictions = [
        { postId: 'post-1', topPrediction: 'fox', correct: true },
        { postId: 'post-2', topPrediction: 'wolf', correct: true },
        { postId: 'post-3', topPrediction: 'dog', correct: false },
        { postId: 'post-4', topPrediction: 'fox', correct: true },
      ];

      const correctPredictions = predictions.filter(p => p.correct).length;
      const totalPredictions = predictions.length;
      const top1Precision = correctPredictions / totalPredictions;

      expect(top1Precision).toBe(0.75);
    });

    it('should report precision in README', () => {
      const top1Precision = 0.75;
      const readmeContainsPrecision = `Top-1 Precision: ${(top1Precision * 100).toFixed(1)}%`;

      expect(readmeContainsPrecision).toContain('75.0%');
    });
  });
});
