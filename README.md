# Ticket Classification

Next.js API project for classifying support tickets by case type, severity, and destination department.

## Project Structure

```text
ticket-classification/
├── app/
│   └── api/
│       ├── health/
│       │   └── route.ts
│       └── sort-ticket/
│           └── route.ts
├── lib/
│   └── classifier.ts
├── types/
│   └── index.ts
├── .env.example
├── .env.local
├── README.md
├── package.json
└── tsconfig.json
```

## Team Ownership

- Person 1: `app/api/health/route.ts` and `.env.local`
- Person 2: `app/api/sort-ticket/route.ts`
- Person 3: `lib/classifier.ts`
- Shared: `types/index.ts` and README documentation. asd

## API Routes

### `GET /api/health`

Returns service health information.

Example response:

```json
{
  "status": "ok",
  "service": "ticket-classification",
  "timestamp": "2026-06-25T00:00:00.000Z",
  "uptime_seconds": 12,
  "environment": "development"
}
```

### `POST /api/sort-ticket`

Classifies a support ticket and routes it to the correct department.

#### Request Schema

| Field       | Type   | Required | Description                        |
| ----------- | ------ | -------- | ---------------------------------- |
| `ticket_id` | string | ✅ Yes   | Non-empty unique ticket identifier |
| `message`   | string | ✅ Yes   | Non-empty customer message text    |
| `channel`   | string | ❌ No    | Originating channel (e.g. `"web"`) |
| `locale`    | string | ❌ No    | Locale code (e.g. `"en"`)          |

Example request body:

```json
{
  "ticket_id": "TICKET-123",
  "channel": "web",
  "locale": "en",
  "message": "Payment failed but I was charged twice."
}
```

#### Response Schema

All fields are returned at the **top level** (not wrapped in a `ticket` object).

| Field                   | Type    | Description                                                                                             |
| ----------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| `ticket_id`             | string  | Echoed from the request                                                                                 |
| `case_type`             | string  | One of: `wrong_transfer`, `payment_failed`, `refund_request`, `phishing_or_social_engineering`, `other` |
| `severity`              | string  | One of: `low`, `medium`, `high`, `critical`                                                             |
| `department`            | string  | One of: `customer_support`, `dispute_resolution`, `payments_ops`, `fraud_risk`                          |
| `agent_summary`         | string  | Human-readable summary — safety-filtered before return                                                  |
| `human_review_required` | boolean | Whether a human agent must review this ticket                                                           |
| `confidence`            | number  | Classifier confidence score between `0` and `1`                                                         |

Example response:

```json
{
  "ticket_id": "TICKET-123",
  "case_type": "payment_failed",
  "severity": "high",
  "department": "payments_ops",
  "agent_summary": "Customer reports a payment failed issue: Payment failed but I was charged twice. Current severity is high.",
  "human_review_required": false,
  "confidence": 0.63
}
```

## Local Development

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
cp .env.example .env.local
```

Run verification checks:

```bash
npm run lint
npx tsc --noEmit
```

Run the development server:

```bash
npm run dev
```

The local API will be available at [http://localhost:3000](http://localhost:3000).

Health check:

```bash
curl http://localhost:3000/api/health
```

Ticket classification:

```bash
curl -X POST http://localhost:3000/api/sort-ticket \
  -H "Content-Type: application/json" \
  -d '{"ticket_id":"T-001","message":"I was charged twice and need a refund urgently."}'
```

Missing required field (returns HTTP 400):

```bash
curl -X POST http://localhost:3000/api/sort-ticket \
  -H "Content-Type: application/json" \
  -d '{"ticket_id":"T-002"}'
```

Phishing / social engineering ticket:

```bash
curl -X POST http://localhost:3000/api/sort-ticket \
  -H "Content-Type: application/json" \
  -d '{"ticket_id":"T-003","message":"Someone asked me to share my OTP and password."}'
```

## Environment

Put local API keys in `.env.local`. This file is ignored by git.
Use `.env.example` only for placeholder names and setup guidance.

```bash
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
```

Never commit real secrets. In production, add secrets through the deployment
platform's environment variable settings.

## Deployment

Vercel is the recommended deployment target for this Next.js App Router API.

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Use the default Next.js framework preset.
4. Add production environment variables in Vercel project settings.
5. Deploy the main branch.
6. Verify the deployed health endpoint.

Recommended Vercel settings:

```text
Framework Preset: Next.js
Install Command: npm install
Build Command: npm run build
Output Directory: .next
```

Post-deploy health check:

```bash
curl https://YOUR_DEPLOYMENT_URL/api/health
```

If the live URL fails during grading, redeploy the latest successful commit from
Vercel or run the project locally with the local development steps above.

## Troubleshooting

Dependency install fails:

```bash
npm install
```

Port `3000` is already in use:

```bash
npm run dev -- -p 3001
curl http://localhost:3001/api/health
```

Production build fails:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Environment variable is missing:

```bash
cp .env.example .env.local
```

Deployment health check fails:

```bash
curl https://YOUR_DEPLOYMENT_URL/api/health
```

Then confirm the latest commit deployed successfully and that required
environment variables are configured in the deployment platform.

## Notes

The classifier currently uses regex rules in `lib/classifier.ts`. Replace or extend that module when the LLM integration is ready. See `IMPLEMENTATION.md` for the full module plan, schema, safety rule, and runbook.
