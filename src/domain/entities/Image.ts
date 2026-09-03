export interface Image {
  id: string;
  filename: string;
  originalPath: string;
  processedPath?: string;
  width?: number;
  height?: number;
  mimeType?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageMetadata {
  id: string;
  imageId: string;
  subject: string;
  category: string;
  attributes: string[];
  caption: string;
  confidence: number;
  rawVisionOutput?: string;
  visionModel?: string;
  processedAt: Date;
}

export interface ImageVector {
  id: string;
  imageId: string;
  embedding: number[];
  embeddingModel: string;
  embeddingDimension: number;
  createdAt: Date;
}

export interface ImageWithMetadata extends Image {
  metadata?: ImageMetadata;
  vector?: ImageVector;
}
