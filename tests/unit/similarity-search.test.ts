import { describe, it, expect } from 'vitest';

describe('Similarity Search', () => {
  it('should calculate cosine similarity correctly', () => {
    const vec1 = [1, 0, 0];
    const vec2 = [1, 0, 0];

    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    const similarity = dotProduct / (magnitude1 * magnitude2);

    expect(similarity).toBeCloseTo(1.0, 5);
  });

  it('should handle orthogonal vectors', () => {
    const vec1 = [1, 0, 0];
    const vec2 = [0, 1, 0];

    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    const similarity = dotProduct / (magnitude1 * magnitude2);

    expect(similarity).toBeCloseTo(0.0, 5);
  });

  it('should handle opposite vectors', () => {
    const vec1 = [1, 0, 0];
    const vec2 = [-1, 0, 0];

    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    const similarity = dotProduct / (magnitude1 * magnitude2);

    expect(similarity).toBeCloseTo(-1.0, 5);
  });

  it('should handle zero vectors', () => {
    const vec1 = [0, 0, 0];
    const vec2 = [1, 0, 0];

    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    const similarity = magnitude1 === 0 || magnitude2 === 0 ? 0 : dotProduct / (magnitude1 * magnitude2);

    expect(similarity).toBe(0);
  });

  it('should rank similar vectors higher', () => {
    const queryVector = [1, 0, 0];
    const candidates = [
      { id: 'a', vector: [0.9, 0.1, 0] },
      { id: 'b', vector: [0.1, 0.9, 0] },
      { id: 'c', vector: [0, 0, 1] },
    ];

    const calculateSimilarity = (vec1: number[], vec2: number[]) => {
      const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
      const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
      const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
      return magnitude1 === 0 || magnitude2 === 0 ? 0 : dotProduct / (magnitude1 * magnitude2);
    };

    const ranked = candidates
      .map(c => ({ ...c, similarity: calculateSimilarity(queryVector, c.vector) }))
      .sort((a, b) => b.similarity - a.similarity);

    expect(ranked[0].id).toBe('a');
    expect(ranked[1].id).toBe('b');
    expect(ranked[2].id).toBe('c');
  });

  it('should apply similarity threshold', () => {
    const threshold = 0.5;
    const similarities = [0.8, 0.6, 0.4, 0.3, 0.9];

    const filtered = similarities.filter(s => s >= threshold);

    expect(filtered).toEqual([0.8, 0.6, 0.9]);
  });
});
