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

## Technology Stack

- **Runtime**: Node.js + TypeScript
- **API**: Express
- **Database**: PostgreSQL + pgvector
- **Validation**: Zod
- **AI**: Gemini Flash (vision) + Gemini Embeddings

## Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- npm

### Step 1: Clone and Install
```bash
git clone https://github.com/sh4dowbl4d3/Relevix.git
cd Relevix
npm install
```

### Step 2: Start PostgreSQL
```bash
docker-compose up -d
```
Wait ~10 seconds for PostgreSQL to be ready. Verify with:
```bash
pg_isready -h 127.0.0.1 -p 5433 -U relevix -d relevix
```

### Step 3: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your settings. For local development without AI keys:
```
DB_PORT=5433
USE_LOCAL_AI=true
SIMILARITY_THRESHOLD=0.4
```

### Step 4: Build TypeScript
```bash
npm run build
```

### Step 5: Seed Database
```bash
# Seed 12 evaluation posts
npm run seed

# Seed 38 images with metadata and embeddings
npm run seed:images

# Seed post embeddings
npm run seed:post-embeddings
```

### Step 6: Start Server
```bash
npm run dev
```
Server runs at http://localhost:3000

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

### All Commands Reference
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
Top-1 Precision: 75.0%
Total posts evaluated: 12
Correct predictions: 9
```
Evaluated on 12 labeled posts across 5 categories (fox, wolf, dog, bear, deer).

### Analysis
- **Correct matches**: Fox posts rank fox images, wolf posts rank wolf images
- **Cross-category rejection**: Wolf images rejected for fox posts
- **No confident match**: Posts without matching images in library return "no confident match"
- **Failed cases**: Arctic fox (close match), forest/wildlife (no images in library)

## Limitations

1. **Dataset Size**: Optimized for small corpus (40+ images)
2. **Single Vision Model**: Using one model for simplicity
3. **Manual Seeding**: Images must be placed in directory

## Evidence

See [EVIDENCE.md](EVIDENCE.md) for detailed proof of requirements.

## License

This project is licensed under the [MIT License](LICENSE).
