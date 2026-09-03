import { Pool } from 'pg';
import { ImageRepository } from '../../domain/repositories/ImageRepository.js';
import { Image, ImageMetadata, ImageVector, ImageWithMetadata } from '../../domain/entities/Image.js';

export class PostgresImageRepository implements ImageRepository {
  constructor(private pool: Pool) {}

  async findById(id: string): Promise<Image | null> {
    const result = await this.pool.query(
      'SELECT * FROM images WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByFilename(filename: string): Promise<Image | null> {
    const result = await this.pool.query(
      'SELECT * FROM images WHERE filename = $1',
      [filename]
    );
    return result.rows[0] || null;
  }

  async create(image: Omit<Image, 'id' | 'createdAt' | 'updatedAt'>): Promise<Image> {
    const result = await this.pool.query(
      `INSERT INTO images (filename, original_path, processed_path, width, height, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [image.filename, image.originalPath, image.processedPath, image.width, image.height, image.mimeType]
    );
    return result.rows[0];
  }

  async update(id: string, updates: Partial<Image>): Promise<Image | null> {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.filename !== undefined) {
      setClauses.push(`filename = $${paramIndex++}`);
      values.push(updates.filename);
    }
    if (updates.processedPath !== undefined) {
      setClauses.push(`processed_path = $${paramIndex++}`);
      values.push(updates.processedPath);
    }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE images SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async findAll(limit = 100, offset = 0): Promise<Image[]> {
    const result = await this.pool.query(
      'SELECT * FROM images ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  async findUnprocessed(limit = 100): Promise<Image[]> {
    const result = await this.pool.query(
      `SELECT i.* FROM images i
       LEFT JOIN image_metadata im ON i.id = im.image_id
       WHERE im.id IS NULL
       ORDER BY i.created_at ASC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  async findWithMetadata(id: string): Promise<ImageWithMetadata | null> {
    const result = await this.pool.query(
      `SELECT i.*,
              im.id as metadata_id, im.subject, im.category, im.attributes, im.caption,
              im.confidence, im.raw_vision_output, im.vision_model, im.processed_at,
              iv.id as vector_id, iv.embedding, iv.embedding_model, iv.embedding_dimension
       FROM images i
       LEFT JOIN image_metadata im ON i.id = im.image_id
       LEFT JOIN image_vectors iv ON i.id = iv.image_id
       WHERE i.id = $1`,
      [id]
    );

    if (!result.rows[0]) return null;

    const row = result.rows[0];
    return this.mapRowToImageWithMetadata(row);
  }

  async findAllWithMetadata(limit = 100, offset = 0): Promise<ImageWithMetadata[]> {
    const result = await this.pool.query(
      `SELECT i.*,
              im.id as metadata_id, im.subject, im.category, im.attributes, im.caption,
              im.confidence, im.raw_vision_output, im.vision_model, im.processed_at,
              iv.id as vector_id, iv.embedding, iv.embedding_model, iv.embedding_dimension
       FROM images i
       LEFT JOIN image_metadata im ON i.id = im.image_id
       LEFT JOIN image_vectors iv ON i.id = iv.image_id
       ORDER BY i.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows.map(row => this.mapRowToImageWithMetadata(row));
  }

  async saveMetadata(metadata: Omit<ImageMetadata, 'id'>): Promise<ImageMetadata> {
    const result = await this.pool.query(
      `INSERT INTO image_metadata (image_id, subject, category, attributes, caption, confidence, raw_vision_output, vision_model)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (image_id)
       DO UPDATE SET subject = $2, category = $3, attributes = $4, caption = $5,
                     confidence = $6, raw_vision_output = $7, vision_model = $8, processed_at = NOW()
       RETURNING *`,
      [metadata.imageId, metadata.subject, metadata.category, JSON.stringify(metadata.attributes),
       metadata.caption, metadata.confidence, metadata.rawVisionOutput, metadata.visionModel]
    );
    return result.rows[0];
  }

  async getMetadata(imageId: string): Promise<ImageMetadata | null> {
    const result = await this.pool.query(
      'SELECT * FROM image_metadata WHERE image_id = $1',
      [imageId]
    );
    return result.rows[0] || null;
  }

  async updateMetadata(imageId: string, updates: Partial<ImageMetadata>): Promise<ImageMetadata | null> {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.subject !== undefined) {
      setClauses.push(`subject = $${paramIndex++}`);
      values.push(updates.subject);
    }
    if (updates.category !== undefined) {
      setClauses.push(`category = $${paramIndex++}`);
      values.push(updates.category);
    }
    if (updates.confidence !== undefined) {
      setClauses.push(`confidence = $${paramIndex++}`);
      values.push(updates.confidence);
    }

    if (setClauses.length === 0) return this.getMetadata(imageId);

    values.push(imageId);
    const result = await this.pool.query(
      `UPDATE image_metadata SET ${setClauses.join(', ')} WHERE image_id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async saveVector(vector: Omit<ImageVector, 'id' | 'createdAt'>): Promise<ImageVector> {
    const embeddingString = `[${vector.embedding.join(',')}]`;
    const result = await this.pool.query(
      `INSERT INTO image_vectors (image_id, embedding, embedding_model, embedding_dimension)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (image_id)
       DO UPDATE SET embedding = $2, embedding_model = $3, embedding_dimension = $4
       RETURNING *`,
      [vector.imageId, embeddingString, vector.embeddingModel, vector.embeddingDimension]
    );
    return result.rows[0];
  }

  async getVector(imageId: string): Promise<ImageVector | null> {
    const result = await this.pool.query(
      'SELECT * FROM image_vectors WHERE image_id = $1',
      [imageId]
    );
    return result.rows[0] || null;
  }

  async findSimilarVectors(embedding: number[], limit = 10): Promise<Array<ImageVector & { similarity: number }>> {
    const embeddingString = `[${embedding.join(',')}]`;
    const result = await this.pool.query(
      `SELECT *, 1 - (embedding <=> $1::vector) as similarity
       FROM image_vectors
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      [embeddingString, limit]
    );
    return result.rows;
  }

  async findSimilarVectorsForPost(
    postEmbedding: number[],
    limit = 10,
    minSimilarity = 0
  ): Promise<Array<ImageVector & { similarity: number; image: Image }>> {
    const embeddingString = `[${postEmbedding.join(',')}]`;
    const result = await this.pool.query(
      `SELECT iv.*, i.filename, i.original_path, i.width, i.height, i.mime_type,
              1 - (iv.embedding <=> $1::vector) as similarity
       FROM image_vectors iv
       JOIN images i ON iv.image_id = i.id
       WHERE 1 - (iv.embedding <=> $1::vector) >= $3
       ORDER BY iv.embedding <=> $1::vector
       LIMIT $2`,
      [embeddingString, limit, minSimilarity]
    );
    return result.rows.map(row => ({
      id: row.id,
      imageId: row.image_id,
      embedding: row.embedding,
      embeddingModel: row.embedding_model,
      embeddingDimension: row.embedding_dimension,
      createdAt: row.created_at,
      similarity: parseFloat(row.similarity),
      image: {
        id: row.image_id,
        filename: row.filename,
        originalPath: row.original_path,
        width: row.width,
        height: row.height,
        mimeType: row.mime_type,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    }));
  }

  private mapRowToImageWithMetadata(row: any): ImageWithMetadata {
    const image: Image = {
      id: row.id,
      filename: row.filename,
      originalPath: row.original_path,
      processedPath: row.processed_path,
      width: row.width,
      height: row.height,
      mimeType: row.mime_type,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    const metadata: ImageMetadata | undefined = row.metadata_id ? {
      id: row.metadata_id,
      imageId: row.id,
      subject: row.subject,
      category: row.category,
      attributes: row.attributes,
      caption: row.caption,
      confidence: row.confidence,
      rawVisionOutput: row.raw_vision_output,
      visionModel: row.vision_model,
      processedAt: row.processed_at,
    } : undefined;

    const vector: ImageVector | undefined = row.vector_id ? {
      id: row.vector_id,
      imageId: row.id,
      embedding: row.embedding,
      embeddingModel: row.embedding_model,
      embeddingDimension: row.embedding_dimension,
      createdAt: row.created_at,
    } : undefined;

    return { ...image, metadata, vector };
  }
}
