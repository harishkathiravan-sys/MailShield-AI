# MailShield AI

A full-stack cybersecurity web application that detects spam emails, phishing emails, and malicious links using real-time analysis and secure sandbox execution.

## Features

- **Email Analysis Engine**: NLP-based spam and phishing detection
- **Sandbox Link Analysis**: Headless browser execution in isolated Docker containers
- **SSL Certificate Validation**: Real-time certificate checking
- **Domain Reputation**: WHOIS-based domain age and reputation analysis
- **Redirect Detection**: Multi-level redirect chain monitoring
- **Script Behavior Analysis**: JavaScript threat detection
- **Login Form Detection**: Credential harvesting identification
- **Cookie & Tracking Analysis**: Privacy and security monitoring

## Tech Stack

### Frontend
- React 18
- Vite
- TailwindCSS
- Framer Motion
- Axios

### Backend
- Python 3.11+
- FastAPI
- PostgreSQL
- SQLAlchemy
- Playwright
- Docker

## Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker
- PostgreSQL

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
```

### Environment Variables

Create `.env` files in both backend and frontend directories:

**Backend `.env`:**
```
DATABASE_URL=postgresql://user:password@localhost:5432/mailshield
SECRET_KEY=your-secret-key
VIRUSTOTAL_API_KEY=your-api-key  # Optional
GOOGLE_SAFE_BROWSING_API_KEY=your-api-key  # Optional
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:8000
```

## Running the Application

### Start Backend
```bash
cd backend
uvicorn main:app --reload --port 8000
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Start Sandbox Service
```bash
docker-compose up sandbox
```

## Project Structure

```
MailShield-AI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   ├── sandbox/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
└── docker-compose.yml
```

## License

MIT
