# Relevix Structure

## What is Relevix?

Relevix is an AI Image Relevance Engine that understands an image library and matches the right image to the right blog post based on semantic meaning rather than filenames or keywords.

## Project Goal

Build a trustworthy AI decision system that:
- Good match when confident
- Safe rejection when wrong or uncertain
- Human-readable explanation for every decision

## Repository Structure

```
relevix/
├── src/
│   ├── config/              # Environment configuration with Zod validation
│   ├── api/
│   │   ├── routes/          # Express route definitions
│   │   ├── controllers/     # Request handlers
│   │   ├── schemas/         # Zod validation schemas
│   │   └── middleware/      # Express middleware
│   ├── application/
│   │   └── use-cases/       # Business logic orchestration
│   ├── domain/
│   │   ├── entities/        # Core data structures
│   │   ├── services/        # Domain services
│   │   └── guards/          # MismatchGuard, BudgetGuard
│   ├── infrastructure/
│   │   ├── ai/              # Vision and embedding providers
│   │   ├── database/        # PostgreSQL pool, migrations
│   │   ├── repositories/    # Data access implementations
│   │   └── jobs/            # Batch processor
│   ├── evaluation/          # Top-1 precision evaluator
│   └── server.ts            # Express application entry
├── migrations/              # SQL schema migrations
├── scripts/                 # Seed and utility scripts
├── seed/                    # Evaluation dataset
├── tests/
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── evaluation/          # Evaluation tests
├── docs/                    # Documentation
├── README.md
├── STRUCTURE.md
├── DESIGN.md
├── EVIDENCE.md
├── BUILDLOG.md
├── capstone.yaml
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

## Request Lifecycle

```
GET /posts/:id/images
  ↓
Validate request params
  ↓
Retrieve post from database
  ↓
Generate post embedding (if not cached)
  ↓
Find similar image embeddings via pgvector
  ↓
For each candidate:
  ├── Retrieve image metadata
  ├── Apply MismatchGuard
  │   ├── Check similarity threshold
  │   ├── Check confidence threshold
  │   ├── Check category match
  │   └── Check subject relevance
  └── Create suggestion record
  ↓
Return ranked suggestions OR "no confident match"
```

## Image Ingestion Flow

```
Image file
  ↓
Create image record
  ↓
Create processing job
  ↓
Vision Provider analyzes image
  ↓
Validate output with Zod schema
  ↓
Save structured metadata
  ↓
Generate embedding from metadata
  ↓
Save embedding vector
  ↓
Record AI cost
  ↓
Mark job complete
```

## Mismatch Guard

The guard is an isolated module that combines:
- Extracted image tags
- Semantic similarity scores
- Similarity thresholds
- Confidence scores
- Category/subject compatibility

It returns three possible states:
1. **Accepted**: Image is a good match
2. **Rejected**: Image is wrong (with explanation)
3. **No confident match**: No candidate meets the bar

## Background Jobs

- Batch processing runs asynchronously
- Jobs have status tracking (pending → processing → completed/failed)
- Retry with exponential backoff
- Idempotent processing (won't reprocess completed items)
- Per-call AI cost tracking

## Database Structure

PostgreSQL with pgvector extension for vector similarity search:
- images: Core image records
- image_metadata: Vision model output
- image_vectors: Image embeddings
- posts: Blog post content
- post_vectors: Post embeddings
- processing_jobs: Background job tracking
- ai_cost_records: AI usage and cost tracking
- suggestions: Match results with guard decisions

## How to Run

```bash
# Install dependencies
npm install

# Start PostgreSQL
docker-compose up -d

# Run migrations
npm run migrate

# Seed evaluation posts
npm run seed

# Process images (after placing in images/)
npm run batch

# Start API server
npm run dev

# Run evaluation
npm run evaluate

# Run tests
npm test
```
