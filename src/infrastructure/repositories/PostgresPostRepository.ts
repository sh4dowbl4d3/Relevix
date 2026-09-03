import { Pool } from 'pg';
import { PostRepository } from '../../domain/repositories/PostRepository.js';
import { Post, PostVector, PostWithVector } from '../../domain/entities/Post.js';

export class PostgresPostRepository implements PostRepository {
  constructor(private pool: Pool) {}

  async findById(id: string): Promise<Post | null> {
    const result = await this.pool.query(
      'SELECT * FROM posts WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    const result = await this.pool.query(
      `INSERT INTO posts (title, content, excerpt, tags, category)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [post.title, post.content, post.excerpt, JSON.stringify(post.tags || []), post.category]
    );
    return result.rows[0];
  }

  async update(id: string, updates: Partial<Post>): Promise<Post | null> {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.title !== undefined) {
      setClauses.push(`title = $${paramIndex++}`);
      values.push(updates.title);
    }
    if (updates.content !== undefined) {
      setClauses.push(`content = $${paramIndex++}`);
      values.push(updates.content);
    }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE posts SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async findAll(limit = 100, offset = 0): Promise<Post[]> {
    const result = await this.pool.query(
      'SELECT * FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  async findWithVector(id: string): Promise<PostWithVector | null> {
    const result = await this.pool.query(
      `SELECT p.*,
              pv.id as vector_id, pv.embedding, pv.embedding_model, pv.embedding_dimension
       FROM posts p
       LEFT JOIN post_vectors pv ON p.id = pv.post_id
       WHERE p.id = $1`,
      [id]
    );

    if (!result.rows[0]) return null;

    const row = result.rows[0];
    const post: Post = {
      id: row.id,
      title: row.title,
      content: row.content,
      excerpt: row.excerpt,
      tags: row.tags,
      category: row.category,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    const vector: PostVector | undefined = row.vector_id ? {
      id: row.vector_id,
      postId: row.id,
      embedding: row.embedding,
      embeddingModel: row.embedding_model,
      embeddingDimension: row.embedding_dimension,
      createdAt: row.created_at,
    } : undefined;

    return { ...post, vector };
  }

  async findAllWithVectors(limit = 100, offset = 0): Promise<PostWithVector[]> {
    const result = await this.pool.query(
      `SELECT p.*,
              pv.id as vector_id, pv.embedding, pv.embedding_model, pv.embedding_dimension
       FROM posts p
       LEFT JOIN post_vectors pv ON p.id = pv.post_id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows.map(row => {
      const post: Post = {
        id: row.id,
        title: row.title,
        content: row.content,
        excerpt: row.excerpt,
        tags: row.tags,
        category: row.category,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      const vector: PostVector | undefined = row.vector_id ? {
        id: row.vector_id,
        postId: row.id,
        embedding: row.embedding,
        embeddingModel: row.embedding_model,
        embeddingDimension: row.embedding_dimension,
        createdAt: row.created_at,
      } : undefined;

      return { ...post, vector };
    });
  }

  async saveVector(vector: Omit<PostVector, 'id' | 'createdAt'>): Promise<PostVector> {
    const embeddingString = `[${vector.embedding.join(',')}]`;
    const result = await this.pool.query(
      `INSERT INTO post_vectors (post_id, embedding, embedding_model, embedding_dimension)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (post_id)
       DO UPDATE SET embedding = $2, embedding_model = $3, embedding_dimension = $4
       RETURNING *`,
      [vector.postId, embeddingString, vector.embeddingModel, vector.embeddingDimension]
    );
    return result.rows[0];
  }

  async getVector(postId: string): Promise<PostVector | null> {
    const result = await this.pool.query(
      'SELECT * FROM post_vectors WHERE post_id = $1',
      [postId]
    );
    return result.rows[0] || null;
  }

  async updateVector(postId: string, embedding: number[]): Promise<PostVector | null> {
    const embeddingString = `[${embedding.join(',')}]`;
    const result = await this.pool.query(
      `UPDATE post_vectors SET embedding = $1 WHERE post_id = $2 RETURNING *`,
      [embeddingString, postId]
    );
    return result.rows[0] || null;
  }
}
