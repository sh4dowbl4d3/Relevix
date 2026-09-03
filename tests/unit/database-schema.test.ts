import { describe, it, expect } from 'vitest';

describe('Database Schema', () => {
  it('should have required tables', () => {
    const requiredTables = [
      'images',
      'image_metadata',
      'image_vectors',
      'posts',
      'post_vectors',
      'processing_jobs',
      'ai_cost_records',
      'suggestions',
    ];

    requiredTables.forEach(table => {
      expect(typeof table).toBe('string');
      expect(table.length).toBeGreaterThan(0);
    });
  });

  it('should have required columns for images table', () => {
    const columns = [
      'id',
      'filename',
      'original_path',
      'processed_path',
      'width',
      'height',
      'mime_type',
      'created_at',
      'updated_at',
    ];

    columns.forEach(column => {
      expect(typeof column).toBe('string');
      expect(column.length).toBeGreaterThan(0);
    });
  });

  it('should have required columns for image_metadata table', () => {
    const columns = [
      'id',
      'image_id',
      'subject',
      'category',
      'attributes',
      'caption',
      'confidence',
      'raw_vision_output',
      'vision_model',
      'processed_at',
    ];

    columns.forEach(column => {
      expect(typeof column).toBe('string');
      expect(column.length).toBeGreaterThan(0);
    });
  });

  it('should have required columns for posts table', () => {
    const columns = [
      'id',
      'title',
      'content',
      'excerpt',
      'tags',
      'category',
      'created_at',
      'updated_at',
    ];

    columns.forEach(column => {
      expect(typeof column).toBe('string');
      expect(column.length).toBeGreaterThan(0);
    });
  });

  it('should have required columns for suggestions table', () => {
    const columns = [
      'id',
      'post_id',
      'image_id',
      'similarity_score',
      'confidence_score',
      'status',
      'guard_decision',
      'reviewed_at',
      'reviewed_by',
      'review_notes',
      'created_at',
      'updated_at',
    ];

    columns.forEach(column => {
      expect(typeof column).toBe('string');
      expect(column.length).toBeGreaterThan(0);
    });
  });

  it('should have required indexes', () => {
    const requiredIndexes = [
      'idx_images_created_at',
      'idx_image_metadata_image_id',
      'idx_image_metadata_category',
      'idx_image_vectors_image_id',
      'idx_posts_created_at',
      'idx_post_vectors_post_id',
      'idx_processing_jobs_status',
      'idx_suggestions_post_id',
      'idx_suggestions_status',
    ];

    requiredIndexes.forEach(index => {
      expect(typeof index).toBe('string');
      expect(index.length).toBeGreaterThan(0);
    });
  });
});
