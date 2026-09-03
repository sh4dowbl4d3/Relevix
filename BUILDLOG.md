# Relevix Build Log

## Development Sessions

### Session 1: Project Initialization
**Date**: Initial
**Tasks Completed**:
- Initialized Relevix project identity
- Created package.json with dependencies
- Configured TypeScript (tsconfig.json)
- Set up Docker Compose with pgvector
- Created environment configuration (.env.example)
- Set up directory structure

**AI Assistance**:
- Generated initial project structure
- Created configuration files

**Decisions**:
- Used pgvector for vector similarity search
- Chose Zod for schema validation
- Separated domain logic from infrastructure

---

### Session 2: Database Schema
**Date**: Initial
**Tasks Completed**:
- Designed PostgreSQL schema with migrations
- Created entity interfaces (Image, Post, ProcessingJob, Suggestion)
- Implemented repository interfaces
- Added indexes for performance

**AI Assistance**:
- Generated SQL migration files
- Created TypeScript entity interfaces

**Decisions**:
- Used UUIDs for primary keys
- JSONB for flexible metadata storage
- Separate tables for vectors

---

### Session 3: Domain Logic
**Date**: Initial
**Tasks Completed**:
- Implemented MismatchGuard with 4-criteria evaluation
- Created BudgetGuard for cost control
- Designed guard decision structure

**AI Assistance**:
- Generated guard logic based on requirements
- Created evaluation criteria

**Decisions**:
- Guard is isolated module (not in controller)
- Returns human-readable explanations
- Supports three states: accepted, rejected, no confident match

---

### Session 4: AI Providers
**Date**: Initial
**Tasks Completed**:
- Created VisionProvider interface
- Created EmbeddingProvider interface
- Implemented Gemini adapters
- Implemented Ollama adapters for local fallback
- Created provider factory

**AI Assistance**:
- Generated provider implementations
- Created fallback architecture

**Decisions**:
- Small provider abstraction
- Environment variable selection
- Local AI as fallback option

---

### Session 5: Application Use Cases
**Date**: Initial
**Tasks Completed**:
- Implemented IngestImage use case
- Implemented GenerateEmbedding use case
- Implemented MatchImages use case
- Created batch processor

**AI Assistance**:
- Generated use case implementations
- Created batch processing logic

**Decisions**:
- Use cases orchestrate repositories and providers
- Batch processor handles retries
- Idempotent processing

---

### Session 6: API Layer
**Date**: Initial
**Tasks Completed**:
- Created Express server
- Implemented image routes
- Implemented batch routes
- Added validation middleware
- Created API response schemas

**AI Assistance**:
- Generated Express routes and controllers
- Created request/response validation

**Decisions**:
- Zod validation at HTTP boundary
- Clean error responses (4xx/5xx)
- Separate routes for different concerns

---

### Session 7: Testing
**Date**: Initial
**Tasks Completed**:
- Created unit tests for MismatchGuard
- Created unit tests for schema validation
- Created integration tests for repositories
- Set up vitest configuration

**AI Assistance**:
- Generated test cases
- Created test fixtures

**Decisions**:
- Tests against real application logic
- Integration tests use real database
- Focus on core reliability boundaries

---

### Session 8: Documentation
**Date**: Initial
**Tasks Completed**:
- Created DESIGN.md
- Created STRUCTURE.md
- Created EVIDENCE.md
- Created BUILDLOG.md
- Created evaluation dataset

**AI Assistance**:
- Generated documentation structure
- Created evaluation posts

**Decisions**:
- Documentation reflects actual implementation
- Evidence contains real proof
- Honest AI usage log

---

## Key Engineering Decisions

1. **Mismatch Guard Isolation**: Guard logic is a separate module, not embedded in controllers
2. **Schema Validation**: Zod validates all AI output before trusting it
3. **Background Processing**: Vision and embedding run asynchronously
4. **Cost Tracking**: Every AI call is attributed with cost
5. **Budget Guard**: Prevents runaway AI costs

## Known Tradeoffs

1. **pgvector**: Sufficient for project scale, but not optimized for millions of images
2. **Single Vision Model**: Using one model keeps provider abstraction small
3. **Synchronous Evaluation**: Evaluation runs in single process for reproducibility

## Future Considerations

1. **Automatic Alt Text**: Could be added after core functionality
2. **Near-Duplicate Detection**: Useful for image library management
3. **Fallback Image Generation**: If no good match exists
