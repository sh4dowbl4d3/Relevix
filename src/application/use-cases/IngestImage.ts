import { ImageRepository } from '../../domain/repositories/ImageRepository.js';
import { JobRepository } from '../../domain/repositories/JobRepository.js';
import { VisionProvider } from '../../infrastructure/ai/VisionProvider.js';
import { Image, ImageMetadata } from '../../domain/entities/Image.js';
import { validateVisionOutput, ValidatedImageMetadata } from '../../api/schemas/imageMetadata.js';

export interface IngestImageInput {
  filename: string;
  filePath: string;
  width?: number;
  height?: number;
  mimeType?: string;
}

export interface IngestImageResult {
  image: Image;
  metadata: ImageMetadata;
  jobId: string;
}

export class IngestImage {
  constructor(
    private imageRepo: ImageRepository,
    private jobRepo: JobRepository,
    private visionProvider: VisionProvider
  ) {}

  async execute(input: IngestImageInput): Promise<IngestImageResult> {
    const existingImage = await this.imageRepo.findByFilename(input.filename);
    if (existingImage) {
      const existingMetadata = await this.imageRepo.getMetadata(existingImage.id);
      if (existingMetadata) {
        return {
          image: existingImage,
          metadata: existingMetadata,
          jobId: '',
        };
      }
    }

    const image = await this.imageRepo.create({
      filename: input.filename,
      originalPath: input.filePath,
      width: input.width,
      height: input.height,
      mimeType: input.mimeType,
    });

    const job = await this.jobRepo.create({
      type: 'vision',
      status: 'pending',
      entityType: 'image',
      entityId: image.id,
      attempts: 0,
      maxAttempts: 3,
    });

    try {
      await this.jobRepo.markProcessing(job.id);

      const visionResult = await this.visionProvider.analyzeImage(input.filePath);
      const validatedMetadata = validateVisionOutput(visionResult);

      const metadata = await this.imageRepo.saveMetadata({
        imageId: image.id,
        subject: validatedMetadata.subject,
        category: validatedMetadata.category,
        attributes: validatedMetadata.attributes,
        caption: validatedMetadata.caption,
        confidence: validatedMetadata.confidence,
        rawVisionOutput: JSON.stringify(visionResult),
        visionModel: this.visionProvider.getModelName(),
        processedAt: new Date(),
      });

      await this.jobRepo.markCompleted(job.id);

      await this.jobRepo.recordCost({
        jobId: job.id,
        operationType: 'vision',
        provider: this.visionProvider.getProviderName(),
        model: this.visionProvider.getModelName(),
        entityType: 'image',
        entityId: image.id,
        estimatedCostUsd: this.estimateVisionCost(),
        success: true,
      });

      return { image, metadata, jobId: job.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.jobRepo.markFailed(job.id, errorMessage);

      await this.jobRepo.recordCost({
        jobId: job.id,
        operationType: 'vision',
        provider: this.visionProvider.getProviderName(),
        model: this.visionProvider.getModelName(),
        entityType: 'image',
        entityId: image.id,
        estimatedCostUsd: 0,
        success: false,
        errorMessage,
      });

      throw error;
    }
  }

  private estimateVisionCost(): number {
    const provider = this.visionProvider.getProviderName();
    if (provider === 'gemini') {
      return 0.001;
    }
    return 0;
  }
}
