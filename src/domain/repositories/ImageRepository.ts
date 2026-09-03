import { Image, ImageMetadata, ImageVector, ImageWithMetadata } from '../entities/Image.js';

export interface ImageRepository {
  findById(id: string): Promise<Image | null>;
  findByFilename(filename: string): Promise<Image | null>;
  create(image: Omit<Image, 'id' | 'createdAt' | 'updatedAt'>): Promise<Image>;
  update(id: string, updates: Partial<Image>): Promise<Image | null>;
  findAll(limit?: number, offset?: number): Promise<Image[]>;
  findUnprocessed(limit?: number): Promise<Image[]>;
  findWithMetadata(id: string): Promise<ImageWithMetadata | null>;
  findAllWithMetadata(limit?: number, offset?: number): Promise<ImageWithMetadata[]>;

  saveMetadata(metadata: Omit<ImageMetadata, 'id'>): Promise<ImageMetadata>;
  getMetadata(imageId: string): Promise<ImageMetadata | null>;
  updateMetadata(imageId: string, updates: Partial<ImageMetadata>): Promise<ImageMetadata | null>;

  saveVector(vector: Omit<ImageVector, 'id' | 'createdAt'>): Promise<ImageVector>;
  getVector(imageId: string): Promise<ImageVector | null>;
  findSimilarVectors(embedding: number[], limit?: number): Promise<Array<ImageVector & { similarity: number }>>;
  findSimilarVectorsForPost(postEmbedding: number[], limit?: number, minSimilarity?: number): Promise<Array<ImageVector & { similarity: number; image: Image }>>;
}
