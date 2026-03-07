from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
import uvicorn

from app.core.config import settings
from app.core.database import engine, Base, get_db
from app.api import email_analysis, sandbox, dashboard, auth

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 MailShield AI Backend Starting...")
    print(f"📊 Database: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else 'SQLite'}")
    yield
    # Shutdown
    print("🛑 MailShield AI Backend Shutting Down...")

app = FastAPI(
    title="MailShield AI API",
    description="Cybersecurity Email Analysis and Sandbox Testing API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(email_analysis.router, prefix="/api/analysis", tags=["Email Analysis"])
app.include_router(sandbox.router, prefix="/api/sandbox", tags=["Sandbox"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

@app.get("/")
async def root():
    return {
        "message": "MailShield AI API",
        "version": "1.0.0",
        "status": "online",
        "endpoints": {
            "analysis": "/api/analysis",
            "sandbox": "/api/sandbox",
            "dashboard": "/api/dashboard",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        # Test database connection
        db.execute("SELECT 1")
        return {
            "status": "healthy",
            "database": "connected",
            "services": {
                "email_analysis": "operational",
                "sandbox": "operational",
                "dashboard": "operational"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
