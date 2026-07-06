# AI-Powered Personal Portfolio Content Management System (Portfolio CMS)

A premium, full-stack, production-ready Personal Portfolio CMS designed to showcase developer details and track visitor engagement metrics. 

## Architectural Features
- **Public Website & CMS Portal**: Beautiful Vercel/Linear-inspired user interface using Framer Motion animations, dark/light modes, and custom float particles.
- **Unified Storage Provider (Auto-Fallback)**: Automatically detects storage adapters. Uses MySQL if credentials exist in `.env`, falls back to local SQLite (`database/portfolio.sqlite`), and degrades safely to local JSON file storage (`database/portfolio_data.json`) if local drivers fail.
- **Multiple AI Assistant Providers (Offline Fallback)**: Supports calling OpenAI, Google Gemini, or Ollama (local model) REST paths. If credentials are empty, it runs a built-in offline NLP rules engine calculating portfolio completeness, missing stack gaps, and evaluating resume buffers to generate ATS review cards.
- **Recruiter Messaging & Calendar Scheduling**: Recruiters can leave rating logs, submit feedback, and schedule interview slots directly on the contact form, raising notifications on the admin dashboard.
- **Advanced Analytics Tracking**: Records unique/returning visitors, country demographics, devices, session durations, resume download counts, and specific button clicks.

---

## Workspace Layout
```
portfolio-cms/
├── client/              # React (Vite) client code
│   ├── public/          # Static files (manifest, service workers)
│   └── src/             # Component, contexts, pages logic
├── server/              # Express Node backend
│   ├── config/          # DB connections setup
│   ├── controllers/     # Route action handlers
│   ├── database/        # Migrations & seed scripts
│   ├── middleware/      # JWT guards, file upload filters
│   ├── routes/          # Express API route registrations
│   └── services/        # DB Repository abstractions & AI prompts engines
└── database/            # Active SQLite/JSON file databases
```

---

## Installation & Setup Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Backend Server Setup
1. Navigate into the server directory:
   ```bash
   cd server
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Initialize the environment configuration. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
4. Start the backend in development mode:
   ```bash
   npm run dev
   ```
   *Note: On start-up, the database seeder runs automatically, creating a default administrator account: `admin@danielpaul.dev` with password `admin123`.*

### 2. Frontend Client Setup
1. Navigate into the client directory:
   ```bash
   cd ../client
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`.

---

## API Endpoint Documentation

| Category | Method | Path | Description | Protected (JWT) |
|---|---|---|---|---|
| **Auth** | POST | `/api/auth/login` | Administrator session login | No |
| **Auth** | GET | `/api/auth/verify` | Token state verification check | Yes |
| **Portfolio** | GET | `/api/portfolio/profile` | Retrieve Daniel Paul details | No |
| **Portfolio** | PUT | `/api/portfolio/profile` | Update profile bio/details | Yes |
| **Portfolio** | GET | `/api/portfolio/projects` | Fetch projects list | No |
| **Portfolio** | POST | `/api/portfolio/projects` | Log a new project card | Yes |
| **Portfolio** | POST | `/api/portfolio/projects/:id/view` | Increment views metric | No |
| **Portfolio** | GET | `/api/portfolio/skills` | Fetch skill parameters list | No |
| **Portfolio** | GET | `/api/portfolio/experience` | Fetch career history | No |
| **Portfolio** | GET | `/api/portfolio/education` | Fetch school timelines | No |
| **Portfolio** | POST | `/api/portfolio/upload` | Upload avatar/project image assets | Yes |
| **Portfolio** | POST | `/api/portfolio/upload/resume` | Upload main PDF resume | Yes |
| **Recruiter** | POST | `/api/messages` | Submit feedback form & ratings | No |
| **Recruiter** | GET | `/api/messages` | List recruiter feedback entries | Yes |
| **Recruiter** | PUT | `/api/messages/:id/bookmark` | Bookmark message lead | Yes |
| **Analytics** | POST | `/api/analytics/session` | Record page session details | No |
| **Analytics** | POST | `/api/analytics/event` | Log custom buttons click events | No |
| **Analytics** | GET | `/api/analytics/summary` | Fetch counts & ChartJS variables | Yes |
| **AI Work** | POST | `/api/ai/analyze` | Perform diagnostic portfolio checks | Yes |
| **AI Work** | POST | `/api/ai/analyze-resume` | Upload resume for ATS audits | Yes |
| **System** | GET | `/api/system/notifications` | Fetch notification bells stream | Yes |
| **System** | GET | `/api/system/backup/export` | Download serialized database state | Yes |
| **System** | POST | `/api/system/backup/import` | Upload database backup file state | Yes |

---

## Deployment Playbook

### Backend (Render)
1. Commit the codebase to a GitHub repository.
2. Register a new Web Service on Render, linking it to the repository.
3. Configure the Root Directory parameter: `server`.
4. Set Build Command: `npm install`.
5. Set Start Command: `node server.js`.
6. Load env variables matching `server/.env.example` in Settings.

### Database (MySQL Host / Aiven / Railway)
1. Provision a managed MySQL instance.
2. Grab the connection parameters (Host, Port, User, Password, DB Name).
3. Set the variables `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` inside the Render web service environment dashboard.
4. If managed MySQL is missing, the Render Express backend will run SQLite or write local file structures seamlessly.

### Frontend (Vercel)
1. Deploy a new project on Vercel linked to the repository.
2. Configure Root Directory parameter: `client`.
3. Set environment variable: `VITE_API_URL` to point to the backend Render API root path: `https://your-server.onrender.com/api`.
4. Vercel compiles and exposes the React Vite client application instantly.
