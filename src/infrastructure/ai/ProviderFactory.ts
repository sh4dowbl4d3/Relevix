import { VisionProvider } from './VisionProvider.js';
import { EmbeddingProvider } from './EmbeddingProvider.js';
import { GeminiVisionProvider } from './GeminiVisionProvider.js';
import { GeminiEmbeddingProvider } from './GeminiEmbeddingProvider.js';
import { OllamaVisionProvider } from './OllamaVisionProvider.js';
import { OllamaEmbeddingProvider } from './OllamaEmbeddingProvider.js';
import { getConfig } from '../../config/index.js';

let visionProvider: VisionProvider | null = null;
let embeddingProvider: EmbeddingProvider | null = null;

export function getVisionProvider(): VisionProvider {
  if (!visionProvider) {
    const config = getConfig();
    if (config.USE_LOCAL_AI) {
      visionProvider = new OllamaVisionProvider();
    } else {
      visionProvider = new GeminiVisionProvider();
    }
  }
  return visionProvider;
}

export function getEmbeddingProvider(): EmbeddingProvider {
  if (!embeddingProvider) {
    const config = getConfig();
    if (config.USE_LOCAL_AI) {
      embeddingProvider = new OllamaEmbeddingProvider();
    } else {
      embeddingProvider = new GeminiEmbeddingProvider();
    }
  }
  return embeddingProvider;
}

export function resetProviders(): void {
  visionProvider = null;
  embeddingProvider = null;
}
