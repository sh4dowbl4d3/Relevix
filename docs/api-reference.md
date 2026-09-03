# Relevix API Reference

## Base URL

```
http://localhost:3000
```

## Authentication

No authentication required for this capstone demo.

## Endpoints

### Health Check

```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "service": "relevix",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Get Images for Post

```
GET /api/posts/:id/images
```

**Parameters:**
- `id` (path, required): UUID of the post
- `limit` (query, optional): Number of suggestions (default: 10)
- `minSimilarity` (query, optional): Minimum similarity threshold

**Response:**
```json
{
  "success": true,
  "data": {
    "postId": "550e8400-e29b-41d4-a716-446655440000",
    "suggestions": [
      {
        "imageId": "...",
        "filename": "red-fox.jpg",
        "subject": "red fox",
        "category": "animal",
        "caption": "A red fox in autumn colors",
        "similarity": 0.85,
        "confidence": 0.95,
        "guardDecision": {
          "accepted": true,
          "reason": "Image matches post content with sufficient confidence",
          "categoryMatch": true
        }
      }
    ],
    "topSuggestion": {
      "imageId": "...",
      "similarity": 0.85,
      "confidence": 0.95,
      "accepted": true,
      "reason": "Image matches post content with sufficient confidence"
    },
    "noConfidentMatch": false
  }
}
```

### Approve Suggestion

```
POST /api/suggestions/:suggestionId/approve
```

**Body:**
```json
{
  "notes": "Optional review notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "status": "approved",
    "reviewedAt": "2024-01-01T00:00:00.000Z",
    "reviewedBy": "api-user"
  }
}
```

### Reject Suggestion

```
POST /api/suggestions/:suggestionId/reject
```

**Body:**
```json
{
  "reason": "Subject mismatch: expected fox, detected wolf",
  "notes": "Optional review notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "status": "rejected",
    "reviewedAt": "2024-01-01T00:00:00.000Z",
    "reviewedBy": "api-user"
  }
}
```

### Get Suggestion Details

```
GET /api/suggestions/:suggestionId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "postId": "...",
    "imageId": "...",
    "similarityScore": 0.85,
    "confidenceScore": 0.95,
    "status": "pending",
    "guardDecision": {
      "accepted": true,
      "reason": "Image matches post content",
      "categoryMatch": true,
      "subjectSimilarity": 0.8,
      "overallConfidence": 0.85
    },
    "post": {
      "id": "...",
      "title": "Fox Article",
      "content": "About red foxes..."
    },
    "image": {
      "id": "...",
      "filename": "red-fox.jpg",
      "metadata": {
        "subject": "red fox",
        "category": "animal",
        "caption": "A red fox",
        "confidence": 0.95
      }
    }
  }
}
```

### Batch Process

```
POST /api/batch/process
```

**Query Parameters:**
- `entityType` (required): 'image' or 'post'
- `limit` (optional): Number of items to process (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProcessed": 10,
    "successful": 8,
    "failed": 2,
    "skipped": 0,
    "errors": ["Image ...: Vision API error"]
  }
}
```

### Get Job Status

```
GET /api/jobs/:jobId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "...",
    "type": "vision",
    "status": "completed",
    "entityType": "image",
    "entityId": "...",
    "attempts": 1,
    "startedAt": "2024-01-01T00:00:00.000Z",
    "completedAt": "2024-01-01T00:00:01.000Z"
  }
}
```

### Get Budget Status

```
GET /api/budget
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dailyVisionCalls": 15,
    "dailyEmbeddingCalls": 45,
    "dailyCostUsd": 0.15,
    "visionLimit": 100,
    "embeddingLimit": 500,
    "budgetLimit": 5.00,
    "visionRemaining": 85,
    "embeddingRemaining": 455,
    "budgetRemaining": 4.85
  }
}
```

### Get Cost Tracking

```
GET /api/costs
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCostUsd": 0.15,
    "visionCalls": 15,
    "embeddingCalls": 45,
    "averageVisionCost": 0.001,
    "averageEmbeddingCost": 0.0001
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Error Codes

- `INVALID_PARAMS`: Invalid path parameters
- `INVALID_QUERY`: Invalid query parameters
- `INVALID_BODY`: Invalid request body
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Request validation failed
- `BUDGET_EXCEEDED`: Daily budget limit reached
- `BATCH_FAILED`: Batch processing failed
- `INTERNAL_ERROR`: Unexpected server error
