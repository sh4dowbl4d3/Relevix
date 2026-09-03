import { VisionProvider, VisionAnalysisResult } from './VisionProvider.js';
import { getConfig } from '../../config/index.js';
import fs from 'fs';

export class OllamaVisionProvider implements VisionProvider {
  private baseUrl: string;
  private model: string;

  constructor() {
    const config = getConfig();
    this.baseUrl = config.OLLAMA_BASE_URL;
    this.model = config.OLLAMA_VISION_MODEL;
  }

  async analyzeImage(imagePath: string): Promise<VisionAnalysisResult> {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const prompt = `Analyze this image and provide structured metadata in JSON format.
Return ONLY a valid JSON object with these fields:
{
  "subject": "the main subject of the image (e.g., 'red fox', 'gray wolf', 'golden retriever')",
  "category": "the category of the subject (e.g., 'animal', 'landscape', 'object')",
  "attributes": ["list", "of", "descriptive", "attributes"],
  "caption": "a detailed caption describing the image",
  "confidence": 0.0 to 1.0 confidence score in the identification
}

Be specific about animal species. For example:
- "red fox" not just "fox"
- "gray wolf" not just "wolf"
- "golden retriever" not just "dog"

Focus on the primary subject and its key characteristics.`;

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        images: [base64Image],
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 1024,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    const text = data.response;

    if (!text) {
      throw new Error('No response from Ollama vision model');
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Ollama response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      subject: parsed.subject || 'unknown',
      category: parsed.category || 'unknown',
      attributes: Array.isArray(parsed.attributes) ? parsed.attributes : [],
      caption: parsed.caption || 'No caption provided',
      confidence: typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.5,
    };
  }

  async analyzeImageFromBuffer(buffer: Buffer, mimeType: string): Promise<VisionAnalysisResult> {
    const base64Image = buffer.toString('base64');

    const prompt = `Analyze this image and provide structured metadata in JSON format.
Return ONLY a valid JSON object with these fields:
{
  "subject": "the main subject of the image",
  "category": "the category of the subject",
  "attributes": ["list", "of", "descriptive", "attributes"],
  "caption": "a detailed caption describing the image",
  "confidence": 0.0 to 1.0 confidence score
}`;

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        images: [base64Image],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    const text = data.response;

    if (!text) {
      throw new Error('No response from Ollama vision model');
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Ollama response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      subject: parsed.subject || 'unknown',
      category: parsed.category || 'unknown',
      attributes: Array.isArray(parsed.attributes) ? parsed.attributes : [],
      caption: parsed.caption || 'No caption provided',
      confidence: typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.5,
    };
  }

  getModelName(): string {
    return this.model;
  }

  getProviderName(): string {
    return 'ollama';
  }
}
