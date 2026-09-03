-- Relevix Database Schema
-- Initial migration for AI Image Relevance Engine

-- Enable pgvector for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Images table
CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    original_path TEXT NOT NULL,
    processed_path TEXT,
    width INTEGER,
    height INTEGER,
    mime_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Image metadata from vision model
CREATE TABLE image_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    subject VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    attributes JSONB NOT NULL DEFAULT '[]',
    caption TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    raw_vision_output TEXT,
    vision_model VARCHAR(100),
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(image_id)
);

-- Image embeddings for semantic search
CREATE TABLE image_vectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    embedding vector(768) NOT NULL,
    embedding_model VARCHAR(100) NOT NULL,
    embedding_dimension INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(image_id)
);

-- Blog posts
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    tags JSONB DEFAULT '[]',
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post embeddings for semantic search
CREATE TABLE post_vectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    embedding vector(768) NOT NULL,
    embedding_model VARCHAR(100) NOT NULL,
    embedding_dimension INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id)
);

-- Processing jobs for background tasks
CREATE TABLE processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('vision', 'embedding', 'batch')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retrying')),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('image', 'post')),
    entity_id UUID NOT NULL,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI cost tracking
CREATE TABLE ai_cost_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES processing_jobs(id) ON DELETE SET NULL,
    operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('vision', 'embedding')),
    provider VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('image', 'post')),
    entity_id UUID NOT NULL,
    tokens_used INTEGER,
    estimated_cost_usd DECIMAL(10,6) NOT NULL,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Image suggestions for posts
CREATE TABLE suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    similarity_score DECIMAL(5,4) NOT NULL,
    confidence_score DECIMAL(3,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    guard_decision JSONB NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by VARCHAR(100),
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_images_created_at ON images(created_at);
CREATE INDEX idx_image_metadata_image_id ON image_metadata(image_id);
CREATE INDEX idx_image_metadata_category ON image_metadata(category);
CREATE INDEX idx_image_metadata_subject ON image_metadata(subject);
CREATE INDEX idx_image_vectors_image_id ON image_vectors(image_id);
CREATE INDEX idx_image_vectors_embedding ON image_vectors USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_post_vectors_post_id ON post_vectors(post_id);
CREATE INDEX idx_post_vectors_embedding ON post_vectors USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
CREATE INDEX idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX idx_processing_jobs_entity ON processing_jobs(entity_type, entity_id);
CREATE INDEX idx_processing_jobs_type_status ON processing_jobs(type, status);
CREATE INDEX idx_ai_cost_records_job_id ON ai_cost_records(job_id);
CREATE INDEX idx_ai_cost_records_created_at ON ai_cost_records(created_at);
CREATE INDEX idx_ai_cost_records_entity ON ai_cost_records(entity_type, entity_id);
CREATE INDEX idx_suggestions_post_id ON suggestions(post_id);
CREATE INDEX idx_suggestions_image_id ON suggestions(image_id);
CREATE INDEX idx_suggestions_status ON suggestions(status);
CREATE INDEX idx_suggestions_post_status ON suggestions(post_id, status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processing_jobs_updated_at BEFORE UPDATE ON processing_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suggestions_updated_at BEFORE UPDATE ON suggestions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
