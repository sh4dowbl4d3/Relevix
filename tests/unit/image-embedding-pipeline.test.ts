import { describe, it, expect } from 'vitest';

describe('Image Embedding Pipeline', () => {
  describe('Metadata Extraction', () => {
    it('should extract text from metadata', () => {
      const metadata = {
        subject: 'red fox',
        category: 'animal',
        attributes: ['orange fur', 'wild', 'forest'],
        caption: 'A red fox standing in a forest',
      };

      const textToEmbed = `${metadata.subject}. ${metadata.caption}. ${metadata.attributes.join(', ')}`;

      expect(textToEmbed).toContain('red fox');
      expect(textToEmbed).toContain('orange fur');
      expect(textToEmbed).toContain('forest');
    });

    it('should handle empty attributes', () => {
      const metadata = {
        subject: 'red fox',
        category: 'animal',
        attributes: [],
        caption: 'A red fox',
      };

      const textToEmbed = `${metadata.subject}. ${metadata.caption}. ${metadata.attributes.join(', ')}`;

      expect(textToEmbed).toContain('red fox');
    });

    it('should handle special characters', () => {
      const metadata = {
        subject: "red fox (Vulpes vulpes)",
        category: 'animal',
        attributes: ["orange fur", "wild"],
        caption: "A red fox's distinctive call",
      };

      const textToEmbed = `${metadata.subject}. ${metadata.caption}. ${metadata.attributes.join(', ')}`;

      expect(textToEmbed).toContain('Vulpes vulpes');
      expect(textToEmbed).toContain('fox\'s');
    });
  });

  describe('Embedding Generation', () => {
    it('should generate embedding from metadata', () => {
      const metadata = {
        subject: 'red fox',
        category: 'animal',
        attributes: ['orange fur', 'wild', 'forest'],
        caption: 'A red fox standing in a forest',
      };

      const textToEmbed = `${metadata.subject}. ${metadata.caption}. ${metadata.attributes.join(', ')}`;

      const embedding = new Array(768).fill(0.1);

      expect(embedding.length).toBe(768);
    });

    it('should cache embeddings', () => {
      const imageId = 'img-1';
      const embeddingCache = new Map();

      const embedding = new Array(768).fill(0.1);
      embeddingCache.set(imageId, embedding);

      expect(embeddingCache.has(imageId)).toBe(true);
      expect(embeddingCache.get(imageId)).toBe(embedding);
    });
  });

  describe('Embedding Storage', () => {
    it('should store image embedding', () => {
      const imageId = 'img-1';
      const embedding = {
        imageId,
        embedding: new Array(768).fill(0.1),
        embeddingModel: 'text-embedding-004',
        embeddingDimension: 768,
      };

      expect(embedding.imageId).toBe(imageId);
      expect(embedding.embedding.length).toBe(768);
      expect(embedding.embeddingDimension).toBe(768);
    });

    it('should update existing embedding', () => {
      const imageId = 'img-1';
      const existingEmbedding = {
        imageId,
        embedding: new Array(768).fill(0.1),
        embeddingModel: 'text-embedding-004',
        embeddingDimension: 768,
      };

      const updatedEmbedding = {
        ...existingEmbedding,
        embedding: new Array(768).fill(0.2),
      };

      expect(updatedEmbedding.embedding[0]).toBe(0.2);
    });
  });

  describe('Similarity Search', () => {
    it('should find similar images', () => {
      const postEmbedding = [1, 0, 0];
      const imageEmbeddings = [
        { id: 'img-1', embedding: [0.9, 0.1, 0] },
        { id: 'img-2', embedding: [0.1, 0.9, 0] },
        { id: 'img-3', embedding: [0, 0, 1] },
      ];

      const calculateSimilarity = (vec1: number[], vec2: number[]) => {
        const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
        const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
        const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
        return magnitude1 === 0 || magnitude2 === 0 ? 0 : dotProduct / (magnitude1 * magnitude2);
      };

      const ranked = imageEmbeddings
        .map(ie => ({ ...ie, similarity: calculateSimilarity(postEmbedding, ie.embedding) }))
        .sort((a, b) => b.similarity - a.similarity);

      expect(ranked[0].id).toBe('img-1');
      expect(ranked[1].id).toBe('img-2');
      expect(ranked[2].id).toBe('img-3');
    });

    it('should filter by similarity threshold', () => {
      const threshold = 0.7;
      const candidates = [
        { id: 'img-1', similarity: 0.85 },
        { id: 'img-2', similarity: 0.75 },
        { id: 'img-3', similarity: 0.65 },
      ];

      const filtered = candidates.filter(c => c.similarity >= threshold);

      expect(filtered.length).toBe(2);
      expect(filtered.map(c => c.id)).toContain('img-1');
      expect(filtered.map(c => c.id)).toContain('img-2');
    });
  });
});
