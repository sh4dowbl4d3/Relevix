# Relevix Evidence

## Test Results

```
Test Files  8 passed | 1 skipped (9)
     Tests  50 passed | 7 skipped (57)
  Duration  1.06s
```

## Schema Validation

### Test: Valid Vision Output
```
✓ should accept valid vision output
✓ should validate and return clean metadata
```

### Test: Invalid Vision Output Rejected
```
✓ should reject output with missing fields
✓ should reject output with extra fields
✓ should throw on invalid output
```

## Mismatch Guard

### Test: Fox vs Wolf Rejection
```
✓ should reject a wolf image for a fox post
✓ should accept a red fox image for a fox post
```

### Test: No Confident Match
```
✓ should reject when similarity is below threshold
✓ should reject when confidence is below threshold
```

## Budget Guard

```
✓ should allow operations within budget
✓ should reject when vision calls exceed limit
✓ should reject when embedding calls exceed limit
✓ should reject when cost exceeds budget
✓ should return budget status
```

## Match Images Use Case

```
✓ should throw error for non-existent post
✓ should generate embedding for post without vector
✓ should return suggestions with guard decisions
✓ should mark noConfidentMatch when no suggestions accepted
```

## Acceptance Probes

### PROBE 1: Schema Validation
```
✓ should validate correct vision output
✓ should reject low confidence classification
✓ should reject invalid output structure
```

### PROBE 2: Fox Article Query
```
✓ should rank fox image first for fox post
✓ should rank wolf lower than fox
✓ should rank dog significantly lower
```

### PROBE 3: Wolf Candidate Rejection
```
✓ should reject wolf for fox post with explanation
```

### PROBE 4: No Confident Match
```
✓ should reject when similarity below threshold
✓ should reject when confidence below threshold
```

### PROBE 6: Cost Tracking
```
✓ should have cost record structure
```

## Database Integration (Requires PostgreSQL)

```
↓ tests/integration/api.test.ts (7 tests | 7 skipped)
```
Skipped because PostgreSQL is not running in test environment.

## API Endpoints

### Health Check
```bash
curl http://localhost:3000/health
# Response: {"status":"ok","service":"relevix","timestamp":"..."}
```

### Get Images for Post
```bash
curl http://localhost:3000/api/posts/:id/images
# Response: {success: true, data: {suggestions: [...], noConfidentMatch: false}}
```

### Budget Status
```bash
curl http://localhost:3000/api/budget
# Response: {success: true, data: {dailyVisionCalls: 0, budgetRemaining: 5.00}}
```

## Evaluation

### Top-1 Precision
```
Evaluation Results:
Total posts evaluated: 12
Correct top-1 predictions: X
Top-1 Precision: XX.X%
```
(Actual results will be populated after running evaluation with database)
