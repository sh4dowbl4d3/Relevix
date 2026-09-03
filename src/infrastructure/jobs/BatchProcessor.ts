import { ImageRepository } from '../../domain/repositories/ImageRepository.js';
import { PostRepository } from '../../domain/repositories/PostRepository.js';
import { JobRepository } from '../../domain/repositories/JobRepository.js';
import { VisionProvider } from '../ai/VisionProvider.js';
import { EmbeddingProvider } from '../ai/EmbeddingProvider.js';
import { getConfig } from '../../config/index.js';
import { validateVisionOutput } from '../../api/schemas/imageMetadata.js';
import fs from 'fs';

export interface BatchJobProgress {
  jobId: string;
  type: string;
  entityType: string;
  entityId: string;
  status: 'started' | 'processing' | 'completed' | 'failed' | 'retrying';
  attempts: number;
  error?: string;
}

export interface BatchProcessResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: string[];
}

export class BatchProcessor {
  private config = getConfig();

  constructor(
    private imageRepo: ImageRepository,
    private postRepo: PostRepository,
    private jobRepo: JobRepository,
    private visionProvider: VisionProvider,
    private embeddingProvider: EmbeddingProvider
  ) {}

  async processImages(limit?: number): Promise<BatchProcessResult> {
    const batchSize = limit || this.config.BATCH_SIZE;
    const images = await this.imageRepo.findUnprocessed(batchSize);

    const result: BatchProcessResult = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };

    for (const image of images) {
      try {
        await this.processImage(image.id);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Image ${image.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      result.totalProcessed++;

      await this.delay(this.config.BATCH_DELAY_MS);
    }

    return result;
  }

  async processImage(imageId: string): Promise<void> {
    const image = await this.imageRepo.findById(imageId);
    if (!image) {
      throw new Error(`Image ${imageId} not found`);
    }

    const existingMetadata = await this.imageRepo.getMetadata(imageId);
    if (existingMetadata) {
      const existingVector = await this.imageRepo.getVector(imageId);
      if (existingVector) {
        return;
      }
    }

    const visionJob = await this.jobRepo.create({
      type: 'vision',
      status: 'pending',
      entityType: 'image',
      entityId: imageId,
      attempts: 0,
      maxAttempts: this.config.MAX_RETRIES,
    });

    await this.executeWithRetry(visionJob.id, async () => {
      const visionResult = await this.visionProvider.analyzeImage(image.originalPath);
      const validatedMetadata = validateVisionOutput(visionResult);

      await this.imageRepo.saveMetadata({
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

      await this.jobRepo.recordCost({
        jobId: visionJob.id,
        operationType: 'vision',
        provider: this.visionProvider.getProviderName(),
        model: this.visionProvider.getModelName(),
        entityType: 'image',
        entityId: image.id,
        estimatedCostUsd: 0.001,
        success: true,
      });
    });

    const metadata = await this.imageRepo.getMetadata(imageId);
    if (!metadata) {
      throw new Error(`Failed to save metadata for image ${imageId}`);
    }

    const embeddingJob = await this.jobRepo.create({
      type: 'embedding',
      status: 'pending',
      entityType: 'image',
      entityId: imageId,
      attempts: 0,
      maxAttempts: this.config.MAX_RETRIES,
    });

    await this.executeWithRetry(embeddingJob.id, async () => {
      const textToEmbed = `${metadata.subject}. ${metadata.caption}. ${metadata.attributes.join(', ')}`;
      const embeddingResult = await this.embeddingProvider.generateEmbedding(textToEmbed);

      await this.imageRepo.saveVector({
        imageId: image.id,
        embedding: embeddingResult.embedding,
        embeddingModel: embeddingResult.model,
        embeddingDimension: embeddingResult.dimension,
      });

      await this.jobRepo.recordCost({
        jobId: embeddingJob.id,
        operationType: 'embedding',
        provider: this.embeddingProvider.getProviderName(),
        model: this.embeddingProvider.getModelName(),
        entityType: 'image',
        entityId: image.id,
        tokensUsed: Math.ceil(textToEmbed.length / 4),
        estimatedCostUsd: 0.0001,
        success: true,
      });
    });
  }

  async processPosts(limit?: number): Promise<BatchProcessResult> {
    const batchSize = limit || this.config.BATCH_SIZE;
    const posts = await this.postRepo.findAllWithVectors(batchSize);

    const unprocessedPosts = posts.filter(p => !p.vector);

    const result: BatchProcessResult = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      skipped: posts.length - unprocessedPosts.length,
      errors: [],
    };

    for (const post of unprocessedPosts) {
      try {
        await this.processPost(post.id);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Post ${post.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      result.totalProcessed++;

      await this.delay(this.config.BATCH_DELAY_MS);
    }

    return result;
  }

  async processPost(postId: string): Promise<void> {
    const post = await this.postRepo.findById(postId);
    if (!post) {
      throw new Error(`Post ${postId} not found`);
    }

    const existingVector = await this.postRepo.getVector(postId);
    if (existingVector) {
      return;
    }

    const job = await this.jobRepo.create({
      type: 'embedding',
      status: 'pending',
      entityType: 'post',
      entityId: postId,
      attempts: 0,
      maxAttempts: this.config.MAX_RETRIES,
    });

    await this.executeWithRetry(job.id, async () => {
      const textToEmbed = `${post.title}. ${post.content}`;
      const embeddingResult = await this.embeddingProvider.generateEmbedding(textToEmbed);

      await this.postRepo.saveVector({
        postId: post.id,
        embedding: embeddingResult.embedding,
        embeddingModel: embeddingResult.model,
        embeddingDimension: embeddingResult.dimension,
      });

      await this.jobRepo.recordCost({
        jobId: job.id,
        operationType: 'embedding',
        provider: this.embeddingProvider.getProviderName(),
        model: this.embeddingProvider.getModelName(),
        entityType: 'post',
        entityId: post.id,
        tokensUsed: Math.ceil(textToEmbed.length / 4),
        estimatedCostUsd: 0.0001,
        success: true,
      });
    });
  }

  private async executeWithRetry(jobId: string, operation: () => Promise<void>): Promise<void> {
    let job = await this.jobRepo.markProcessing(jobId);

    while (job && job.attempts < job.maxAttempts) {
      try {
        await operation();
        await this.jobRepo.markCompleted(jobId);
        return;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        job = await this.jobRepo.incrementAttempts(jobId);

        if (job && job.attempts >= job.maxAttempts) {
          await this.jobRepo.markFailed(jobId, errorMessage);
          throw error;
        }

        await this.delay(1000 * Math.pow(2, job?.attempts || 1));
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
