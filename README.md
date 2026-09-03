# Relevix — AI Image Relevance Engine

Relevix is an AI system that understands an image library and matches the right image to the right blog post based on semantic meaning rather than filenames or keyword overlap.

## Problem

Blog posts need relevant images, but traditional matching fails:
- Filename matching misses semantic relationships
- Keyword overlap doesn't understand concepts
- Visually similar images can be semantically wrong

## Solution

Relevix uses AI to:
1. **Understand images**: Vision models extract structured metadata
2. **Capture meaning**: Embedding models generate semantic vectors
3. **Match intelligently**: Cosine similarity finds related content
4. **Guard against errors**: Mismatch guard rejects wrong matches
5. **Explain decisions**: Human-readable rejection reasons

## Key Behavior

- A post about red foxes surfaces a red fox image
- A visually similar wolf image is rejected
- A generic dog image ranks significantly lower
- If no candidate is good enough, returns "no confident match"
- Every rejection has an explanation

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      HTTP/API Layer                         │
│  Express routes, Zod validation, error handling             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  Use cases: MatchImages, IngestImage, GenerateEmbedding    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Domain Layer                             │
│  Entities, MismatchGuard, BudgetGuard                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                        │
│  PostgreSQL + pgvector, AI providers, Repositories         │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

- **Runtime**: Node.js + TypeScript
- **API**: Express
- **Database**: PostgreSQL + pgvector
- **Validation**: Zod
- **AI**: Gemini Flash (vision) + Gemini Embeddings

## Setup

```bash
# Clone and install
git clone <repo-url>
cd relevix
npm install

# Start PostgreSQL
docker-compose up -d

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run migrations
npm run migrate

# Seed evaluation posts
npm run seed

# Process images (place images in images/ first)
npm run batch

# Start server
npm run dev
```

## API Overview

### Get Images for Post
```
GET /api/posts/:id/images?limit=10
```

Response includes ranked suggestions with guard decisions.

### Approve/Reject Suggestion
```
POST /api/suggestions/:id/approve
POST /api/suggestions/:id/reject
```

### Batch Processing
```
POST /api/batch/process?entityType=image&limit=10
```

### Budget Status
```
GET /api/budget
```

## Mismatch Guard

The guard evaluates four criteria:

1. **Similarity Threshold**: Cosine similarity must exceed minimum
2. **Confidence Threshold**: Image classification confidence must be sufficient
3. **Category Match**: Image category must align with post topic
4. **Subject Relevance**: Image subject must match post keywords

If any criterion fails, the candidate is rejected with an explanation.

## Evaluation

### Methodology
- 12 labeled evaluation posts
- Each post has one correct image category
- Top-1 precision measures if the top suggestion matches

### Results
```
Top-1 Precision: XX.X%
```
(Actual measured value from evaluation script)

## Limitations

1. **Dataset Size**: Optimized for small corpus (40+ images)
2. **Single Vision Model**: Using one model for simplicity
3. **Manual Seeding**: Images must be placed in directory

## Evidence

See [EVIDENCE.md](EVIDENCE.md) for detailed proof of requirements.

## License

MIT
