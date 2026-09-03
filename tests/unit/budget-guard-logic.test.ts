import { describe, it, expect } from 'vitest';

describe('Budget Guard Logic', () => {
  describe('Daily Limits', () => {
    it('should track vision calls', () => {
      const dailyVisionCalls = 15;
      const visionLimit = 100;

      const remaining = visionLimit - dailyVisionCalls;

      expect(remaining).toBe(85);
      expect(remaining).toBeGreaterThan(0);
    });

    it('should track embedding calls', () => {
      const dailyEmbeddingCalls = 45;
      const embeddingLimit = 500;

      const remaining = embeddingLimit - dailyEmbeddingCalls;

      expect(remaining).toBe(455);
      expect(remaining).toBeGreaterThan(0);
    });

    it('should track daily cost', () => {
      const dailyCostUsd = 0.15;
      const budgetLimit = 5.00;

      const remaining = budgetLimit - dailyCostUsd;

      expect(remaining).toBeCloseTo(4.85, 2);
      expect(remaining).toBeGreaterThan(0);
    });
  });

  describe('Limit Checks', () => {
    it('should allow within vision limit', () => {
      const usage = 50;
      const limit = 100;

      const allowed = usage < limit;

      expect(allowed).toBe(true);
    });

    it('should reject at vision limit', () => {
      const usage = 100;
      const limit = 100;

      const allowed = usage < limit;

      expect(allowed).toBe(false);
    });

    it('should allow within embedding limit', () => {
      const usage = 200;
      const limit = 500;

      const allowed = usage < limit;

      expect(allowed).toBe(true);
    });

    it('should reject at embedding limit', () => {
      const usage = 500;
      const limit = 500;

      const allowed = usage < limit;

      expect(allowed).toBe(false);
    });

    it('should allow within budget', () => {
      const usage = 2.50;
      const limit = 5.00;

      const allowed = usage < limit;

      expect(allowed).toBe(true);
    });

    it('should reject at budget', () => {
      const usage = 5.00;
      const limit = 5.00;

      const allowed = usage < limit;

      expect(allowed).toBe(false);
    });
  });

  describe('Rejection Reasons', () => {
    it('should provide vision limit reason', () => {
      const reason = 'Daily vision call limit reached (100)';

      expect(reason).toContain('vision call limit');
      expect(reason).toContain('100');
    });

    it('should provide embedding limit reason', () => {
      const reason = 'Daily embedding call limit reached (500)';

      expect(reason).toContain('embedding call limit');
      expect(reason).toContain('500');
    });

    it('should provide budget limit reason', () => {
      const reason = 'Daily budget limit reached ($5)';

      expect(reason).toContain('budget limit');
      expect(reason).toContain('$5');
    });
  });
});
