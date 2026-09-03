import { Post, PostVector, PostWithVector } from '../entities/Post.js';

export interface PostRepository {
  findById(id: string): Promise<Post | null>;
  create(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post>;
  update(id: string, updates: Partial<Post>): Promise<Post | null>;
  findAll(limit?: number, offset?: number): Promise<Post[]>;
  findWithVector(id: string): Promise<PostWithVector | null>;
  findAllWithVectors(limit?: number, offset?: number): Promise<PostWithVector[]>;

  saveVector(vector: Omit<PostVector, 'id' | 'createdAt'>): Promise<PostVector>;
  getVector(postId: string): Promise<PostVector | null>;
  updateVector(postId: string, embedding: number[]): Promise<PostVector | null>;
}
