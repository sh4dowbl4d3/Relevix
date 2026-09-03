import { VisionProvider, VisionAnalysisResult } from './VisionProvider.js';
import { getConfig } from '../../config/index.js';
import fs from 'fs';

export class GeminiVisionProvider implements VisionProvider {
  private apiKey: string;
  private model: string;

  constructor() {
    const config = getConfig();
    this.apiKey = config.GEMINI_API_KEY || '';
    this.model = config.VISION_MODEL;
  }

  async analyzeImage(imagePath: string): Promise<VisionAnalysisResult> {
    const imageBuffer = fs.readFileSync(imagePath);
    const mimeType = this.getMimeType(imagePath);
    return this.analyzeImageFromBuffer(imageBuffer, mimeType);
  }

  async analyzeImageFromBuffer(buffer: Buffer, mimeType: string): Promise<VisionAnalysisResult> {
    const base64Image = buffer.toString('base64');

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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image,
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini vision model');
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
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
    return 'gemini';
  }

  private getMimeType(filePath: string): string {
    const ext = filePath.toLowerCase().split('.').pop();
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
    };
    return mimeTypes[ext || ''] || 'image/jpeg';
  }
}
