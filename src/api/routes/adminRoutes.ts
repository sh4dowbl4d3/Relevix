import { Router, Request, Response } from 'express';
import { PostgresSuggestionRepository } from '../../infrastructure/repositories/PostgresSuggestionRepository.js';

export function createAdminRoutes(suggestionRepo: PostgresSuggestionRepository): Router {
  const router = Router();

  router.get('/admin/suggestions', async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string;
      let suggestions;

      if (status === 'pending' || status === 'approved' || status === 'rejected') {
        suggestions = await suggestionRepo.findByStatus(status);
      } else {
        suggestions = await suggestionRepo.findByStatus('pending');
      }

      res.json({
        success: true,
        data: suggestions,
        meta: {
          total: suggestions.length,
          status: status || 'pending',
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch suggestions',
        },
      });
    }
  });

  router.get('/admin/suggestions/:id', async (req: Request, res: Response) => {
    try {
      const suggestion = await suggestionRepo.findById(req.params.id);

      if (!suggestion) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Suggestion not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: suggestion,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch suggestion',
        },
      });
    }
  });

  return router;
}
