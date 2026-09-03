import { PostRepository } from '../../domain/repositories/PostRepository.js';
import { ImageRepository } from '../../domain/repositories/ImageRepository.js';
import { SuggestionRepository } from '../../domain/repositories/SuggestionRepository.js';
import { EmbeddingProvider } from '../../infrastructure/ai/EmbeddingProvider.js';
import { MismatchGuard, GuardInput } from '../../domain/guards/MismatchGuard.js';
import { PostWithVector } from '../../domain/entities/Post.js';
import { ImageWithMetadata, ImageVector } from '../../domain/entities/Image.js';
import { Suggestion, GuardDecision } from '../../domain/entities/Suggestion.js';

export interface MatchImagesInput {
  postId: string;
  limit?: number;
  minSimilarity?: number;
}

export interface MatchResult {
  postId: string;
  suggestions: Array<{
    suggestionId: string;
    imageId: string;
    filename: string;
    subject: string;
    category: string;
    caption: string;
    similarity: number;
    confidence: number;
    guardDecision: GuardDecision;
  }>;
  topSuggestion: {
    suggestionId: string;
    imageId: string;
    similarity: number;
    confidence: number;
    accepted: boolean;
    reason: string;
  } | null;
  noConfidentMatch: boolean;
  explanation?: string;
}

export class MatchImages {
  constructor(
    private postRepo: PostRepository,
    private imageRepo: ImageRepository,
    private suggestionRepo: SuggestionRepository,
    private embeddingProvider: EmbeddingProvider,
    private guard: MismatchGuard
  ) {}

  async execute(input: MatchImagesInput): Promise<MatchResult> {
    const post = await this.postRepo.findWithVector(input.postId);
    if (!post) {
      throw new Error(`Post ${input.postId} not found`);
    }

    let postEmbedding = post.vector?.embedding;

    if (!postEmbedding) {
      const textToEmbed = `${post.title}. ${post.content}`;
      const embeddingResult = await this.embeddingProvider.generateEmbedding(textToEmbed);

      await this.postRepo.saveVector({
        postId: post.id,
        embedding: embeddingResult.embedding,
        embeddingModel: embeddingResult.model,
        embeddingDimension: embeddingResult.dimension,
      });

      postEmbedding = embeddingResult.embedding;
    }

    const similarImages = await this.imageRepo.findSimilarVectorsForPost(
      postEmbedding,
      input.limit || 10,
      input.minSimilarity || 0.3
    );

    const suggestions: MatchResult['suggestions'] = [];
    let topSuggestion: MatchResult['topSuggestion'] = null;
    let noConfidentMatch = true;

    for (const imageVector of similarImages) {
      const imageWithMetadata = await this.imageRepo.findWithMetadata(imageVector.imageId);
      if (!imageWithMetadata || !imageWithMetadata.metadata) continue;

      const guardInput: GuardInput = {
        postTitle: post.title,
        postContent: post.content,
        postCategory: post.category,
        imageMetadata: imageWithMetadata.metadata,
        similarityScore: imageVector.similarity,
      };

      const guardDecision = this.guard.evaluate(guardInput);

      const suggestion = await this.suggestionRepo.create({
        postId: post.id,
        imageId: imageVector.imageId,
        similarityScore: imageVector.similarity,
        confidenceScore: imageWithMetadata.metadata.confidence,
        status: guardDecision.accepted ? 'pending' : 'rejected',
        guardDecision,
      });

      suggestions.push({
        suggestionId: suggestion.id,
        imageId: imageVector.imageId,
        filename: imageWithMetadata.filename,
        subject: imageWithMetadata.metadata.subject,
        category: imageWithMetadata.metadata.category,
        caption: imageWithMetadata.metadata.caption,
        similarity: imageVector.similarity,
        confidence: imageWithMetadata.metadata.confidence,
        guardDecision,
      });

      if (guardDecision.accepted && (!topSuggestion || imageVector.similarity > topSuggestion.similarity)) {
        topSuggestion = {
          suggestionId: suggestion.id,
          imageId: imageVector.imageId,
          similarity: imageVector.similarity,
          confidence: imageWithMetadata.metadata.confidence,
          accepted: true,
          reason: guardDecision.reason,
        };
        noConfidentMatch = false;
      }
    }

    let explanation: string | undefined;
    if (noConfidentMatch) {
      if (suggestions.length === 0) {
        explanation = 'No similar images found in the library';
      } else {
        const bestRejected = suggestions[0];
        explanation = `No confident match: ${bestRejected.guardDecision.reason}`;
      }
    }

    return {
      postId: post.id,
      suggestions,
      topSuggestion,
      noConfidentMatch,
      explanation,
    };
  }
}
