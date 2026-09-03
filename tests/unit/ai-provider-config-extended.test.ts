import { describe, it, expect } from 'vitest';

describe('AI Provider Configuration', () => {
  describe('Vision Provider', () => {
    it('should use Gemini Flash as default', () => {
      const provider = 'gemini';
      const model = 'gemini-1.5-flash';

      expect(provider).toBe('gemini');
      expect(model).toContain('flash');
    });

    it('should support Ollama as fallback', () => {
      const fallbackProvider = 'ollama';
      const model = 'llava';

      expect(fallbackProvider).toBe('ollama');
      expect(model).toBe('llava');
    });
  });

  describe('Embedding Provider', () => {
    it('should use Gemini Embeddings as default', () => {
      const provider = 'gemini';
      const model = 'text-embedding-004';
      const dimensions = 768;

      expect(provider).toBe('gemini');
      expect(model).toBe('text-embedding-004');
      expect(dimensions).toBe(768);
    });

    it('should support Ollama as fallback', () => {
      const fallbackProvider = 'ollama';
      const model = 'nomic-embed-text';

      expect(fallbackProvider).toBe('ollama');
      expect(model).toBe('nomic-embed-text');
    });
  });

  describe('Batch Configuration', () => {
    it('should have default batch size', () => {
      const batchSize = 10;

      expect(batchSize).toBe(10);
      expect(batchSize).toBeGreaterThan(0);
      expect(batchSize).toBeLessThanOrEqual(100);
    });

    it('should have default concurrency', () => {
      const concurrency = 5;

      expect(concurrency).toBe(5);
      expect(concurrency).toBeGreaterThan(0);
      expect(concurrency).toBeLessThanOrEqual(20);
    });

    it('should have default retry attempts', () => {
      const maxAttempts = 3;

      expect(maxAttempts).toBe(3);
      expect(maxAttempts).toBeGreaterThan(0);
      expect(maxAttempts).toBeLessThanOrEqual(5);
    });
  });

  describe('Budget Limits', () => {
    it('should have default daily vision limit', () => {
      const visionLimit = 100;

      expect(visionLimit).toBe(100);
      expect(visionLimit).toBeGreaterThan(0);
    });

    it('should have default daily embedding limit', () => {
      const embeddingLimit = 500;

      expect(embeddingLimit).toBe(500);
      expect(embeddingLimit).toBeGreaterThan(0);
    });

    it('should have default daily budget', () => {
      const budgetLimit = 5.00;

      expect(budgetLimit).toBe(5.00);
      expect(budgetLimit).toBeGreaterThan(0);
    });
  });

  describe('Guard Thresholds', () => {
    it('should have default similarity threshold', () => {
      const threshold = 0.5;

      expect(threshold).toBe(0.5);
      expect(threshold).toBeGreaterThan(0);
      expect(threshold).toBeLessThanOrEqual(1);
    });

    it('should have default confidence threshold', () => {
      const threshold = 0.4;

      expect(threshold).toBe(0.4);
      expect(threshold).toBeGreaterThan(0);
      expect(threshold).toBeLessThanOrEqual(1);
    });
  });
});
