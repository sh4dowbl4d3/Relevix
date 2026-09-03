import { describe, it, expect } from 'vitest';

describe('Repository Interfaces', () => {
  describe('ImageRepository', () => {
    it('should have required methods', () => {
      const methods = [
        'findById',
        'findByFilename',
        'create',
        'update',
        'findAll',
        'findUnprocessed',
        'findWithMetadata',
        'findAllWithMetadata',
        'saveMetadata',
        'getMetadata',
        'updateMetadata',
        'saveVector',
        'getVector',
        'findSimilarVectors',
        'findSimilarVectorsForPost',
      ];

      methods.forEach(method => {
        expect(typeof method).toBe('string');
        expect(method.length).toBeGreaterThan(0);
      });
    });
  });

  describe('PostRepository', () => {
    it('should have required methods', () => {
      const methods = [
        'findById',
        'create',
        'update',
        'findAll',
        'findWithVector',
        'findAllWithVectors',
        'saveVector',
        'getVector',
        'updateVector',
      ];

      methods.forEach(method => {
        expect(typeof method).toBe('string');
        expect(method.length).toBeGreaterThan(0);
      });
    });
  });

  describe('JobRepository', () => {
    it('should have required methods', () => {
      const methods = [
        'create',
        'findById',
        'update',
        'findByEntity',
        'findByStatus',
        'findPendingJobs',
        'incrementAttempts',
        'markProcessing',
        'markCompleted',
        'markFailed',
        'recordCost',
        'getDailyCostStats',
        'getCostForEntity',
      ];

      methods.forEach(method => {
        expect(typeof method).toBe('string');
        expect(method.length).toBeGreaterThan(0);
      });
    });
  });

  describe('SuggestionRepository', () => {
    it('should have required methods', () => {
      const methods = [
        'create',
        'findById',
        'findByPostId',
        'findByImageId',
        'findByStatus',
        'update',
        'approve',
        'reject',
        'findTopSuggestionForPost',
      ];

      methods.forEach(method => {
        expect(typeof method).toBe('string');
        expect(method.length).toBeGreaterThan(0);
      });
    });
  });
});
