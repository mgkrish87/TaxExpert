# TaxExpert AI

> India's most intelligent AI-powered tax filing platform.

## Quick Start

### 1. Start the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend API docs: http://localhost:8000/docs

### 2. Start the Frontend

Open `frontend/index.html` in your browser, or serve it:

```bash
cd frontend
python -m http.server 3000
```

Then visit: http://localhost:3000

## Project Structure

```
TaxExpert/
├── backend/              # FastAPI backend
│   ├── main.py           # App entry point
│   ├── config.py         # Configuration
│   ├── database.py       # SQLAlchemy async engine
│   ├── models/           # Database models
│   ├── schemas/          # Pydantic schemas
│   ├── routers/          # API endpoints
│   ├── services/         # Business logic (tax engine)
│   └── utils/            # JWT, security
├── frontend/             # SPA Frontend
│   ├── index.html        # Main page
│   ├── styles.css        # Design system
│   ├── api.js            # API client
│   ├── pages.js          # Landing, auth, dashboard
│   ├── pages-filing.js   # Filing wizard, documents, profile
│   └── app.js            # Router & charts
└── README.md
```

## Features

- **JWT Authentication** — Secure signup/login
- **Guided Filing Wizard** — 6-step tax filing flow
- **Tax Calculation Engine** — FY 2025-26 slabs (Old vs New regime)
- **Deduction Discovery** — 80C/80D/80G/HRA/Home Loan
- **Tax Optimization Suggestions** — AI-powered recommendations
- **Document Upload** — Drag-and-drop with type tagging
- **Dashboard Analytics** — Charts, stats, filing history
- **Premium Dark UI** — Glassmorphism, gradients, animations

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET/PUT | `/api/users/profile` | User profile |
| POST | `/api/filings/` | Create filing |
| GET | `/api/filings/` | List filings |
| PUT | `/api/filings/{id}` | Update filing |
| POST | `/api/filings/{id}/calculate` | Run tax engine |
| GET | `/api/filings/{id}/suggestions` | Get optimization tips |
| POST | `/api/documents/` | Upload document |
| GET | `/api/documents/` | List documents |
| DELETE | `/api/documents/{id}` | Delete document |
