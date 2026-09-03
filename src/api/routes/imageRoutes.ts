import { Router } from 'express';
import { ImageController } from '../controllers/ImageController.js';

export function createImageRoutes(controller: ImageController): Router {
  const router = Router();

  router.get('/posts/:id/images', (req, res) => controller.getImagesForPost(req, res));
  router.get('/suggestions/:suggestionId', (req, res) => controller.getSuggestionDetails(req, res));
  router.post('/suggestions/:suggestionId/approve', (req, res) => controller.approveSuggestion(req, res));
  router.post('/suggestions/:suggestionId/reject', (req, res) => controller.rejectSuggestion(req, res));

  return router;
}
