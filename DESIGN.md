# Relevix Design Document

## Problem

Blog posts need relevant images, but filename matching and keyword overlap fail to capture semantic meaning. A post about "red foxes" should match a red fox image, not a visually similar wolf or a generic dog image.

## Solution

Relevix uses AI vision models to understand image content and embedding models to capture semantic meaning. A mismatch guard ensures only semantically correct matches are recommended, with human-readable explanations for rejections.

## Data Model

### Core Entities

```
images
  ├── id (UUID)
  ├── filename
  ├── original_path
  └── metadata (1:1) → image_metadata
       ├── subject
       ├── category
       ├── attributes (JSONB)
       ├── caption
       └── confidence (0-1)

posts
  ├── id (UUID)
  ├── title
  ├── content
  └── vector (1:1) → post_vectors
       └── embedding (vector)

suggestions
  ├── post_id
  ├── image_id
  ├── similarity_score
  ├── confidence_score
  ├── status (pending/approved/rejected)
  └── guard_decision (JSONB)
```

## API Surface

```
GET  /api/posts/:id/images     → ranked suggestions with guard decisions
POST /api/suggestions/:id/approve
POST /api/suggestions/:id/reject
GET  /api/suggestions/:id      → detailed suggestion inspection
POST /api/batch/process        → trigger batch processing
GET  /api/jobs/:jobId          → check job status
GET  /api/budget               → budget status
GET  /api/costs                → cost tracking
GET  /health                   → service health
```

## Layer Architecture

```
HTTP/API
  ↓
Controllers (validation, response formatting)
  ↓
Use Cases (MatchImages, IngestImage, GenerateEmbedding)
  ↓
Domain Logic (MismatchGuard, BudgetGuard)
  ↓
Repositories (PostgresImageRepository, etc.)
  ↓
PostgreSQL + pgvector
```

## Matching Strategy

1. Generate embedding for post content
2. Find similar image embeddings using cosine similarity
3. Rank by similarity score
4. Apply mismatch guard to each candidate
5. Return accepted suggestions or "no confident match"

## Mismatch Guard Rules

The guard evaluates four criteria:

1. **Similarity Threshold**: Must exceed minimum cosine similarity (default: 0.5)
2. **Confidence Threshold**: Image classification confidence must be sufficient (default: 0.4)
3. **Category Match**: Image category must align with post topic
4. **Subject Relevance**: Image subject must match post keywords (e.g., fox post needs fox image)

If any criterion fails, the candidate is rejected with an explanation.

## Background Jobs

- Vision processing runs asynchronously
- Embedding generation is batched
- Jobs have retry logic with exponential backoff
- Failed jobs are tracked with error messages

## AI Cost Tracking

Every AI call records:
- Operation type (vision/embedding)
- Provider and model
- Entity processed
- Tokens used
- Estimated cost
- Success/failure status

Daily budget limits prevent runaway costs.

## Non-Goals

- Full frontend application
- User authentication
- Payment processing
- Cloud infrastructure
- Enterprise features
- Automatic image generation
