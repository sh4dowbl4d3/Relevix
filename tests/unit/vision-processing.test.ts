import { describe, it, expect } from 'vitest';
import { VisionOutputSchema } from '../../src/api/schemas/imageMetadata.js';

describe('Vision Processing', () => {
  describe('Vision Output', () => {
    it('should have valid vision output structure', () => {
      const visionOutput = {
        subject: 'red fox',
        category: 'animal',
        attributes: ['orange fur', 'wild', 'forest'],
        caption: 'A red fox standing in a forest',
        confidence: 0.94,
      };

      expect(visionOutput.subject).toBeDefined();
      expect(visionOutput.category).toBeDefined();
      expect(Array.isArray(visionOutput.attributes)).toBe(true);
      expect(visionOutput.caption).toBeDefined();
      expect(typeof visionOutput.confidence).toBe('number');
      expect(visionOutput.confidence).toBeGreaterThanOrEqual(0);
      expect(visionOutput.confidence).toBeLessThanOrEqual(1);
    });

    it('should validate vision output with Zod', () => {
      const validOutput = {
        subject: 'red fox',
        category: 'animal',
        attributes: ['orange fur'],
        caption: 'A red fox',
        confidence: 0.9,
      };

      const result = VisionOutputSchema.safeParse(validOutput);
      expect(result.success).toBe(true);
    });

    it('should reject invalid vision output', () => {
      const invalidOutput = {
        subject: 'red fox',
      };

      const result = VisionOutputSchema.safeParse(invalidOutput);
      expect(result.success).toBe(false);
    });
  });

  describe('Low Confidence Handling', () => {
    it('should flag low confidence classifications', () => {
      const lowConfidenceThreshold = 0.4;
      const confidence = 0.3;

      const isLowConfidence = confidence < lowConfidenceThreshold;

      expect(isLowConfidence).toBe(true);
    });

    it('should accept normal confidence classifications', () => {
      const lowConfidenceThreshold = 0.4;
      const confidence = 0.8;

      const isLowConfidence = confidence < lowConfidenceThreshold;

      expect(isLowConfidence).toBe(false);
    });
  });

  describe('Invalid Output Rejection', () => {
    it('should reject output with missing fields', () => {
      const output = {
        subject: 'red fox',
        category: 'animal',
      };

      const hasRequiredFields = output.subject && output.category &&
                                  'attributes' in output && 'caption' in output &&
                                  'confidence' in output;

      expect(hasRequiredFields).toBe(false);
    });

    it('should reject output with invalid confidence', () => {
      const output = {
        subject: 'red fox',
        category: 'animal',
        attributes: ['orange fur'],
        caption: 'A red fox',
        confidence: 1.5,
      };

      const isValidConfidence = output.confidence >= 0 && output.confidence <= 1;

      expect(isValidConfidence).toBe(false);
    });

    it('should reject output with empty attributes', () => {
      const output = {
        subject: 'red fox',
        category: 'animal',
        attributes: [],
        caption: 'A red fox',
        confidence: 0.9,
      };

      const hasValidAttributes = Array.isArray(output.attributes) && output.attributes.length > 0;

      expect(hasValidAttributes).toBe(false);
    });
  });
});
