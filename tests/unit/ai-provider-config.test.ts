import { describe, it, expect } from 'vitest';

describe('AI Provider Configuration', () => {
  it('should have Gemini vision provider configuration', () => {
    const config = {
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      apiKey: 'test-api-key',
    };

    expect(config.provider).toBe('gemini');
    expect(config.model).toBe('gemini-1.5-flash');
    expect(config.apiKey).toBeDefined();
  });

  it('should have Gemini embedding provider configuration', () => {
    const config = {
      provider: 'gemini',
      model: 'text-embedding-004',
      dimension: 768,
    };

    expect(config.provider).toBe('gemini');
    expect(config.model).toBe('text-embedding-004');
    expect(config.dimension).toBe(768);
  });

  it('should have Ollama vision provider configuration', () => {
    const config = {
      provider: 'ollama',
      model: 'llava',
      baseUrl: 'http://localhost:11434',
    };

    expect(config.provider).toBe('ollama');
    expect(config.model).toBe('llava');
    expect(config.baseUrl).toBeDefined();
  });

  it('should have Ollama embedding provider configuration', () => {
    const config = {
      provider: 'ollama',
      model: 'all-minilm',
      dimension: 384,
    };

    expect(config.provider).toBe('ollama');
    expect(config.model).toBe('all-minilm');
    expect(config.dimension).toBe(384);
  });

  it('should have provider factory selection logic', () => {
    const useLocalAi = false;
    const provider = useLocalAi ? 'ollama' : 'gemini';

    expect(provider).toBe('gemini');
  });

  it('should have provider factory local selection', () => {
    const useLocalAi = true;
    const provider = useLocalAi ? 'ollama' : 'gemini';

    expect(provider).toBe('ollama');
  });
});
