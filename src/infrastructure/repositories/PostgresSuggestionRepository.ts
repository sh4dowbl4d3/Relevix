import { Pool } from 'pg';
import { SuggestionRepository } from '../../domain/repositories/SuggestionRepository.js';
import { Suggestion, SuggestionWithDetails, SuggestionStatus } from '../../domain/entities/Suggestion.js';

export class PostgresSuggestionRepository implements SuggestionRepository {
  constructor(private pool: Pool) {}

  async create(suggestion: Omit<Suggestion, 'id' | 'createdAt' | 'updatedAt'>): Promise<Suggestion> {
    const result = await this.pool.query(
      `INSERT INTO suggestions (post_id, image_id, similarity_score, confidence_score, status, guard_decision)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [suggestion.postId, suggestion.imageId, suggestion.similarityScore,
       suggestion.confidenceScore, suggestion.status, JSON.stringify(suggestion.guardDecision)]
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<SuggestionWithDetails | null> {
    const result = await this.pool.query(
      `SELECT s.*,
              p.title as post_title, p.content as post_content,
              i.filename as image_filename,
              im.subject as image_subject, im.category as image_category,
              im.caption as image_caption, im.confidence as image_confidence
       FROM suggestions s
       JOIN posts p ON s.post_id = p.id
       JOIN images i ON s.image_id = i.id
       LEFT JOIN image_metadata im ON i.id = im.image_id
       WHERE s.id = $1`,
      [id]
    );

    if (!result.rows[0]) return null;

    return this.mapRowToSuggestionWithDetails(result.rows[0]);
  }

  async findByPostId(postId: string): Promise<SuggestionWithDetails[]> {
    const result = await this.pool.query(
      `SELECT s.*,
              p.title as post_title, p.content as post_content,
              i.filename as image_filename,
              im.subject as image_subject, im.category as image_category,
              im.caption as image_caption, im.confidence as image_confidence
       FROM suggestions s
       JOIN posts p ON s.post_id = p.id
       JOIN images i ON s.image_id = i.id
       LEFT JOIN image_metadata im ON i.id = im.image_id
       WHERE s.post_id = $1
       ORDER BY s.similarity_score DESC`,
      [postId]
    );

    return result.rows.map(row => this.mapRowToSuggestionWithDetails(row));
  }

  async findByImageId(imageId: string): Promise<Suggestion[]> {
    const result = await this.pool.query(
      'SELECT * FROM suggestions WHERE image_id = $1 ORDER BY created_at DESC',
      [imageId]
    );
    return result.rows;
  }

  async findByStatus(status: SuggestionStatus): Promise<SuggestionWithDetails[]> {
    const result = await this.pool.query(
      `SELECT s.*,
              p.title as post_title, p.content as post_content,
              i.filename as image_filename,
              im.subject as image_subject, im.category as image_category,
              im.caption as image_caption, im.confidence as image_confidence
       FROM suggestions s
       JOIN posts p ON s.post_id = p.id
       JOIN images i ON s.image_id = i.id
       LEFT JOIN image_metadata im ON i.id = im.image_id
       WHERE s.status = $1
       ORDER BY s.created_at DESC`,
      [status]
    );

    return result.rows.map(row => this.mapRowToSuggestionWithDetails(row));
  }

  async update(id: string, updates: Partial<Suggestion>): Promise<Suggestion | null> {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.status !== undefined) {
      setClauses.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.reviewedAt !== undefined) {
      setClauses.push(`reviewed_at = $${paramIndex++}`);
      values.push(updates.reviewedAt);
    }
    if (updates.reviewedBy !== undefined) {
      setClauses.push(`reviewed_by = $${paramIndex++}`);
      values.push(updates.reviewedBy);
    }
    if (updates.reviewNotes !== undefined) {
      setClauses.push(`review_notes = $${paramIndex++}`);
      values.push(updates.reviewNotes);
    }
    if (updates.guardDecision !== undefined) {
      setClauses.push(`guard_decision = $${paramIndex++}`);
      values.push(JSON.stringify(updates.guardDecision));
    }

    if (setClauses.length === 0) return this.findById(id) as Promise<Suggestion | null>;

    values.push(id);
    const result = await this.pool.query(
      `UPDATE suggestions SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async approve(id: string, reviewedBy?: string, notes?: string): Promise<Suggestion> {
    const result = await this.pool.query(
      `UPDATE suggestions
       SET status = 'approved', reviewed_at = NOW(), reviewed_by = $1, review_notes = $2
       WHERE id = $3
       RETURNING *`,
      [reviewedBy || 'system', notes, id]
    );
    return result.rows[0];
  }

  async reject(id: string, reason: string, reviewedBy?: string, notes?: string): Promise<Suggestion> {
    const result = await this.pool.query(
      `UPDATE suggestions
       SET status = 'rejected', reviewed_at = NOW(), reviewed_by = $1,
           review_notes = $2, guard_decision = jsonb_set(guard_decision, '{rejectionReason}', $3::jsonb)
       WHERE id = $4
       RETURNING *`,
      [reviewedBy || 'system', notes, JSON.stringify(reason), id]
    );
    return result.rows[0];
  }

  async findTopSuggestionForPost(postId: string): Promise<SuggestionWithDetails | null> {
    const result = await this.pool.query(
      `SELECT s.*,
              p.title as post_title, p.content as post_content,
              i.filename as image_filename,
              im.subject as image_subject, im.category as image_category,
              im.caption as image_caption, im.confidence as image_confidence
       FROM suggestions s
       JOIN posts p ON s.post_id = p.id
       JOIN images i ON s.image_id = i.id
       LEFT JOIN image_metadata im ON i.id = im.image_id
       WHERE s.post_id = $1 AND s.status = 'pending'
       ORDER BY s.similarity_score DESC
       LIMIT 1`,
      [postId]
    );

    if (!result.rows[0]) return null;

    return this.mapRowToSuggestionWithDetails(result.rows[0]);
  }

  private mapRowToSuggestionWithDetails(row: any): SuggestionWithDetails {
    return {
      id: row.id,
      postId: row.post_id,
      imageId: row.image_id,
      similarityScore: row.similarity_score,
      confidenceScore: row.confidence_score,
      status: row.status,
      guardDecision: row.guard_decision,
      reviewedAt: row.reviewed_at,
      reviewedBy: row.reviewed_by,
      reviewNotes: row.review_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      post: {
        id: row.post_id,
        title: row.post_title,
        content: row.post_content,
      },
      image: {
        id: row.image_id,
        filename: row.image_filename,
        metadata: row.image_subject ? {
          subject: row.image_subject,
          category: row.image_category,
          caption: row.image_caption,
          confidence: row.image_confidence,
        } : undefined,
      },
    };
  }
}
