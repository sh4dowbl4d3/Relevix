export interface VisionAnalysisResult {
  subject: string;
  category: string;
  attributes: string[];
  caption: string;
  confidence: number;
}

export interface VisionProvider {
  analyzeImage(imagePath: string): Promise<VisionAnalysisResult>;
  analyzeImageFromBuffer(buffer: Buffer, mimeType: string): Promise<VisionAnalysisResult>;
  getModelName(): string;
  getProviderName(): string;
}
