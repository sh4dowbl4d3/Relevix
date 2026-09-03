import { EmbeddingProvider, EmbeddingResult } from './EmbeddingProvider.js';
import { getConfig } from '../../config/index.js';

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  private apiKey: string;
  private model: string;
  private dimension: number;

  constructor() {
    const config = getConfig();
    this.apiKey = config.GEMINI_API_KEY || '';
    this.model = config.EMBEDDING_MODEL;
    this.dimension = 768;
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:embedContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: `models/${this.model}`,
          content: {
            parts: [{ text }]
          },
          taskType: 'RETRIEVAL_DOCUMENT',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini embedding API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    const embedding = data.embedding?.values;

    if (!embedding || !Array.isArray(embedding)) {
      throw new Error('Invalid embedding response from Gemini');
    }

    return {
      embedding,
      dimension: embedding.length,
      model: this.model,
    };
  }

  async generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];
    for (const text of texts) {
      const result = await this.generateEmbedding(text);
      results.push(result);
    }
    return results;
  }

  getDimension(): number {
    return this.dimension;
  }

  getModelName(): string {
    return this.model;
  }

  getProviderName(): string {
    return 'gemini';
  }
}
