# MailShield AI - Quick Start Guide

## 🚀 Quick Start (Windows)

### Step 1: Install Prerequisites
1. **Python 3.11+**: Download from https://www.python.org/downloads/
2. **Node.js 18+**: Download from https://nodejs.org/
3. **Git**: Download from https://git-scm.com/

### Step 2: Setup the Application

Open PowerShell in the project directory and run:

```powershell
.\setup.ps1
```

This will:
- Create Python virtual environment
- Install all Python dependencies
- Install Playwright browsers
- Install Node.js dependencies

### Step 3: Start the Application

```powershell
.\start.ps1
```

This will start both backend and frontend servers in separate windows.

### Step 4: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## 📋 Manual Setup (Alternative)

### Backend Setup

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
playwright install chromium
python main.py
```

### Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing the Application

### Test with Demo Email

1. Go to http://localhost:5173/analyze
2. Click "Load Demo Email"
3. Click "Analyze Email"
4. View the analysis results
5. Click "Analyze in Sandbox" to test URLs

### Expected Results

The demo email contains multiple phishing indicators:
- High phishing probability score
- Urgency keywords detected
- Credential request patterns
- Suspicious sender domain
- Malicious URL

---

## 🔧 Configuration

### Backend Configuration

Edit `backend/.env`:

```env
DATABASE_URL=sqlite:///./mailshield.db
SECRET_KEY=your-secret-key
SANDBOX_TIMEOUT=30
```

### Frontend Configuration

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

---

## 📊 Features Overview

### Email Analysis Engine
- NLP-based spam keyword detection
- Phishing phrase pattern matching
- Urgency indicator detection
- Credential request identification
- Domain reputation checking

### Sandbox URL Analysis
- Headless browser automation with Playwright
- SSL certificate validation
- Domain age and WHOIS lookup
- Redirect chain analysis
- Login form detection
- JavaScript threat analysis
- Cookie and tracking detection

### User Interface
- Modern cybersecurity-themed design
- Real-time analysis with loading animations
- Interactive threat meters and visualizations
- Detailed security reports
- Analytics dashboard with charts

---

## 🛠️ Troubleshooting

### Issue: Python not found
**Solution**: Install Python 3.11+ and ensure it's in your PATH

### Issue: Playwright browser installation fails
**Solution**: Run manually:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
playwright install chromium
playwright install-deps chromium
```

### Issue: Port already in use
**Solution**: 
- Backend (8000): Change port in `backend/main.py`
- Frontend (5173): Change port in `frontend/vite.config.js`

### Issue: WHOIS lookup fails
**Solution**: This is normal for some domains. The system will continue analysis without domain age data.

### Issue: SSL verification errors
**Solution**: Some URLs may have invalid certificates - this is detected as a security risk.

---

## 📝 API Endpoints

### Email Analysis
- `POST /api/analysis/analyze` - Analyze email
- `GET /api/analysis/analysis/{id}` - Get analysis results
- `GET /api/analysis/recent` - Get recent analyses

### Sandbox Analysis
- `POST /api/sandbox/analyze` - Analyze single URL
- `POST /api/sandbox/batch-analyze` - Analyze multiple URLs
- `GET /api/sandbox/report/{id}` - Get sandbox report

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/weekly-activity` - Get weekly activity
- `GET /api/dashboard/recent-threats` - Get recent threats

---

## 🔒 Security Notes

1. **Sandbox Isolation**: URLs are opened in isolated headless browsers
2. **No Direct Execution**: Suspicious code is analyzed but not executed
3. **Data Privacy**: Email data is stored locally in SQLite by default
4. **Timeout Protection**: Sandbox execution limited to 30 seconds

---

## 🎯 Usage Tips

1. **Test with known phishing emails** to see accurate threat detection
2. **Use the dashboard** to track analysis history and patterns
3. **Batch analyze URLs** for faster processing of multiple links
4. **Review sandbox reports** for detailed security assessments

---

## 📈 Performance

- **Email Analysis**: < 1 second
- **Single URL Sandbox**: 5-15 seconds
- **Batch URL Analysis**: Parallel processing
- **Database**: SQLite (default) or PostgreSQL

---

## 🌟 Production Deployment

For production deployment:

1. **Change SECRET_KEY** in backend/.env
2. **Use PostgreSQL** instead of SQLite
3. **Enable HTTPS** for both frontend and backend
4. **Add rate limiting** to API endpoints
5. **Configure CORS** properly
6. **Set up monitoring** and logging
7. **Use production build** for frontend:
   ```bash
   cd frontend
   npm run build
   ```

---

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the error messages in terminal
3. Check browser console for frontend errors
4. Verify all prerequisites are installed
5. Ensure ports 8000 and 5173 are available

---

## 🎉 Success!

Your MailShield AI application is now running!

Visit http://localhost:5173 to start analyzing emails.
