# Page Pulse API

A production-grade URL audit service built for the Digital Heroes qualification task. It checks target URL load times, handles caching, rate-limits requests, and returns structured performance metrics.

---

## 🔗 Project Links & Docs

- **Live Deployed Production URL**: [https://page-pulse-api-theta.vercel.app/](https://page-pulse-api-theta.vercel.app/)
- **GitHub Repository**: [https://github.com/kaushal19097/page-pulse-api](https://github.com/kaushal19097/page-pulse-api)
- **Local Base URL**: `http://localhost:3000`
- **Technical Implementation Plan**: [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
- **System Architecture & Scale Plan**: [architecture.md](./architecture.md)

---

## ⚡ Key Features

- **Strict URL Validation**: Uses Zod to validate input URLs and enforce `http://` or `https://` protocol checks.
- **Concurrency Bounds & Timeouts**: Caps active requests (`MAX_CONCURRENT_AUDITS`) and enforces a 5-second fetch timeout (`AUDIT_TIMEOUT_MS`).
- **Response Caching**: Caches audit results using NodeCache with `X-Cache: HIT` / `MISS` headers to save bandwidth and speed up responses.
- **IP Rate Limiting**: Protects endpoints using `express-rate-limit` with standard `RateLimit-*` headers.
- **Structured JSON Logs**: Uses Pino for structured logging with correlation IDs (`X-Request-Id`).
- **Automated CI/CD**: Runs Jest unit tests and TypeScript builds on GitHub Actions for Node 18 & 20.

---

## ⚙️ Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Server HTTP port |
| `CACHE_TTL_SECONDS` | `60` | Cache TTL duration in seconds |
| `RATE_LIMIT_MAX` | `100` | Max requests per 15-minute window per IP |
| `MAX_CONCURRENT_AUDITS` | `50` | Max simultaneous outbound fetches |
| `AUDIT_TIMEOUT_MS` | `5000` | Outbound request timeout in milliseconds |

---

## 📖 API Contract

### 1. Audit Endpoint
`GET /api/audit?url=<target_url>`

Audits the given URL and returns performance metrics.

#### Request Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `url` | String | Yes | Target URL starting with `http://` or `https://` |

#### Response Headers
- `X-Request-Id`: Unique UUID for request tracking
- `X-Cache`: `HIT` if served from cache, `MISS` if freshly audited
- `RateLimit-Limit`: Total allowed requests per window
- `RateLimit-Remaining`: Remaining request quota

#### Example Response (200 OK)
```json
{
  "url": "https://example.com",
  "status": 200,
  "responseTimeMs": 142,
  "contentLength": 1256,
  "timestamp": "2026-07-25T12:00:00.000Z"
}
```

#### Example Validation Error (400 Bad Request)
```json
{
  "error": "Invalid Input",
  "details": [
    {
      "path": "url",
      "message": "URL must start with http:// or https://"
    }
  ]
}
```

---

### 2. Health Check
`GET /health`

#### Response (200 OK)
```json
{
  "status": "ok",
  "timestamp": "2026-07-25T12:00:00.000Z"
}
```

---

## 🛠️ How to Build and Run Locally

```bash
# Install dependencies
npm install

# Run Jest tests
npm test

# Build TypeScript output
npm run build

# Start production server
npm start
```

---

## 🧪 Testing Guide

### 1. Browser Test Links
- **Live Production Endpoints**:
  - **Landing Page & Attribution**: https://page-pulse-api-theta.vercel.app/
  - **Audit Endpoint**: https://page-pulse-api-theta.vercel.app/api/audit?url=https://example.com
  - **Health Check**: https://page-pulse-api-theta.vercel.app/health
  - **Validation Test**: https://page-pulse-api-theta.vercel.app/api/audit?url=invalid-url

- **Local Development Endpoints (port 3000)**:
  - **Audit Endpoint**: [http://localhost:3000/api/audit?url=https://example.com](http://localhost:3000/api/audit?url=https://example.com)
  - **Health Check**: [http://localhost:3000/health](http://localhost:3000/health)

### 2. Terminal Commands (`curl`)

```bash
# Live Production Request (Cache MISS / HIT)
curl -i "https://page-pulse-api-theta.vercel.app/api/audit?url=https://example.com"

# Live Health Check Probe
curl -i "https://page-pulse-api-theta.vercel.app/health"

# Local Request (Cache MISS / HIT)
curl -i "http://localhost:3000/api/audit?url=https://example.com"

# Validation Error - Missing Parameter (HTTP 400)
curl -i "http://localhost:3000/api/audit"

# Validation Error - Invalid Protocol (HTTP 400)
curl -i "http://localhost:3000/api/audit?url=ftp://example.com"
```

---

## 🤖 AI Tools & Changes Made

I used AI tools (Gemini and Claude) to help write initial Express boilerplate code, draft the architecture flowchart, and list potential edge cases like cache stampedes and target website rate limiting. After reviewing the generated code, I updated it to add strict Zod protocol validation for `http://` and `https://`, tuned `express-rate-limit` headers, added active concurrency limits to `auditService.ts`, configured structured Pino log formatting with request tracking UUIDs, and wrote unit tests to ensure full test coverage.

---

## 📄 Mandatory Credit Line
This service includes a landing page at `GET /` with the required credit line:
> Built for Digital Heroes Training Task. Linked to [digitalheroesco.com](https://digitalheroesco.com)
