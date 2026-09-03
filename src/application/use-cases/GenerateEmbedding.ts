import { ImageRepository } from '../../domain/repositories/ImageRepository.js';
import { PostRepository } from '../../domain/repositories/PostRepository.js';
import { JobRepository } from '../../domain/repositories/JobRepository.js';
import { EmbeddingProvider } from '../../infrastructure/ai/EmbeddingProvider.js';

export interface GenerateEmbeddingInput {
  entityType: 'image' | 'post';
  entityId: string;
}

export interface GenerateEmbeddingResult {
  entityId: string;
  entityType: string;
  embeddingDimension: number;
  jobId: string;
}

export class GenerateEmbedding {
  constructor(
    private imageRepo: ImageRepository,
    private postRepo: PostRepository,
    private jobRepo: JobRepository,
    private embeddingProvider: EmbeddingProvider
  ) {}

  async execute(input: GenerateEmbeddingInput): Promise<GenerateEmbeddingResult> {
    const job = await this.jobRepo.create({
      type: 'embedding',
      status: 'pending',
      entityType: input.entityType,
      entityId: input.entityId,
      attempts: 0,
      maxAttempts: 3,
    });

    try {
      await this.jobRepo.markProcessing(job.id);

      let textToEmbed: string;

      if (input.entityType === 'image') {
        const metadata = await this.imageRepo.getMetadata(input.entityId);
        if (!metadata) {
          throw new Error(`Image ${input.entityId} has no metadata. Process vision first.`);
        }
        textToEmbed = `${metadata.subject}. ${metadata.caption}. ${metadata.attributes.join(', ')}`;
      } else {
        const post = await this.postRepo.findById(input.entityId);
        if (!post) {
          throw new Error(`Post ${input.entityId} not found`);
        }
        textToEmbed = `${post.title}. ${post.content}`;
      }

      const embeddingResult = await this.embeddingProvider.generateEmbedding(textToEmbed);

      if (input.entityType === 'image') {
        await this.imageRepo.saveVector({
          imageId: input.entityId,
          embedding: embeddingResult.embedding,
          embeddingModel: embeddingResult.model,
          embeddingDimension: embeddingResult.dimension,
        });
      } else {
        await this.postRepo.saveVector({
          postId: input.entityId,
          embedding: embeddingResult.embedding,
          embeddingModel: embeddingResult.model,
          embeddingDimension: embeddingResult.dimension,
        });
      }

      await this.jobRepo.markCompleted(job.id);

      await this.jobRepo.recordCost({
        jobId: job.id,
        operationType: 'embedding',
        provider: this.embeddingProvider.getProviderName(),
        model: this.embeddingProvider.getModelName(),
        entityType: input.entityType,
        entityId: input.entityId,
        tokensUsed: this.estimateTokenCount(textToEmbed),
        estimatedCostUsd: this.estimateEmbeddingCost(),
        success: true,
      });

      return {
        entityId: input.entityId,
        entityType: input.entityType,
        embeddingDimension: embeddingResult.dimension,
        jobId: job.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.jobRepo.markFailed(job.id, errorMessage);

      await this.jobRepo.recordCost({
        jobId: job.id,
        operationType: 'embedding',
        provider: this.embeddingProvider.getProviderName(),
        model: this.embeddingProvider.getModelName(),
        entityType: input.entityType,
        entityId: input.entityId,
        estimatedCostUsd: 0,
        success: false,
        errorMessage,
      });

      throw error;
    }
  }

  private estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private estimateEmbeddingCost(): number {
    const provider = this.embeddingProvider.getProviderName();
    if (provider === 'gemini') {
      return 0.0001;
    }
    return 0;
  }
}
