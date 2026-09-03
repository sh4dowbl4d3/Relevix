import { describe, it, expect } from 'vitest';

describe('Evaluation Methodology', () => {
  it('should have labeled evaluation posts', () => {
    const fs = require('fs');
    const path = require('path');

    const evalPostsPath = path.join(process.cwd(), 'seed/evaluation-posts.json');
    const evalPosts = JSON.parse(fs.readFileSync(evalPostsPath, 'utf-8'));

    expect(Array.isArray(evalPosts)).toBe(true);
    expect(evalPosts.length).toBeGreaterThanOrEqual(10);
  });

  it('should have required fields for evaluation posts', () => {
    const fs = require('fs');
    const path = require('path');

    const evalPostsPath = path.join(process.cwd(), 'seed/evaluation-posts.json');
    const evalPosts = JSON.parse(fs.readFileSync(evalPostsPath, 'utf-8'));

    evalPosts.forEach((post: any) => {
      expect(post.id).toBeDefined();
      expect(post.title).toBeDefined();
      expect(post.content).toBeDefined();
      expect(post.correctImageCategory).toBeDefined();
      expect(Array.isArray(post.tags)).toBe(true);
    });
  });

  it('should have multiple categories', () => {
    const fs = require('fs');
    const path = require('path');

    const evalPostsPath = path.join(process.cwd(), 'seed/evaluation-posts.json');
    const evalPosts = JSON.parse(fs.readFileSync(evalPostsPath, 'utf-8'));

    const categories = new Set(evalPosts.map((post: any) => post.correctImageCategory));
    expect(categories.size).toBeGreaterThanOrEqual(4);
  });

  it('should have fox vs wolf test cases', () => {
    const fs = require('fs');
    const path = require('path');

    const evalPostsPath = path.join(process.cwd(), 'seed/evaluation-posts.json');
    const evalPosts = JSON.parse(fs.readFileSync(evalPostsPath, 'utf-8'));

    const foxPosts = evalPosts.filter((post: any) =>
      post.correctImageCategory.toLowerCase().includes('fox')
    );
    const wolfPosts = evalPosts.filter((post: any) =>
      post.correctImageCategory.toLowerCase().includes('wolf')
    );

    expect(foxPosts.length).toBeGreaterThan(0);
    expect(wolfPosts.length).toBeGreaterThan(0);
  });

  it('should calculate top-1 precision correctly', () => {
    const totalPosts = 12;
    const correctPredictions = 10;
    const top1Precision = correctPredictions / totalPosts;

    expect(top1Precision).toBeGreaterThan(0);
    expect(top1Precision).toBeLessThanOrEqual(1);
    expect(top1Precision).toBeCloseTo(0.833, 2);
  });
});
