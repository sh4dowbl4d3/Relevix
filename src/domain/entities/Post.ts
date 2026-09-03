export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostVector {
  id: string;
  postId: string;
  embedding: number[];
  embeddingModel: string;
  embeddingDimension: number;
  createdAt: Date;
}

export interface PostWithVector extends Post {
  vector?: PostVector;
}
