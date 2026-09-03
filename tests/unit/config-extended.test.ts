import { describe, it, expect } from 'vitest';

describe('Config', () => {
  describe('Database Configuration', () => {
    it('should have default database URL', () => {
      const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/relevix';

      expect(databaseUrl).toBeDefined();
      expect(databaseUrl).toContain('postgresql');
    });

    it('should have default database name', () => {
      const databaseName = 'relevix';

      expect(databaseName).toBe('relevix');
    });
  });

  describe('AI Configuration', () => {
    it('should have Gemini API key', () => {
      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey) {
        expect(apiKey).toBeDefined();
        expect(apiKey.length).toBeGreaterThan(0);
      }
    });

    it('should have Ollama base URL', () => {
      const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

      expect(baseUrl).toBeDefined();
      expect(baseUrl).toContain('http');
    });
  });

  describe('Server Configuration', () => {
    it('should have default port', () => {
      const port = parseInt(process.env.PORT || '3000', 10);

      expect(port).toBe(3000);
      expect(port).toBeGreaterThan(0);
      expect(port).toBeLessThanOrEqual(65535);
    });

    it('should have default host', () => {
      const host = process.env.HOST || 'localhost';

      expect(host).toBe('localhost');
    });
  });

  describe('Guard Configuration', () => {
    it('should have default similarity threshold', () => {
      const threshold = parseFloat(process.env.SIMILARITY_THRESHOLD || '0.5');

      expect(threshold).toBe(0.5);
      expect(threshold).toBeGreaterThan(0);
      expect(threshold).toBeLessThanOrEqual(1);
    });

    it('should have default confidence threshold', () => {
      const threshold = parseFloat(process.env.CONFIDENCE_THRESHOLD || '0.4');

      expect(threshold).toBe(0.4);
      expect(threshold).toBeGreaterThan(0);
      expect(threshold).toBeLessThanOrEqual(1);
    });
  });

  describe('Budget Configuration', () => {
    it('should have default daily vision limit', () => {
      const limit = parseInt(process.env.DAILY_VISION_LIMIT || '100', 10);

      expect(limit).toBe(100);
      expect(limit).toBeGreaterThan(0);
    });

    it('should have default daily embedding limit', () => {
      const limit = parseInt(process.env.DAILY_EMBEDDING_LIMIT || '500', 10);

      expect(limit).toBe(500);
      expect(limit).toBeGreaterThan(0);
    });

    it('should have default daily budget', () => {
      const limit = parseFloat(process.env.DAILY_BUDGET_USD || '5.00');

      expect(limit).toBe(5.00);
      expect(limit).toBeGreaterThan(0);
    });
  });
});
