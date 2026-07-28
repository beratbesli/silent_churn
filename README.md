# Silent Churn - Early Warning System for Customer Churn

>  Hackathon Project — AI-powered customer churn detection for small businesses

Silent Churn monitors customer sentiment across **three data channels** (emails, Google Maps reviews, and food delivery platform reviews) to detect early warning signs of customer churn before it happens.

![Python](https://img.shields.io/badge/Python-FastAPI-009688?style=flat-square)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat-square)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=flat-square)

##  Features

- **Multi-source sentiment analysis** — Combines email tone, Google Maps reviews, and food delivery platform reviews
- **AI-powered analysis** — Uses LLM to detect sentiment shifts, formality changes, and churn risk
- **Flexible AI backend** — Works with local models (LM Studio) or cloud APIs (OpenAI, Anthropic, Groq)
- **Real-time risk scoring** — Weighted composite scores with 6-point historical progression timeline
- **Minimalist & Modern UI** — Clean, dark-themed solid zinc design system with high-contrast cards and interactive charts
- **Zero-Persistence Security & Privacy** — API keys are held strictly in memory; no sensitive data, logs, or credentials are ever saved to disk
- **Demo-ready** — Comprehensive synthetic data with realistically distributed timestamps across channels

---

##  Quick Start

### One-Click Startup (Recommended)
You can start both backend and frontend servers simultaneously using the provided starter scripts:

- **Windows:** Double-click [run_windows.bat](file:///C:/Users/berat/Desktop/hackathon/run_windows.bat)
- **macOS / Linux:** Run the following commands in your terminal:
  ```bash
  chmod +x run_mac_linux.sh
  ./run_mac_linux.sh
  ```
  *(Press `Ctrl+C` in the terminal to stop both servers gracefully.)*

### Manual Startup & Prerequisites
- Python 3.10+
- Node.js 18+
- (Optional) LM Studio for local AI

### 1. Clone & Setup Backend

```bash
cd hackathon/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp ../.env.example ../.env
# Edit .env if you have a Google Places API key

# Start backend
uvicorn app.main:app --reload --port 8000
```

### 2. Setup Frontend

```bash
cd hackathon/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### 3. Open the App
Navigate to **http://localhost:5173** — you'll see the model selection screen.

---

##  AI Model Configuration

### Option 1: LM Studio (Local, Free, Private)

LM Studio lets you run AI models locally on your machine with complete privacy.

#### Setup:
1. **Download LM Studio** from [lmstudio.ai](https://lmstudio.ai/)
2. **Install and open** LM Studio
3. **Download a model** — recommended models:
   - `Llama 3 8B Instruct` (good balance of speed/quality)
   - `Mistral 7B Instruct` (fast, good for analysis)
   - `Qwen 2.5 7B Instruct` (great multilingual support)
4. **Load the model** — click on it in the sidebar
5. **Start the server**:
   - Go to the **Developer** tab (or Local Server tab)
   - Click **Start Server**
   - It should show: `Server running on http://localhost:1234`
6. In Silent Churn, select **"Use Local Model"** and pick your loaded model

#### Troubleshooting:
- If connection fails, make sure LM Studio's server is running on port 1234
- Check that a model is actually loaded (not just downloaded)
- Try restarting the LM Studio server

> **Auto-Detect:** If the backend server restarts (e.g. during development with `--reload`), it automatically re-detects an active LM Studio server at `localhost:1234` and resumes the connection — no need to reconnect manually through the UI.

### Option 2: Cloud API Key

Use cloud AI services for faster, more capable analysis.

#### Supported Services:
| Service | Model Used | Get API Key |
|---------|-----------|-------------|
| **OpenAI** | gpt-4o-mini | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **Anthropic** | claude-sonnet-4-20250514 | [console.anthropic.com](https://console.anthropic.com/) |
| **Groq** | llama-3.1-8b-instant | [console.groq.com/keys](https://console.groq.com/keys) |

#### Security:
- API keys are stored **only in memory** (frontend state + backend session)
- Keys are **never saved** to any file or database
- Keys are **never logged** or transmitted to any third party

### Option 3: Skip (Demo Mode)

You can skip AI setup entirely! The app works with pre-generated synthetic data.
Just click "Skip" on the model selection screen, then generate sample data from the dashboard.

> **Synthetic Data:** Clicking "Sample Data" generates 15 realistic customers with diverse churn scenarios, using major food delivery platforms (Uber Eats, DoorDash, Grubhub, Postmates) as reference sources. No real user data is ever stored — clicking "Sample Data" again wipes and regenerates a fresh set.

---

##  Architecture

```
┌─────────────────────────────────────────────┐
│                 Frontend                     │
│          React + Vite + Tailwind             │
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │  Model   │ │Dashboard │ │  Customer    │  │
│  │Selection │ │          │ │  Detail      │  │
│  └──────────┘ └──────────┘ └──────────────┘  │
└──────────────────┬──────────────────────────┘
                   │ /api proxy
┌──────────────────▼──────────────────────────┐
│                 Backend                      │
│              FastAPI + SQLite                │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │         Provider Adapters             │   │
│  │  LMStudio│OpenAI│Anthropic│Groq       │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │         Analysis Service              │   │
│  │  Sentiment│Tone│Risk Scoring          │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │         Data Layer                    │   │
│  │  Customers│Emails│Reviews│Scores      │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

##  Risk Scoring

The churn risk score (0-1, where 0 = high risk, 1 = happy) is calculated as:

| Source | Weight | Signals |
|--------|--------|---------|
| **Email** | 40% | Sentiment, formality, length, response delay |
| **Google Maps** | 30% | Rating, review sentiment |
| **Food Platform** | 30% | Rating, review sentiment |

Customers are flagged based on their composite score:
-  **Healthy** (≥ 0.7) — No action needed
-  **Warning** (0.4 - 0.7) — Monitor closely
-  **At Risk** (< 0.4) — Immediate attention required

> **Note on Live Analysis:** To keep the demo fast and responsive, the "Run Analysis" button processes the first 5 customers live through the AI model. This is a deliberate demo optimization — in a production environment with cloud APIs, this would scale to process all customers instantly. The other 10 customers already have pre-computed scores from the synthetic data generation step.

---

##  Project Structure

```
hackathon/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── database.py          # SQLite + SQLAlchemy setup
│   │   ├── models.py            # ORM models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── providers/           # AI provider adapters
│   │   │   ├── base.py          # Abstract base + ProviderManager
│   │   │   ├── lmstudio.py      # LM Studio (local)
│   │   │   ├── openai_provider.py
│   │   │   ├── anthropic_provider.py
│   │   │   └── groq_provider.py
│   │   ├── services/
│   │   │   ├── analysis.py      # Sentiment + risk analysis
│   │   │   ├── synthetic_data.py # Demo data generation
│   │   │   └── google_maps.py   # Google Places API
│   │   └── routes/
│   │       ├── customers.py     # Customer API endpoints
│   │       ├── providers.py     # Provider management endpoints
│   │       └── chat.py          # Chat with data endpoints
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/               # ModelSelection, Dashboard, CustomerDetail, Settings
│   │   ├── components/          # Reusable UI components
│   │   ├── context/             # Provider context
│   │   └── api/                 # API client
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

> **Note:** The SQLite database (`backend/silent_churn.db`) is not tracked in version control and is created automatically on first run.

---

##  Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_PLACES_API_KEY` | No | For fetching real Google Maps reviews |

> **Note:** AI API keys are entered through the UI, not environment variables.

---

##  API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | List all customers with risk scores |
| GET | `/customers/dashboard-stats` | Dashboard summary statistics |
| GET | `/customers/{id}` | Customer detail with full history |
| GET | `/customers/{id}/timeline` | Risk score timeline |
| POST | `/refresh-analysis` | Re-analyze all customer data |
| POST | `/generate-data` | Generate synthetic demo data |
| POST | `/customers/{id}/draft-reply` | Generate AI win-back draft email |
| POST | `/chat` | Chat with your data |
| GET | `/providers/local-models` | List LM Studio models |
| POST | `/providers/connect` | Connect to AI provider |
| GET | `/providers/current` | Current provider info |
| POST | `/providers/disconnect` | Disconnect provider |

---

## License

Apache License 2.0 — Built with ❤️ for hackathon demo purposes.
