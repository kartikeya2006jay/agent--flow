#  🤖⚙️AgentFlow OS

> **Multi-Agent Governance Middleware** - Enterprise-grade orchestration platform for autonomous agent workflows with policy enforcement, risk assessment, and human-in-the-loop approvals.

[![GitHub](https://img.shields.io/badge/GitHub-kartikeya2006jay/agent--flow-blue?logo=github)](https://github.com/kartikeya2006jay/agent--flow)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active%20Development-yellow)]()
[![Version](https://img.shields.io/badge/Version-0.1.0-informational)]()

---

## 📖 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**AgentFlow OS** is a sophisticated middleware platform that orchestrates multiple autonomous agents while maintaining strict governance, compliance, and risk management. It enables enterprises to:

✅ **Execute complex workflows** across domain-specific agents (Support, HR, Finance, IT/Ops, Sales)  
✅ **Enforce policies** before execution with granular role-based access control  
✅ **Assess risk** and automatically escalate high-risk operations for human approval  
✅ **Maintain compliance** with standards like GDPR, HIPAA, SOX, PCI-DSS  
✅ **Track everything** with immutable audit trails and trace IDs  
✅ **Integrate seamlessly** with 10+ enterprise systems (Salesforce, Stripe, Workday, etc.)

### Use Cases

| Domain | Example Workflows |
|--------|-------------------|
| **Finance** | Approve refunds, issue payments, reconcile accounts |
| **HR** | Onboard employees, manage benefits, process payroll |
| **Support** | Create tickets, escalate issues, process refunds |
| **Sales** | Update CRM, generate proposals, score leads |
| **IT/Ops** | Create infrastructure, manage access, deploy services |

---

## 🏗️ Architecture

AgentFlow uses a **4-plane architecture** for separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│              (Next.js Frontend @ port 3000)                  │
│  Dashboard • Agents • Actions • Workflows • Approvals • Audit│
└────────────────────────┬────────────────────────────────────┘
                         │ REST/WebSocket
┌────────────────────────▼────────────────────────────────────┐
│                   API GATEWAY LAYER                          │
│            (FastAPI Backend @ port 8000)                     │
│           /api/v1/{actions,approvals,workflows}              │
└────┬─────────────────────────────────────────────────┬──────┘
     │                                                  │
┌────▼─────────────────────────┐   ┌─────────────────▼────────┐
│   CONTROL PLANE              │   │   DATA PLANE             │
│ (Governance & Risk)          │   │ (Execution & Orchestration)
│                              │   │                          │
│ • Policy Engine              │   │ • Workflow Orchestrator  │
│ • Risk Approval Engine       │   │ • Agent Connectors       │
│ • Access Control             │   │ • Data Transformation    │
│ • Compliance Validation      │   │ • State Management       │
└───────────────────────────────┘   └──────────────────────────┘
         │                                    │
         └─────────────────────┬──────────────┘
                               │
                  ┌────────────▼────────────┐
                  │  STATE & PERSISTENCE     │
                  │                          │
                  │ • PostgreSQL (Data)      │
                  │ • Redis (Cache/Queue)    │
                  │ • Audit Logs             │
                  └──────────────────────────┘
```

### Execution Flow

```
User Request
    │
    ├─▶ Policy Engine ─▶ Policy Decision (ALLOW/DENY/CONDITIONAL)
    │
    ├─▶ Risk Engine ─▶ Risk Score & Level (LOW/MEDIUM/HIGH/CRITICAL)
    │
    ├─▶ Approval Check ─▶ Human Approval? (if HIGH/CRITICAL)
    │
    ├─▶ Workflow Orchestrator
    │   ├─▶ Agent 1 (e.g., Support)
    │   ├─▶ Agent 2 (e.g., Finance)
    │   └─▶ Agent 3 (e.g., IT/Ops)
    │
    ├─▶ Audit Logger ─▶ Immutable Trace (trace_id)
    │
    └─▶ Response (Success/Pending/Failed)
```

---

## ✨ Features

### 🔐 Policy & Governance
- **Role-Based Access Control** - Restrict actions by user role and enterprise type
- **Policy Evaluation** - Define rules in YAML (config/policies/)
- **Compliance Validation** - Auto-tag workflows with GDPR, HIPAA, SOX, PCI-DSS
- **Audit Trails** - Every action logged with trace_id for 100% traceability

### 🤖 Agent Orchestration
- **5 Domain Agents** - Support, HR, Finance, Sales, IT/Ops
- **Sequential Execution** - Chain agents in dependency order
- **Mock Agent Connectors** - Ready for integration with real systems
- **Custom Actions** - Users can create new workflows from existing agents
- **Agent Insights** - Success rates, execution counts, cost tracking

### ⚠️ Risk Management
- **Automatic Risk Scoring** - ML-based risk assessment
- **Approval Workflows** - Human-in-the-loop for high-risk operations
- **Approval Requests** - Dashboard for managers to approve/reject
- **Risk Escalation** - Auto-escalate based on thresholds
- **Compliance Routing** - Route to appropriate approvers

### 🎛️ Control Center
- **Real-time Dashboard** - Monitor agents, workflows, approvals
- **Workflow History** - Full execution logs with results
- **Approval Queue** - Pending approvals with context
- **Audit Search** - Query logs by trace_id, action, user
- **Agent Network Viz** - Visual representation of agent connections

### 🔗 Enterprise Integration
**Supported Connectors** (config/connectors/):
- Salesforce, HubSpot (Sales)
- Stripe, SAP (Finance)
- Workday, BambooHR (HR)
- Jira, ServiceNow (IT/Ops)
- Zendesk, Intercom (Support)

---

## 💻 Tech Stack

### Frontend
| Layer | Technologies |
|-------|--------------|
| **Framework** | Next.js 14 (React 18) + TypeScript |
| **Styling** | Tailwind CSS + Radix UI + Lucide Icons |
| **State** | Zustand (auth) + TanStack Query (API) |
| **Forms** | React Hook Form + Zod validation |
| **AI/RAG** | OpenAI API + Chroma vector DB |
| **Utilities** | Axios, Framer Motion, Class Variance Authority |

### Backend
| Layer | Technologies |
|-------|--------------|
| **Framework** | FastAPI 0.109 + Pydantic |
| **Server** | Uvicorn + Gunicorn (production) |
| **Database** | SQLAlchemy + PostgreSQL (prod) / SQLite (dev) |
| **Cache** | Redis 7 |
| **Logging** | Structlog + Prometheus metrics |
| **Auth** | JWT (python-jose) + bcrypt |

### DevOps
- **Docker** - containerized backend + frontend
- **Docker Compose** - local dev orchestration
- **Vercel** - frontend deployment (recommended)
- **Railway/Render** - backend + database deployment
- **Nginx** - reverse proxy (production)

---

## 📁 Project Structure

```
agentflow-os/
│
├── frontend/                          # Next.js app (TypeScript)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Landing (redirect to login/dashboard)
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── login/                # Authentication
│   │   │   ├── dashboard/            # Control center
│   │   │   ├── actions/              # Action definitions & execution
│   │   │   ├── agents/               # Agent management & insights
│   │   │   ├── workflows/            # Workflow history & details
│   │   │   ├── approvals/            # Approval queue
│   │   │   ├── audit/                # Audit log search
│   │   │   ├── orchestration/        # Agent network visualization
│   │   │   ├── policies/             # Policy management
│   │   │   └── api/
│   │   │       ├── rag/chat/         # AI Assistant endpoint
│   │   │       └── policies/extract/ # Policy extraction
│   │   │
│   │   ├── components/
│   │   │   ├── actions/              # Action form, execution
│   │   │   ├── agents/               # Agent cards, details
│   │   │   ├── approvals/            # Approval request UI
│   │   │   ├── audit/                # Audit log table
│   │   │   ├── workflows/            # Workflow cards, trace
│   │   │   ├── layout/               # Navigation, sidebar
│   │   │   ├── ui/                   # Radix UI wrappers
│   │   │   ├── ai/                   # AI assistant
│   │   │   ├── voice/                # Voice commands
│   │   │   └── rag/                  # RAG chatbot
│   │   │
│   │   ├── lib/
│   │   │   ├── config.ts             # App configuration
│   │   │   ├── utils.ts              # Utilities
│   │   │   ├── api/                  # API client & services
│   │   │   ├── auth/                 # Auth logic & storage
│   │   │   └── websocket/            # WebSocket client
│   │   │
│   │   ├── types/                    # TypeScript definitions
│   │   └── hooks/                    # Custom React hooks
│   │
│   ├── package.json                  # Dependencies
│   ├── tsconfig.json                 # TypeScript config
│   ├── tailwind.config.js            # Tailwind setup
│   └── Dockerfile                    # Production image
│
├── backend/                           # FastAPI app (Python)
│   ├── app/
│   │   ├── main.py                   # FastAPI entry point
│   │   │
│   │   ├── api/v1/
│   │   │   ├── api.py                # Router aggregation
│   │   │   ├── endpoints/
│   │   │   │   ├── actions.py        # Action CRUD & execution
│   │   │   │   ├── workflows.py      # Workflow history
│   │   │   │   ├── approvals.py      # Approval management
│   │   │   │   ├── audit.py          # Audit log search
│   │   │   │   ├── policies.py       # Policy management
│   │   │   │   ├── agents.py         # Agent info
│   │   │   │   ├── auth.py           # Login/logout
│   │   │   │   └── health.py         # Health checks
│   │   │   │
│   │   │   ├── deps.py               # FastAPI dependencies
│   │   │   └── middlewares/          # Custom middleware
│   │   │
│   │   ├── core/
│   │   │   ├── config.py             # Settings (Pydantic)
│   │   │   ├── security.py           # JWT, password hashing
│   │   │   ├── logging.py            # Structlog setup
│   │   │   ├── exceptions.py         # Custom exceptions
│   │   │   └── constants.py          # App constants
│   │   │
│   │   ├── models/                   # SQLAlchemy ORM models
│   │   │   ├── base.py
│   │   │   ├── user.py
│   │   │   └── action.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── canonical/            # Request/response specs
│   │   │   └── *.py                  # Pydantic schemas
│   │   │
│   │   ├── db/
│   │   │   └── base.py               # Database setup
│   │   │
│   │   └── services/
│   │       ├── control_plane/        # Policy & Risk engines
│   │       │   ├── policy_engine/
│   │       │   └── risk_approval/
│   │       │
│   │       └── data_plane/           # Orchestration
│   │           └── orchestrator/
│   │
│   ├── requirements.txt               # Python dependencies
│   ├── gunicorn.conf.py              # Production server config
│   ├── Dockerfile                    # Production image
│   └── docker-compose.yml            # Local dev stack
│
├── config/                            # Configuration files
│   ├── actions/                       # Action definitions (YAML)
│   ├── connectors/                    # Connector configs
│   ├── environments/                  # Dev/staging/prod
│   ├── policies/                      # Policy rules
│   └── guardrails/                    # PII patterns, blocklists
│
├── docs/                              # Documentation
│   ├── api/                           # API specs
│   ├── architecture/                  # Design diagrams
│   ├── connectors/                    # Integration guides
│   ├── compliance/                    # Standards (GDPR, HIPAA)
│   └── deployment/                    # Deployment guides
│
├── docker-compose.prod.yml            # Production stack
├── DEPLOYMENT.md                      # Deployment guide
├── DEPLOYMENT_REPORT.md               # Readiness report
└── QUICK_START_DEPLOY.md             # Quick deploy reference
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm
- Python 3.11+
- Docker & Docker Compose
- Git

### Local Development Setup

#### Option 1: Docker Compose (Easiest)

```bash
# Clone repo
git clone https://github.com/kartikeya2006jay/agent--flow.git
cd agentflow-os

# Start entire stack
cd backend
docker-compose up -d

# Visit:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

#### Option 2: Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt
python main.py
# Runs on http://localhost:8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### Test the App

1. **Login** - Visit http://localhost:3000/login
   - Demo credentials work (localStorage-based)
   
2. **Create Action** - Go to Actions tab → Choose action → Fill form
   
3. **Approve Workflow** - Go to Approvals → Review & approve/reject
   
4. **View History** - Check Workflows tab for execution logs
   
5. **Inspect Audit** - Audit tab shows all actions with trace_id

---

## 🔄 How It Works

### 1️⃣ **Action Definition**

Users define actions that span multiple agents:

```typescript
{
  id: "approve_refund",
  name: "Approve Refund",
  target_agents: ["support", "finance"],
  risk_level: "medium",
  compliance_tags: ["PCI-DSS", "GDPR"]
}
```

### 2️⃣ **Request → Policy Evaluation**

When user executes an action:

```
POST /api/v1/actions/{action_id}/execute
{
  "data": { "order_id": "ORD-123", "amount": 500 },
  "context": { "user_id": "usr_1", "enterprise_id": "ent_1" }
}
```

**Policy Engine checks:**
- ✅ Does user have permission to execute this action?
- ✅ Is the action allowed in this enterprise?
- ✅ Are there any conditional restrictions?

### 3️⃣ **Risk Assessment**

**Risk Engine calculates** risk_score (0-100) based on:
- Action type (high: payment, low: ticket)
- Amount involved
- User's history
- Time of day
- Frequency

**Risk Levels:**
- `LOW` (0-30) → Auto-execute
- `MEDIUM` (30-70) → Auto-execute, log carefully
- `HIGH` (70-90) → Require 1 approval
- `CRITICAL` (90-100) → Require 2 approvals

### 4️⃣ **Decision: Auto-Execute or Approval?**

```python
if risk_level in [HIGH, CRITICAL]:
    # Pause workflow, create approval request
    return PendingApproval
else:
    # Execute agents immediately
    return ExecuteAgents
```

### 5️⃣ **Workflow Execution**

If approved or auto-executing:

```
Phase 1: Agent 1 (Support) executes
  └─ Create ticket in Zendesk
  └─ Log result

Phase 2: Agent 2 (Finance) executes
  └─ Check refund amount in Stripe
  └─ Approve/deny

Phase 3: Response aggregation
  └─ Combine results from all agents
  └─ Return final status
```

### 6️⃣ **Audit & Tracing**

**Every step logged:**
```json
{
  "trace_id": "tr_abc123xyz",
  "workflow_id": "wf_xyz789",
  "action": "approve_refund",
  "user": "john@company.com",
  "status": "success",
  "policy_decision": "ALLOW",
  "risk_score": 45,
  "agents_executed": ["support", "finance"],
  "duration_ms": 2340,
  "timestamp": "2026-03-01T15:30:00Z"
}
```

---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:8000
Production: https://api.yourdomain.com
```

### Authentication
All endpoints require JWT token:
```
Authorization: Bearer {access_token}
```

### Core Endpoints

#### Actions
```
GET    /api/v1/actions              # List all actions
GET    /api/v1/actions/{id}         # Get action details
POST   /api/v1/actions/{id}/execute # Execute action
```

#### Workflows
```
GET    /api/v1/workflows            # List executions
GET    /api/v1/workflows/{id}       # Get execution details
GET    /api/v1/workflows/{id}/trace # Get trace by trace_id
```

#### Approvals
```
GET    /api/v1/approvals/pending    # Pending approvals
GET    /api/v1/approvals/{id}       # Approval details
POST   /api/v1/approvals/{id}/approve   # Approve
POST   /api/v1/approvals/{id}/reject    # Reject
```

#### Audit
```
GET    /api/v1/audit/logs?trace_id={id}  # Search logs
GET    /api/v1/audit/summary              # Stats
```

**Full API Docs:** http://localhost:8000/docs (Swagger UI)

---

## 🌐 Deployment

### Frontend (Vercel Recommended)

```bash
# 1. Connect GitHub repo to Vercel
# 2. Set environment variables:
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_APP_NAME=AgentFlow OS
NEXT_PUBLIC_ENV=production

# 3. Deploy (auto on push to main)
git push origin main
```

**Status:** Check Vercel dashboard for build status

### Backend (Railway or Render)

#### Railway.app (Recommended)
```bash
# 1. Create new project
# 2. Connect GitHub
# 3. Add PostgreSQL addon
# 4. Set environment:
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SECRET_KEY=<generate 32-char key>
LOG_LEVEL=WARNING

# 5. Deploy (auto on push)
```

#### Render.com
```bash
# Similar to Railway - connect GitHub + set env vars
```

### Full Stack with Docker

```bash
# Create .env.prod
cat > .env.prod << EOF
DB_USER=agentflow
DB_PASSWORD=<secure-password>
SECRET_KEY=<32-char-key>
EOF

# Deploy
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

**See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guides.**

---

## 🤝 Contributing

We welcome contributions! Here's how:

### Development Workflow

1. **Fork & Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/agent--flow.git
   cd agentflow-os
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make Changes**
   - Follow existing code style
   - Add tests for new features
   - Update docs as needed

4. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: description of changes"
   git push origin feature/your-feature
   ```

5. **Create Pull Request**
   - Link any related issues
   - Describe what you changed and why

### Code Style

- **Frontend**: Prettier + ESLint
  ```bash
  cd frontend
  npm run lint
  ```

- **Backend**: Black + Flake8
  ```bash
  cd backend
  black app/
  flake8 app/
  ```

### Testing

- Frontend: `npm test` (Jest)
- Backend: `pytest app/` (pytest)

### Running Checks Locally

```bash
# Frontend
cd frontend && npm run build && npm run lint

# Backend  
cd backend && python -m pytest
```

---

## 📚 Additional Resources

| Document | Purpose |
|----------|---------|
| [DEPLOYMENT.md](DEPLOYMENT.md) | Complete deployment guide (4 platforms) |
| [DEPLOYMENT_REPORT.md](DEPLOYMENT_REPORT.md) | Readiness checklist & status |
| [QUICK_START_DEPLOY.md](QUICK_START_DEPLOY.md) | Fast deployment reference |
| [docs/architecture/](docs/architecture/) | System design & diagrams |
| [docs/api/openapi.yaml](docs/api/openapi.yaml) | Full API specification |
| [docs/compliance/](docs/compliance/) | GDPR, HIPAA, SOX guides |

---

## 🔐 Security

- **Authentication**: JWT tokens (python-jose)
- **Password Hashing**: bcrypt (min 12 rounds)
- **CORS**: Restricted to origin domains
- **Rate Limiting**: Configured per endpoint
- **Input Validation**: Pydantic + Zod schemas
- **Audit Logging**: Immutable traces with trace_ids
- **Secrets Management**: Environment variables only (never hardcoded)

**See [docs/security-model.md](docs/architecture/security-model.md) for details.**

---


**Built by Kartikeya Yadav, Abdul Kalam, Ashna Adeel Siddique, Shivendu Kumar, Riddhi Shah**

