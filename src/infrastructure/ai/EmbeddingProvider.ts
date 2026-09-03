export interface EmbeddingResult {
  embedding: number[];
  dimension: number;
  model: string;
}

export interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<EmbeddingResult>;
  generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]>;
  getDimension(): number;
  getModelName(): string;
  getProviderName(): string;
}
