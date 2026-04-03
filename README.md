# AI-Powered Support Ticket Triage

Local full-stack support ticket triage app with heuristic AI-style classification, SQLite persistence, React UI, tests, and Docker support.

## Stack

- Backend: Node.js, Express, TypeScript, `sql.js`
- Frontend: React, TypeScript, Vite
- Persistence: SQLite database file persisted locally at `backend/data/tickets.sqlite`
- Tests: Vitest + Supertest

## Features

- `POST /tickets/analyze` to analyze and persist a support ticket
- `GET /tickets` to fetch recent tickets, latest first
- Local keyword-based classification for Billing, Technical, Account, Feature Request, and Other
- Priority scoring from urgency and severity signals
- Confidence scoring based on keyword matches
- Keyword extraction and urgency detection
- Custom security escalation rule
- Responsive frontend with loading and error states

## Run Locally

### Option 1: Docker Compose

```bash
docker-compose up --build
```

Apps:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

### Option 2: Without Docker

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## API

### `POST /tickets/analyze`

Request:

```json
{
  "message": "Urgent: customers cannot log in and suspect unauthorized access."
}
```

Response includes:

- `category`
- `priority`
- `confidence`
- `signals.urgencyDetected`
- `signals.keywords`
- `signals.customRuleTriggered`

### `GET /tickets`

Returns recent persisted tickets in descending order by creation time.

## Architecture

- `backend/src/controllers`: request validation and HTTP responses
- `backend/src/services`: application workflow orchestration
- `backend/src/analyzer`: local NLP / heuristic classification logic
- `backend/src/config`: config-driven keyword rules
- `backend/src/repositories`: SQLite read/write operations
- `frontend/src/App.tsx`: submission flow and ticket history UI

## Custom Rule

Security-related phrases such as `security`, `breach`, `hacked`, and `unauthorized access` trigger a custom escalation rule. This raises the priority to at least `P1`, and to `P0` when paired with urgency terms like `urgent` or `asap`.

Rationale:

- Security incidents usually deserve faster triage than generic technical bugs.
- This keeps the customization simple, explainable, and easy to demo without external AI.

Suggested demo example:

```text
Urgent: we suspect unauthorized access and a security breach in production.
```

## Tests

Backend tests cover:

- Billing classification
- Feature request classification
- Custom security escalation
- API validation and ticket creation/list flow

Run:

```bash
cd backend
npm test
```

## Reflection

I chose a small Express + React architecture because it is easy to reason about, fast to run locally, and maps cleanly to the assignment requirements. The data model stores the original message plus the derived analysis fields so the UI can render a full audit trail without recomputing results. Keeping the API limited to `POST /tickets/analyze` and `GET /tickets` keeps the contract focused and matches the two main user actions in the interface.

For the AI logic, I used config-driven keyword rules because the assignment explicitly disallows external AI APIs and prioritizes correctness and reliability. This approach is transparent, testable, and easy to extend, but it is also limited: it will miss nuanced language, can misclassify ambiguous tickets, and does not learn from feedback. With more time, I would improve phrase matching, introduce weighted rules per category, add pagination and filters to the ticket list, expand tests, and serve the frontend through a production web server image rather than a simple static server. I would also add a short seeded dataset and record a demo video showing the custom security rule moving a ticket from ordinary technical handling into a high-priority security workflow.
