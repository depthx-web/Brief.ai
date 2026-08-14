# Brief.ai 📄✨

**Smart Multi-Segment PDF Processing Platform**

A sophisticated web application that provides professional PDF tools (merge, split, compress, convert, protect, sign) combined with AI-powered document intelligence, specifically tailored for three user segments: lawyers, accountants/small business owners, and academic researchers.

---

## 🎯 Project Overview

- **Unified Core Engine** — Single PDF processing backend serving all segments
- **Multi-Segment UI** — Three distinct user experiences (Lawyers / Accountants / Researchers)
- **AI-Powered Intelligence** — Context-aware document analysis, summarization, and Q&A
- **Privacy-First Architecture** — Client-side processing for basic operations, encrypted communication
- **Production-Ready** — Built with modern tech stack, scalable infrastructure

---

## 📁 Project Structure

```
brief-ai/
├── apps/
│   ├── web/                 # Frontend (React/Next.js) - All three segments UI
│   └── api/                 # Backend (Node.js/NestJS) - PDF processing + API
├── packages/
│   ├── shared-types/        # Shared TypeScript types across monorepo
│   ├── pdf-core/            # Core PDF processing library
│   ├── ai-core/             # AI/LLM integration layer
│   └── ui-components/       # Reusable React components
├── services/
│   └── python-ml/           # Optional: FastAPI for advanced OCR/ML
├── docs/                    # Project documentation
├── docker/                  # Docker configurations
└── scripts/                 # Automation scripts
```

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 18 + Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query + Zustand
- **Client-Side PDF**: pdf-lib, pdf.js, pdfjs-dist
- **UI Library**: Shadcn/ui
- **WebAssembly**: For client-side PDF operations

### Backend
- **Runtime**: Node.js 18+
- **Framework**: NestJS (with Express adapter)
- **Database**: PostgreSQL
- **Caching**: Redis
- **Job Queue**: BullMQ (Redis-backed)
- **PDF Processing**: pdf-lib, pdfkit, sharp
- **AI Integration**: Google Gemini API / Claude API
- **File Storage**: AWS S3 or S3-compatible
- **Authentication**: JWT + OAuth2
- **API Documentation**: Swagger/OpenAPI

### Infrastructure
- **Container**: Docker & Docker Compose
- **Deployment**: Kubernetes-ready (optional)
- **Monitoring**: Prometheus + Grafana (future)
- **Logging**: Winston + ELK stack (future)

### Optional
- **Advanced ML**: Python FastAPI service for OCR, advanced data extraction
- **LLM Gateway**: LiteLLM for multi-provider LLM routing

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm/yarn
- Git
- Docker & Docker Compose (for local development with DB)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd brief-ai

# Install dependencies (using pnpm recommended)
pnpm install

# Setup environment variables
cp .env.example .env.local

# Start development environment
pnpm dev
```

This starts:
- Frontend at `http://localhost:3000`
- Backend API at `http://localhost:3001`

### With Docker Compose

```bash
docker-compose -f docker/docker-compose.dev.yml up
```

---

## 📋 Features by Segment

### Lawyers 👨‍⚖️
- **Redline/Diff View** — Compare contract versions side-by-side
- **Clause Detection** — AI identifies unfair, incomplete, or non-standard clauses
- **Entity Extraction** — Auto-extract parties, dates, obligations, amounts
- **Semantic Search** — Search across entire contract libraries
- **Audit Logs** — Compliance-ready document processing history

### Accountants 💼
- **Invoice Data Extraction** — OCR + structure recognition for accurate extraction
- **Auto Categorization** — Smart expense classification
- **Batch Processing** — Handle dozens of invoices in one upload
- **Accounting Export** — Export to QuickBooks, Xero, or CSV
- **Manual Review Dashboard** — Verify extracted data before finalization

### Researchers 🎓
- **Paper Summarization** — Customizable summary lengths and styles
- **Document Chat** — Ask questions with page-level citations
- **Reference Extraction** — Export as BibTeX, APA, or MLA
- **Personal Library** — Build and search your PDF collection semantically
- **Freemium Model** — Try free with monthly usage limits

---

## 🔐 Security & Privacy

- **Client-Side Processing** — Basic PDF operations run entirely in browser (WebAssembly)
- **Encrypted Transport** — TLS 1.3 for all network communication
- **Encrypted Storage** — Files encrypted at rest
- **Auto-Deletion** — Server files auto-deleted within 1 hour
- **GDPR Compliance** — User data access, export, and deletion rights
- **No Training on Data** — Production AI uses enterprise-grade APIs with SLA guarantees
- **Audit Trails** — Complete logging for regulatory compliance

---

## 📊 Pricing (Preliminary)

| Segment | Model | Price |
|---------|-------|-------|
| **Lawyers** | Per-user/month | $40–80/month |
| **Accountants** | Usage-based | $15–30/month + overages |
| **Researchers** | Freemium | Free (limited) → $5–10/month |

---

## 🔄 Development Workflow

### Commands

```bash
# Development server
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint & type-check
pnpm lint
pnpm type-check

# Format code
pnpm format

# Clean build artifacts
pnpm clean
```

### Monorepo Structure

This project uses **Turbo** for monorepo management with optimized caching and parallel execution.

---

## 🗺️ Project Phases

| Phase | Focus | Duration |
|-------|-------|----------|
| **Phase 1** | Core PDF engine + basic tools | 6–8 weeks |
| **Phase 2** | General AI layer (chat, summarize) | 4–6 weeks |
| **Phase 3** | Segment-specific features (parallel) | 6–8 weeks |
| **Phase 4** | Subscriptions, analytics, launch | 3–4 weeks |

---

## 📚 Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [AI Prompts & Config](./docs/AI_CONFIGURATION.md)
- [Contributing Guide](./docs/CONTRIBUTING.md)

---

## 🎨 Design System

- **Primary Color**: Navy Blue (#1A365D) — Trust, professionalism
- **Accent Color**: Emerald Green (#10B981) — AI features
- **Background**: Light Gray (#F9FAFB) — Readability
- **Typography**: Inter, Roboto Mono

Design maintains visual coherence across three segments with subtle differentiators.

---

## 🔗 Performance Targets

- ⚡ Basic operations: < 10 seconds
- 📊 API response: < 200ms
- 🚀 99.5% monthly uptime
- 🗜️ Compress heavy PDFs to < 5MB

---

## 👥 Contributing

Contributions welcome! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

---

## 📄 License

Proprietary — Brief.ai © 2024

---

## 📞 Contact

For questions or support: [contact details to be added]

---

**Built with ❤️ for professionals who work with documents**
