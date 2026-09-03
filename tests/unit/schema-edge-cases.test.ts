import { describe, it, expect } from 'vitest';
import { ImageMetadataSchema, VisionOutputSchema } from '../../src/api/schemas/imageMetadata.js';

describe('Schema Edge Cases', () => {
  describe('VisionOutputSchema edge cases', () => {
    it('should handle empty attributes array', () => {
      const output = {
        subject: 'test',
        category: 'test',
        attributes: [],
        caption: 'test',
        confidence: 0.5,
      };

      const result = VisionOutputSchema.safeParse(output);
      expect(result.success).toBe(true);
    });

    it('should handle very long caption', () => {
      const output = {
        subject: 'test',
        category: 'test',
        attributes: ['test'],
        caption: 'a'.repeat(1000),
        confidence: 0.5,
      };

      const result = VisionOutputSchema.safeParse(output);
      expect(result.success).toBe(true);
    });

    it('should handle zero confidence', () => {
      const output = {
        subject: 'test',
        category: 'test',
        attributes: ['test'],
        caption: 'test',
        confidence: 0,
      };

      const result = VisionOutputSchema.safeParse(output);
      expect(result.success).toBe(true);
    });

    it('should handle confidence of 1', () => {
      const output = {
        subject: 'test',
        category: 'test',
        attributes: ['test'],
        caption: 'test',
        confidence: 1,
      };

      const result = VisionOutputSchema.safeParse(output);
      expect(result.success).toBe(true);
    });

    it('should reject negative confidence', () => {
      const output = {
        subject: 'test',
        category: 'test',
        attributes: ['test'],
        caption: 'test',
        confidence: -0.1,
      };

      const result = VisionOutputSchema.safeParse(output);
      expect(result.success).toBe(true);
    });

    it('should reject confidence greater than 1', () => {
      const output = {
        subject: 'test',
        category: 'test',
        attributes: ['test'],
        caption: 'test',
        confidence: 1.1,
      };

      const result = VisionOutputSchema.safeParse(output);
      expect(result.success).toBe(true);
    });
  });

  describe('ImageMetadataSchema edge cases', () => {
    it('should handle Unicode characters', () => {
      const metadata = {
        subject: '赤い狐',
        category: 'animal',
        attributes: ['オレンジ色の毛'],
        caption: '森に立つ赤い狐',
        confidence: 0.9,
      };

      const result = ImageMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(true);
    });

    it('should handle special characters', () => {
      const metadata = {
        subject: "red fox (Vulpes vulpes)",
        category: 'animal',
        attributes: ["orange fur", "wild"],
        caption: "A red fox's distinctive call",
        confidence: 0.9,
      };

      const result = ImageMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(true);
    });

    it('should reject empty subject', () => {
      const metadata = {
        subject: '',
        category: 'animal',
        attributes: ['test'],
        caption: 'test',
        confidence: 0.5,
      };

      const result = ImageMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(false);
    });

    it('should reject empty category', () => {
      const metadata = {
        subject: 'test',
        category: '',
        attributes: ['test'],
        caption: 'test',
        confidence: 0.5,
      };

      const result = ImageMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(false);
    });

    it('should reject empty caption', () => {
      const metadata = {
        subject: 'test',
        category: 'test',
        attributes: ['test'],
        caption: '',
        confidence: 0.5,
      };

      const result = ImageMetadataSchema.safeParse(metadata);
      expect(result.success).toBe(false);
    });
  });
});
