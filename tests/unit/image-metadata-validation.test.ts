import { describe, it, expect } from 'vitest';
import { validateVisionOutput, ImageMetadataSchema, VisionOutputSchema } from '../../src/api/schemas/imageMetadata.js';

describe('Image Metadata Validation', () => {
  describe('VisionOutputSchema', () => {
    it('should accept valid vision output', () => {
      const validOutput = {
        subject: 'red fox',
        category: 'animal',
        attributes: ['orange fur', 'wild'],
        caption: 'A red fox in the forest',
        confidence: 0.9,
      };

      const result = VisionOutputSchema.safeParse(validOutput);
      expect(result.success).toBe(true);
    });

    it('should reject output with missing fields', () => {
      const invalidOutput = {
        subject: 'red fox',
        category: 'animal',
      };

      const result = VisionOutputSchema.safeParse(invalidOutput);
      expect(result.success).toBe(false);
    });

    it('should reject output with extra fields', () => {
      const invalidOutput = {
        subject: 'red fox',
        category: 'animal',
        attributes: ['orange fur'],
        caption: 'A red fox',
        confidence: 0.9,
        extraField: 'not allowed',
      };

      const result = VisionOutputSchema.safeParse(invalidOutput);
      expect(result.success).toBe(false);
    });
  });

  describe('ImageMetadataSchema', () => {
    it('should accept valid metadata', () => {
      const validMetadata = {
        subject: 'red fox',
        category: 'animal',
        attributes: ['orange fur', 'wild'],
        caption: 'A red fox in the forest',
        confidence: 0.9,
      };

      const result = ImageMetadataSchema.safeParse(validMetadata);
      expect(result.success).toBe(true);
    });

    it('should reject empty subject', () => {
      const invalidMetadata = {
        subject: '',
        category: 'animal',
        attributes: ['orange fur'],
        caption: 'A red fox',
        confidence: 0.9,
      };

      const result = ImageMetadataSchema.safeParse(invalidMetadata);
      expect(result.success).toBe(false);
    });

    it('should reject confidence outside 0-1 range', () => {
      const invalidMetadata = {
        subject: 'red fox',
        category: 'animal',
        attributes: ['orange fur'],
        caption: 'A red fox',
        confidence: 1.5,
      };

      const result = ImageMetadataSchema.safeParse(invalidMetadata);
      expect(result.success).toBe(false);
    });

    it('should reject empty attributes array', () => {
      const invalidMetadata = {
        subject: 'red fox',
        category: 'animal',
        attributes: [],
        caption: 'A red fox',
        confidence: 0.9,
      };

      const result = ImageMetadataSchema.safeParse(invalidMetadata);
      expect(result.success).toBe(false);
    });
  });

  describe('validateVisionOutput', () => {
    it('should validate and return clean metadata', () => {
      const rawOutput = {
        subject: 'red fox',
        category: 'animal',
        attributes: ['orange fur', 'wild'],
        caption: 'A red fox in the forest',
        confidence: 0.9,
      };

      const result = validateVisionOutput(rawOutput);
      expect(result.subject).toBe('red fox');
      expect(result.category).toBe('animal');
      expect(result.confidence).toBe(0.9);
    });

    it('should throw on invalid output', () => {
      const invalidOutput = {
        subject: 'red fox',
        category: 'animal',
      };

      expect(() => validateVisionOutput(invalidOutput)).toThrow();
    });

    it('should clamp confidence to valid range', () => {
      const outputWithHighConfidence = {
        subject: 'red fox',
        category: 'animal',
        attributes: ['orange fur'],
        caption: 'A red fox',
        confidence: 1.5,
      };

      expect(() => validateVisionOutput(outputWithHighConfidence)).toThrow();
    });
  });
});
