# API documentation

## `POST /api/analyze`

Analyzes a resume against a job description. Authentication is optional. Authenticated analyses save compact report metadata.

Request:

```json
{
  "resumeText": "Extracted resume text (120–60,000 characters)",
  "jobDescription": "Job description (120–30,000 characters)",
  "fileName": "resume.pdf"
}
```

Success: `200 OK`

```json
{
  "report": {
    "overallScore": 78,
    "breakdown": {
      "skills": 75,
      "experience": 65,
      "keywords": 72,
      "education": 90,
      "projects": 85
    },
    "matchedSkills": ["React", "Python"],
    "missingSkills": ["Docker"]
  },
  "saved": false
}
```

Errors:

- `400` — missing, malformed, or insufficient input
- `500` — analysis or persistence failure

## `GET /api/history`

Returns the latest 20 analyses belonging to the signed-in user.

Responses:

- `200` — `{ "analyses": [...] }`
- `401` — visitor is not signed in
- `500` — history is temporarily unavailable
