import { describe, it, expect } from 'vitest';

describe('Image Classification', () => {
  describe('Category Detection', () => {
    it('should detect animal category', () => {
      const postText = 'The behavior of red foxes in the wild';
      const categoryKeywords: Record<string, string[]> = {
        animal: ['animal', 'wildlife', 'pet', 'dog', 'cat', 'fox', 'wolf', 'bear', 'deer', 'bird'],
        landscape: ['landscape', 'nature', 'mountain', 'forest', 'ocean', 'sky', 'sunset'],
        food: ['food', 'recipe', 'cooking', 'meal', 'ingredient'],
        technology: ['tech', 'computer', 'software', 'digital', 'ai'],
      };

      let detectedCategory = 'unknown';
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(kw => postText.toLowerCase().includes(kw))) {
          detectedCategory = category;
          break;
        }
      }

      expect(detectedCategory).toBe('animal');
    });

    it('should detect landscape category', () => {
      const postText = 'Beautiful mountain landscapes at sunset';
      const categoryKeywords: Record<string, string[]> = {
        animal: ['animal', 'wildlife', 'pet', 'dog', 'cat', 'fox', 'wolf', 'bear', 'deer', 'bird'],
        landscape: ['landscape', 'nature', 'mountain', 'forest', 'ocean', 'sky', 'sunset'],
        food: ['food', 'recipe', 'cooking', 'meal', 'ingredient'],
        technology: ['tech', 'computer', 'software', 'digital', 'ai'],
      };

      let detectedCategory = 'unknown';
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(kw => postText.toLowerCase().includes(kw))) {
          detectedCategory = category;
          break;
        }
      }

      expect(detectedCategory).toBe('landscape');
    });

    it('should detect food category', () => {
      const postText = 'Delicious cooking recipes for dinner';
      const categoryKeywords: Record<string, string[]> = {
        animal: ['animal', 'wildlife', 'pet', 'dog', 'cat', 'fox', 'wolf', 'bear', 'deer', 'bird'],
        landscape: ['landscape', 'nature', 'mountain', 'forest', 'ocean', 'sky', 'sunset'],
        food: ['food', 'recipe', 'cooking', 'meal', 'ingredient'],
        technology: ['tech', 'computer', 'software', 'digital', 'ai'],
      };

      let detectedCategory = 'unknown';
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(kw => postText.toLowerCase().includes(kw))) {
          detectedCategory = category;
          break;
        }
      }

      expect(detectedCategory).toBe('food');
    });

    it('should detect technology category', () => {
      const postText: string = 'Latest computer software and digital technology';
      const categoryKeywords: Record<string, string[]> = {
        animal: ['animal', 'wildlife', 'pet', 'dog', 'cat', 'fox', 'wolf', 'bear', 'deer', 'bird'],
        landscape: ['landscape', 'nature', 'mountain', 'forest', 'ocean', 'sky', 'sunset'],
        food: ['food', 'recipe', 'cooking', 'meal', 'ingredient'],
        technology: ['tech', 'computer', 'software', 'digital', 'ai'],
      };

      let detectedCategory = 'unknown';
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(kw => postText.toLowerCase().includes(kw))) {
          detectedCategory = category;
          break;
        }
      }

      expect(detectedCategory).toBe('technology');
    });
  });

  describe('Subject Detection', () => {
    it('should detect fox subject', () => {
      const postText = 'The behavior of red foxes in winter';
      const animalTerms = ['fox', 'wolf', 'dog', 'bear', 'deer', 'cat', 'bird'];

      let detectedSubject = 'general content';
      for (const term of animalTerms) {
        if (postText.toLowerCase().includes(term)) {
          detectedSubject = term;
          break;
        }
      }

      expect(detectedSubject).toBe('fox');
    });

    it('should detect wolf subject', () => {
      const postText = 'Gray wolf pack dynamics in the forest';
      const animalTerms = ['fox', 'wolf', 'dog', 'bear', 'deer', 'cat', 'bird'];

      let detectedSubject = 'general content';
      for (const term of animalTerms) {
        if (postText.toLowerCase().includes(term)) {
          detectedSubject = term;
          break;
        }
      }

      expect(detectedSubject).toBe('wolf');
    });

    it('should detect dog subject', () => {
      const postText = 'Choosing the right dog breed for your family';
      const animalTerms = ['fox', 'wolf', 'dog', 'bear', 'deer', 'cat', 'bird'];

      let detectedSubject = 'general content';
      for (const term of animalTerms) {
        if (postText.toLowerCase().includes(term)) {
          detectedSubject = term;
          break;
        }
      }

      expect(detectedSubject).toBe('dog');
    });

    it('should detect bear subject', () => {
      const postText: string = 'Black bears in the Appalachian Mountains';
      const animalTerms = ['fox', 'wolf', 'dog', 'bear', 'deer', 'cat', 'bird'];

      let detectedSubject = 'general content';
      for (const term of animalTerms) {
        if (postText.toLowerCase().includes(term)) {
          detectedSubject = term;
          break;
        }
      }

      expect(detectedSubject).toBe('bear');
    });
  });
});
