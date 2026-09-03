import { EmbeddingProvider, EmbeddingResult } from './EmbeddingProvider.js';
import { getConfig } from '../../config/index.js';

export class OllamaEmbeddingProvider implements EmbeddingProvider {
  private baseUrl: string;
  private model: string;
  private dimension: number;

  constructor() {
    const config = getConfig();
    this.baseUrl = config.OLLAMA_BASE_URL;
    this.model = config.OLLAMA_EMBEDDING_MODEL;
    this.dimension = 384;
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama embedding API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    const embedding = data.embedding;

    if (!embedding || !Array.isArray(embedding)) {
      throw new Error('Invalid embedding response from Ollama');
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
    return 'ollama';
  }
}
