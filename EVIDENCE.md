# Relevix Evidence

## Schema Validation

### Test: Valid Vision Output
```
PASS tests/unit/image-metadata-validation.test.ts
  ✓ should accept valid vision output
  ✓ should validate and return clean metadata
```

### Test: Invalid Vision Output Rejected
```
PASS tests/unit/image-metadata-validation.test.ts
  ✓ should reject output with missing fields
  ✓ should reject output with extra fields
  ✓ should throw on invalid output
```

## Mismatch Guard

### Test: Fox vs Wolf Rejection
```
PASS tests/unit/mismatch-guard.test.ts
  ✓ should reject a wolf image for a fox post
  ✓ should accept a red fox image for a fox post
```

### Test: No Confident Match
```
PASS tests/unit/mismatch-guard.test.ts
  ✓ should reject when similarity is below threshold
  ✓ should reject when confidence is below threshold
```

## Database Integration

### Test: Image CRUD
```
PASS tests/integration/api.test.ts
  ✓ should create and retrieve an image
  ✓ should save and retrieve metadata
```

### Test: Job Tracking
```
PASS tests/integration/api.test.ts
  ✓ should create and track a job
  ✓ should track costs
```

### Test: Suggestion Workflow
```
PASS tests/integration/api.test.ts
  ✓ should create and approve a suggestion
  ✓ should reject a suggestion with reason
```

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
(Actual results will be populated after running evaluation)

## Acceptance Probes

### PROBE 1: Batch Processing
- [ ] All images have schema-valid metadata
- [ ] Low-confidence images flagged
- [ ] Invalid output rejected

### PROBE 2: Fox Article Query
- [ ] Fox image ranks first
- [ ] Wolf ranks clearly lower
- [ ] Dog ranks clearly lower

### PROBE 3: Wolf Candidate Rejection
- [ ] Mismatch guard rejects wolf
- [ ] Response contains subject mismatch explanation

### PROBE 4: No Suitable Image
- [ ] Returns "no confident match"
- [ ] Explanation provided

### PROBE 5: Evaluation Script
- [ ] Top-1 precision calculated
- [ ] Output reproducible
- [ ] README contains measured value

### PROBE 6: Cost Tracking
- [ ] Every AI call has attributed cost record
