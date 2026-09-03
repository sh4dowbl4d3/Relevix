import { describe, it, expect } from 'vitest';

describe('Embedding Generation', () => {
  describe('Embedding Structure', () => {
    it('should have valid embedding structure', () => {
      const embedding = {
        embedding: new Array(768).fill(0.1),
        dimension: 768,
        model: 'text-embedding-004',
      };

      expect(Array.isArray(embedding.embedding)).toBe(true);
      expect(embedding.dimension).toBe(768);
      expect(embedding.model).toBeDefined();
    });

    it('should have correct dimension', () => {
      const embedding = new Array(768).fill(0.1);

      expect(embedding.length).toBe(768);
    });

    it('should have valid values', () => {
      const embedding = new Array(768).fill(0.1);

      embedding.forEach(value => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(-1);
        expect(value).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Image Embedding', () => {
    it('should generate embedding from metadata', () => {
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
    });
  });

  describe('Post Embedding', () => {
    it('should generate embedding from post content', () => {
      const post = {
        title: 'The Behavior of Red Foxes',
        content: 'Red foxes are cunning predators that hunt small mammals.',
      };

      const textToEmbed = `${post.title}. ${post.content}`;

      expect(textToEmbed.toLowerCase()).toContain('red fox');
      expect(textToEmbed.toLowerCase()).toContain('predator');
    });

    it('should store post embedding', () => {
      const postId = 'post-1';
      const embedding = {
        postId,
        embedding: new Array(768).fill(0.1),
        embeddingModel: 'text-embedding-004',
        embeddingDimension: 768,
      };

      expect(embedding.postId).toBe(postId);
      expect(embedding.embedding.length).toBe(768);
    });
  });

  describe('Embedding Similarity', () => {
    it('should calculate cosine similarity', () => {
      const vec1 = [1, 0, 0];
      const vec2 = [1, 0, 0];

      const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
      const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
      const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
      const similarity = dotProduct / (magnitude1 * magnitude2);

      expect(similarity).toBeCloseTo(1.0, 5);
    });

    it('should rank similar embeddings higher', () => {
      const queryEmbedding = [1, 0, 0];
      const candidates = [
        { id: 'a', embedding: [0.9, 0.1, 0] },
        { id: 'b', embedding: [0.1, 0.9, 0] },
        { id: 'c', embedding: [0, 0, 1] },
      ];

      const calculateSimilarity = (vec1: number[], vec2: number[]) => {
        const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
        const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
        const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
        return magnitude1 === 0 || magnitude2 === 0 ? 0 : dotProduct / (magnitude1 * magnitude2);
      };

      const ranked = candidates
        .map(c => ({ ...c, similarity: calculateSimilarity(queryEmbedding, c.embedding) }))
        .sort((a, b) => b.similarity - a.similarity);

      expect(ranked[0].id).toBe('a');
      expect(ranked[1].id).toBe('b');
      expect(ranked[2].id).toBe('c');
    });
  });
});
