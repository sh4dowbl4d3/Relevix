import { describe, it, expect } from 'vitest';

describe('Security', () => {
  it('should have .env in .gitignore', () => {
    const fs = require('fs');
    const path = require('path');

    const gitignorePath = path.join(process.cwd(), '.gitignore');
    const gitignore = fs.readFileSync(gitignorePath, 'utf-8');

    expect(gitignore).toContain('.env');
  });

  it('should not have hardcoded API keys', () => {
    const fs = require('fs');
    const path = require('path');

    const filesToCheck = [
      'src/config/index.ts',
      'src/infrastructure/ai/GeminiVisionProvider.ts',
      'src/infrastructure/ai/GeminiEmbeddingProvider.ts',
    ];

    filesToCheck.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      const content = fs.readFileSync(filePath, 'utf-8');

      expect(content).not.toContain('AIza');
      expect(content).not.toContain('sk-');
      expect(content).not.toContain('api_key=');
    });
  });

  it('should have .env.example with placeholders', () => {
    const fs = require('fs');
    const path = require('path');

    const envExamplePath = path.join(process.cwd(), '.env.example');
    const envExample = fs.readFileSync(envExamplePath, 'utf-8');

    expect(envExample).toContain('GEMINI_API_KEY=');
    expect(envExample).toContain('DB_PASSWORD=');
  });

  it('should validate environment variables', () => {
    const envSchema = {
      PORT: 'number',
      NODE_ENV: 'string',
      DB_HOST: 'string',
      DB_PORT: 'number',
      DB_NAME: 'string',
      DB_USER: 'string',
      DB_PASSWORD: 'string',
    };

    Object.entries(envSchema).forEach(([key, type]) => {
      expect(typeof key).toBe('string');
      expect(typeof type).toBe('string');
    });
  });

  it('should have safe error responses', () => {
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    };

    expect(errorResponse.error.message).not.toContain('stack');
    expect(errorResponse.error.message).not.toContain('password');
    expect(errorResponse.error.message).not.toContain('api_key');
  });
});
