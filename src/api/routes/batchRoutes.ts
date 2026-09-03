import { Router } from 'express';
import { BatchController } from '../controllers/BatchController.js';

export function createBatchRoutes(controller: BatchController): Router {
  const router = Router();

  router.post('/batch/process', (req, res) => controller.startBatchProcess(req, res));
  router.get('/jobs/:jobId', (req, res) => controller.getJobStatus(req, res));
  router.get('/budget', (req, res) => controller.getBudgetStatus(req, res));
  router.get('/costs', (req, res) => controller.getCostTracking(req, res));

  return router;
}
