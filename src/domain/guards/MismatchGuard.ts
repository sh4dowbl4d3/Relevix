import { GuardDecision } from '../entities/Suggestion.js';
import { ImageMetadata } from '../entities/Image.js';
import { getConfig } from '../../config/index.js';

export interface GuardInput {
  postTitle: string;
  postContent: string;
  postCategory?: string;
  imageMetadata: ImageMetadata;
  similarityScore: number;
}

export interface GuardConfig {
  similarityThreshold: number;
  confidenceThreshold: number;
  categoryMatchRequired: boolean;
}

export class MismatchGuard {
  private config: GuardConfig;

  constructor(config?: Partial<GuardConfig>) {
    const appConfig = getConfig();
    this.config = {
      similarityThreshold: config?.similarityThreshold ?? appConfig.SIMILARITY_THRESHOLD,
      confidenceThreshold: config?.confidenceThreshold ?? appConfig.CONFIDENCE_THRESHOLD,
      categoryMatchRequired: config?.categoryMatchRequired ?? true,
    };
  }

  evaluate(input: GuardInput): GuardDecision {
    const { postTitle, postContent, postCategory, imageMetadata, similarityScore } = input;

    const postText = `${postTitle} ${postContent}`.toLowerCase();
    const imageSubject = imageMetadata.subject.toLowerCase();
    const imageCategory = imageMetadata.category.toLowerCase();
    const imageCaption = imageMetadata.caption.toLowerCase();

    const categoryMatch = this.checkCategoryMatch(postText, imageCategory, postCategory);
    const subjectSimilarity = this.calculateSubjectSimilarity(postText, imageSubject, imageCaption);
    const confidenceScore = imageMetadata.confidence;

    const reasons: string[] = [];
    let accepted = true;

    if (similarityScore < this.config.similarityThreshold) {
      accepted = false;
      reasons.push(`Similarity score ${similarityScore.toFixed(3)} below threshold ${this.config.similarityThreshold}`);
    }

    if (confidenceScore < this.config.confidenceThreshold) {
      accepted = false;
      reasons.push(`Image confidence ${confidenceScore.toFixed(2)} below threshold ${this.config.confidenceThreshold}`);
    }

    if (this.config.categoryMatchRequired && !categoryMatch.matched) {
      accepted = false;
      reasons.push(`Category mismatch: post expects ${categoryMatch.expected}, detected ${imageCategory}`);
    }

    if (!this.checkSubjectRelevance(postText, imageSubject, imageCaption)) {
      accepted = false;
      reasons.push(`Subject mismatch: post discusses ${this.extractMainSubject(postText)}, image shows ${imageSubject}`);
    }

    const overallConfidence = this.calculateOverallConfidence(
      similarityScore,
      confidenceScore,
      categoryMatch.matched ? 1 : 0,
      subjectSimilarity
    );

    if (accepted && overallConfidence < 0.4) {
      accepted = false;
      reasons.push(`Overall confidence ${overallConfidence.toFixed(2)} too low for recommendation`);
    }

    return {
      accepted,
      reason: accepted
        ? 'Image matches post content with sufficient confidence'
        : reasons.join('; '),
      categoryMatch: categoryMatch.matched,
      subjectSimilarity,
      overallConfidence,
      rejectionReason: accepted ? undefined : reasons[0],
    };
  }

  private checkCategoryMatch(
    postText: string,
    imageCategory: string,
    postCategory?: string
  ): { matched: boolean; expected: string } {
    const categoryKeywords: Record<string, string[]> = {
      animal: ['animal', 'wildlife', 'pet', 'dog', 'cat', 'fox', 'wolf', 'bear', 'deer', 'bird'],
      landscape: ['landscape', 'nature', 'mountain', 'forest', 'ocean', 'sky', 'sunset'],
      food: ['food', 'recipe', 'cooking', 'meal', 'ingredient'],
      technology: ['tech', 'computer', 'software', 'digital', 'ai'],
    };

    if (postCategory) {
      return {
        matched: imageCategory === postCategory || imageCategory.includes(postCategory),
        expected: postCategory,
      };
    }

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => postText.includes(kw))) {
        return {
          matched: imageCategory === category || imageCategory.includes(category),
          expected: category,
        };
      }
    }

    return { matched: true, expected: 'unknown' };
  }

  private calculateSubjectSimilarity(postText: string, imageSubject: string, imageCaption: string): number {
    const postWords = new Set(postText.split(/\s+/).filter(w => w.length > 3));
    const subjectWords = new Set(imageSubject.split(/\s+/).filter(w => w.length > 3));
    const captionWords = new Set(imageCaption.split(/\s+/).filter(w => w.length > 3));

    let matches = 0;
    let total = 0;

    for (const word of subjectWords) {
      total++;
      if (postWords.has(word)) matches++;
    }

    for (const word of captionWords) {
      total++;
      if (postWords.has(word)) matches++;
    }

    return total > 0 ? matches / total : 0;
  }

  private checkSubjectRelevance(postText: string, imageSubject: string, imageCaption: string): boolean {
    const animalPairs: [string, string][] = [
      ['fox', 'fox'],
      ['wolf', 'wolf'],
      ['dog', 'dog'],
      ['bear', 'bear'],
      ['deer', 'deer'],
      ['cat', 'cat'],
      ['bird', 'bird'],
    ];

    for (const [postKeyword, imageKeyword] of animalPairs) {
      if (postText.includes(postKeyword)) {
        return imageSubject.includes(imageKeyword) || imageCaption.includes(imageKeyword);
      }
    }

    return true;
  }

  private extractMainSubject(postText: string): string {
    const animalTerms = ['fox', 'wolf', 'dog', 'bear', 'deer', 'cat', 'bird'];
    for (const term of animalTerms) {
      if (postText.includes(term)) return term;
    }
    return 'general content';
  }

  private calculateOverallConfidence(
    similarity: number,
    confidence: number,
    categoryMatch: number,
    subjectSimilarity: number
  ): number {
    return (
      similarity * 0.35 +
      confidence * 0.25 +
      categoryMatch * 0.2 +
      subjectSimilarity * 0.2
    );
  }
}

export function createGuard(): MismatchGuard {
  return new MismatchGuard();
}
