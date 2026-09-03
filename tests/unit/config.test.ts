import { describe, it, expect } from 'vitest';
import { getConfig } from '../../src/config/index.js';

describe('Environment Configuration', () => {
  it('should load configuration with defaults', () => {
    const config = getConfig();

    expect(config).toBeDefined();
    expect(config.PORT).toBeDefined();
    expect(config.NODE_ENV).toBeDefined();
    expect(config.DB_HOST).toBeDefined();
    expect(config.DB_PORT).toBeDefined();
  });

  it('should have default values for thresholds', () => {
    const config = getConfig();

    expect(config.SIMILARITY_THRESHOLD).toBeGreaterThan(0);
    expect(config.SIMILARITY_THRESHOLD).toBeLessThanOrEqual(1);
    expect(config.CONFIDENCE_THRESHOLD).toBeGreaterThan(0);
    expect(config.CONFIDENCE_THRESHOLD).toBeLessThanOrEqual(1);
  });

  it('should have default values for budget limits', () => {
    const config = getConfig();

    expect(config.DAILY_BUDGET_LIMIT_USD).toBeGreaterThan(0);
    expect(config.MAX_VISION_CALLS_PER_DAY).toBeGreaterThan(0);
    expect(config.MAX_EMBEDDING_CALLS_PER_DAY).toBeGreaterThan(0);
  });

  it('should have AI provider configuration', () => {
    const config = getConfig();

    expect(typeof config.USE_LOCAL_AI).toBe('boolean');
    expect(typeof config.VISION_MODEL).toBe('string');
    expect(typeof config.EMBEDDING_MODEL).toBe('string');
  });
});
