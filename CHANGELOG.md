# Changelog

All notable changes to Relevix will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-01

### Added

- Initial Relevix backend implementation
- Express + TypeScript + PostgreSQL + pgvector architecture
- Zod validation for image metadata schema
- Domain entities: Image, Post, ProcessingJob, Suggestion
- Repository interfaces and PostgreSQL implementations
- Gemini and Ollama AI provider adapters
- MismatchGuard with 4-criteria evaluation
- BudgetGuard for AI cost control
- BatchProcessor for async image processing
- MatchImages use case for semantic matching
- IngestImage use case for image processing
- GenerateEmbedding use case for vector generation
- API routes for matching and review workflow
- Admin routes for suggestion inspection
- Error handling middleware
- Request validation middleware
- Rate limiting middleware
- Request logging middleware
- Unit tests for core functionality
- Integration tests for repository layer
- API endpoint tests
- Evaluation dataset with 12 labeled posts
- Documentation: README, STRUCTURE, DESIGN, EVIDENCE, BUILDLOG
- API reference documentation
- Docker Compose configuration
- Environment variable configuration

### Changed

- N/A (initial release)

### Deprecated

- N/A

### Removed

- N/A

### Fixed

- N/A

### Security

- Environment variable validation
- Input validation at API boundary
- Error messages without stack traces
- No sensitive data in responses
