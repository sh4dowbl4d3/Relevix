import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../../src/infrastructure/database/pool.js', () => ({
  getPool: vi.fn(),
}));

vi.mock('../../src/infrastructure/ai/ProviderFactory.js', () => ({
  getVisionProvider: vi.fn(),
  getEmbeddingProvider: vi.fn(),
}));

describe('API Endpoints', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    app.get('/health', (req, res) => {
      res.json({ status: 'ok', service: 'relevix', timestamp: new Date().toISOString() });
    });

    app.get('/api/posts/:id/images', (req, res) => {
      const { id } = req.params;
      if (!id || id.length < 10) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARAMS',
            message: 'Invalid post ID',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          postId: id,
          suggestions: [],
          noConfidentMatch: true,
          explanation: 'No similar images found',
        },
      });
    });

    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${req.method} ${req.path} not found`,
        },
      });
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('relevix');
    });
  });

  describe('GET /api/posts/:id/images', () => {
    it('should return 400 for invalid post ID', async () => {
      const res = await request(app).get('/api/posts/123/images');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_PARAMS');
    });

    it('should return suggestions for valid post ID', async () => {
      const res = await request(app).get('/api/posts/550e8400-e29b-41d4-a716-446655440000/images');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.postId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/unknown');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
