import { z } from 'zod';

export const ImageMetadataSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200),
  category: z.string().min(1, 'Category is required').max(100),
  attributes: z.array(z.string()).min(1, 'At least one attribute is required'),
  caption: z.string().min(1, 'Caption is required').max(500),
  confidence: z.number().min(0, 'Confidence must be >= 0').max(1, 'Confidence must be <= 1'),
});

export type ValidatedImageMetadata = z.infer<typeof ImageMetadataSchema>;

export const VisionOutputSchema = z.object({
  subject: z.string(),
  category: z.string(),
  attributes: z.array(z.string()),
  caption: z.string(),
  confidence: z.number(),
}).strict();

export function validateVisionOutput(raw: unknown): ValidatedImageMetadata {
  const result = VisionOutputSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid vision output: ${result.error.message}`);
  }
  const validated = ImageMetadataSchema.safeParse(result.data);
  if (!validated.success) {
    throw new Error(`Vision output failed validation: ${validated.error.message}`);
  }
  return validated.data;
}
