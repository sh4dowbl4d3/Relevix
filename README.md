# Relevix: AI image relevance engine

Relevix matches blog posts with images from a library using semantic embeddings and vision metadata.

## Problem

Standard search methods often fail when selecting images for articles:
- Filename matching misses semantic context.
- Keyword matching misses conceptual relevance.
- Visually similar images may be conceptually incorrect.

## Solution

Relevix processes images and posts through an automated pipeline:
1. Vision models extract structured metadata from images.
2. Embedding models generate semantic vectors for posts and images.
3. Vector search ranks candidates using cosine similarity.
4. A mismatch guard evaluates category and confidence thresholds to reject bad matches.
5. The API returns rejection reasons alongside suggestions.

## Matching behavior

- A post about red foxes matches a red fox image.
- A visually similar wolf image is rejected.
- A generic dog image ranks lower in similarity.
- If no candidate passes the threshold, the API returns no confident match.
- Every rejected suggestion includes an explanation.

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
│  Use cases: MatchImages, IngestImage, GenerateEmbedding     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Domain Layer                             │
│  Entities, MismatchGuard, BudgetGuard                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                        │
│  PostgreSQL + pgvector, AI providers, Repositories          │
└─────────────────────────────────────────────────────────────┘
```

## Technology stack

- Runtime: Node.js and TypeScript
- API: Express
- Database: PostgreSQL with pgvector
- Validation: Zod
- AI models: Gemini Flash (vision) and Gemini Embeddings

## Setup

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- npm

### Step 1: Clone and install
```bash
git clone https://github.com/sh4dowbl4d3/Relevix.git
cd Relevix
npm install
```

### Step 2: Start PostgreSQL
```bash
docker-compose up -d
```
Wait about 10 seconds for PostgreSQL to be ready, then verify with:
```bash
pg_isready -h 127.0.0.1 -p 5433 -U relevix -d relevix
```

### Step 3: Configure environment
```bash
cp .env.example .env
```

Edit `.env` as needed. For local development without API keys:
```
DB_PORT=5433
USE_LOCAL_AI=true
SIMILARITY_THRESHOLD=0.4
```

### Step 4: Build TypeScript
```bash
npm run build
```

### Step 5: Seed database
```bash
# Seed 12 evaluation posts
npm run seed

# Seed 38 images with metadata and embeddings
npm run seed:images

# Seed post embeddings
npm run seed:post-embeddings
```

### Step 6: Start server
```bash
npm run dev
```
The server runs at http://localhost:3000.

### Step 7: Verify
```bash
# Health check
curl http://localhost:3000/health

# Get images for fox post
curl http://localhost:3000/api/posts/3c439c00-adff-4b48-889d-1616407c7418/images

# Run evaluation
npm run evaluate

# Run tests
npm test
```

### Command reference
```bash
npm run build              # Build TypeScript
npm run dev                # Start dev server
npm run start              # Start production server
npm run test               # Run all tests
npm run test:watch         # Run tests in watch mode
npm run seed               # Seed evaluation posts
npm run seed:images        # Seed images with metadata
npm run seed:post-embeddings  # Seed post embeddings
npm run reseed             # Regenerate all embeddings
npm run evaluate           # Calculate top-1 precision
npm run batch              # Process images through AI pipeline
npm run migrate            # Run database migrations
```

## API overview

### Get images for a post
```
GET /api/posts/:id/images?limit=10
```

The response includes ranked suggestions and guard decisions.

### Approve or reject a suggestion
```
POST /api/suggestions/:id/approve
POST /api/suggestions/:id/reject
```

### Batch processing
```
POST /api/batch/process?entityType=image&limit=10
```

### Budget status
```
GET /api/budget
```

## Mismatch guard

The guard evaluates candidates against four criteria:

1. Similarity threshold: cosine similarity must exceed the configured minimum.
2. Confidence threshold: image classification confidence must meet the required level.
3. Category match: image category must match the post topic.
4. Subject relevance: image subject must match post keywords.

If any check fails, the candidate is rejected with an explanation.

## Evaluation

### Methodology
- 12 labeled evaluation posts.
- Each post has one correct image category.
- Top-1 precision measures whether the top suggestion matches the expected category.

### Results
```
Top-1 Precision: 75.0%
Total posts evaluated: 12
Correct predictions: 9
```
Evaluated across 12 labeled posts in 5 categories: fox, wolf, dog, bear, and deer.

### Analysis
- Fox posts rank fox images first, and wolf posts rank wolf images first.
- The mismatch guard rejects cross-category candidates, such as wolf images for fox posts.
- Posts without a matching image in the library return no confident match.
- Failures occurred on close visual matches (arctic fox) and topics with no library coverage (general wildlife).

## Limitations

- The system is configured for a small corpus (40+ images).
- Image analysis relies on a single vision model.
- Image files must be placed manually in the images directory.

## Evidence

See [EVIDENCE.md](EVIDENCE.md) for test output and validation results.

## License

This project is licensed under the [MIT License](LICENSE).
