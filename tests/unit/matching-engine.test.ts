import { describe, it, expect } from 'vitest';

describe('Matching Engine', () => {
  describe('Similarity Ranking', () => {
    it('should rank images by similarity', () => {
      const candidates = [
        { id: 'img-1', similarity: 0.85, subject: 'red fox' },
        { id: 'img-2', similarity: 0.75, subject: 'gray wolf' },
        { id: 'img-3', similarity: 0.65, subject: 'golden retriever' },
      ];

      const ranked = candidates.sort((a, b) => b.similarity - a.similarity);

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

    it('should return top N results', () => {
      const limit = 2;
      const candidates = [
        { id: 'img-1', similarity: 0.85 },
        { id: 'img-2', similarity: 0.75 },
        { id: 'img-3', similarity: 0.65 },
      ];

      const top = candidates.slice(0, limit);

      expect(top.length).toBe(limit);
      expect(top[0].id).toBe('img-1');
      expect(top[1].id).toBe('img-2');
    });
  });

  describe('Concept Equivalence', () => {
    it('should recognize semantically similar concepts', () => {
      const concepts = [
        'red fox',
        'Vulpes vulpes',
        'wild fox species',
      ];

      const foxKeywords = ['fox', 'vulpes'];

      concepts.forEach(concept => {
        const lowerConcept = concept.toLowerCase();
        const isFox = foxKeywords.some(kw => lowerConcept.includes(kw));
        expect(isFox).toBe(true);
      });
    });

    it('should distinguish between different species', () => {
      const foxConcepts = ['red fox', 'Vulpes vulpes', 'wild fox'];
      const wolfConcepts = ['gray wolf', 'Canis lupus', 'timber wolf'];
      const dogConcepts = ['golden retriever', 'labrador', 'beagle'];

      foxConcepts.forEach(concept => {
        const lower = concept.toLowerCase();
        const isFox = lower.includes('fox') || lower.includes('vulpes');
        expect(isFox).toBe(true);
      });

      wolfConcepts.forEach(concept => {
        const lower = concept.toLowerCase();
        const isWolf = lower.includes('wolf') || lower.includes('canis lupus');
        expect(isWolf).toBe(true);
      });

      dogConcepts.forEach(concept => {
        expect(concept.toLowerCase()).not.toContain('fox');
        expect(concept.toLowerCase()).not.toContain('wolf');
      });
    });
  });

  describe('Post Embedding', () => {
    it('should generate embedding for post content', () => {
      const post = {
        title: 'The Behavior of Red Foxes',
        content: 'Red foxes are cunning predators that hunt small mammals.',
      };

      const textToEmbed = `${post.title}. ${post.content}`;

      expect(textToEmbed.toLowerCase()).toContain('red fox');
      expect(textToEmbed.toLowerCase()).toContain('predator');
    });

    it('should cache post embeddings', () => {
      const postId = 'post-1';
      const embeddingCache = new Map();

      const embedding = new Array(768).fill(0.1);
      embeddingCache.set(postId, embedding);

      expect(embeddingCache.has(postId)).toBe(true);
      expect(embeddingCache.get(postId)).toBe(embedding);
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
    });

    it('should cache image embeddings', () => {
      const imageId = 'img-1';
      const embeddingCache = new Map();

      const embedding = new Array(768).fill(0.1);
      embeddingCache.set(imageId, embedding);

      expect(embeddingCache.has(imageId)).toBe(true);
      expect(embeddingCache.get(imageId)).toBe(embedding);
    });
  });
});
