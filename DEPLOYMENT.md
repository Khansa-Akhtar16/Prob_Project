# DRSP — Deployment Guide
## Diabetes Risk & Severity Prediction System

---

## Project Structure

```
Prob_Project/
├── xgboost_diabetes_model.pkl   ← ML model
├── scaler.pkl                   ← StandardScaler
├── feature_names.pkl            ← Feature column names
├── backend/
│   ├── main.py                  ← FastAPI app
│   ├── requirements.txt
│   └── Procfile
└── frontend/
    ├── src/
    ├── .env                     ← Local: VITE_API_URL=http://localhost:8000
    ├── .env.production          ← Prod: VITE_API_URL=https://your-app.railway.app
    └── package.json
```

---

## 1. Local Development

### Backend (FastAPI)
```powershell
cd c:\Projects\Prob_Project
.\venv\Scripts\Activate.ps1
cd backend
$env:PYTHONUTF8=1
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
API available at: http://localhost:8000
Swagger docs at:  http://localhost:8000/docs

### Frontend (React + Vite)
```powershell
cd c:\Projects\Prob_Project\frontend
npm run dev
```
App available at: http://localhost:5173

---

## 2. Railway Deployment (Backend)

### Step 1 — Prepare the backend folder
The `backend/` folder must contain the model files at runtime.
Railway needs them in the same directory as `main.py`.

Copy the pkl files into `backend/`:
```powershell
cp xgboost_diabetes_model.pkl backend/
cp scaler.pkl backend/
cp feature_names.pkl backend/
```

Then update `main.py` line 35 to look in the same directory:
```python
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
```

### Step 2 — Create a Railway account
1. Go to https://railway.app and sign up with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository

### Step 3 — Configure Railway
In the Railway dashboard:
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

Or Railway will auto-detect the `Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Step 4 — Environment variables
In Railway → Variables tab, add:
```
PYTHONUTF8=1
```

### Step 5 — Deploy
Railway will build and deploy automatically. Note your Railway URL:
`https://your-app-name.railway.app`

### Step 6 — Test
```
curl https://your-app-name.railway.app/health
```

---

## 3. Vercel Deployment (Frontend)

### Step 1 — Update .env.production
```
VITE_API_URL=https://your-app-name.railway.app
```

### Step 2 — Push to GitHub
```powershell
cd c:\Projects\Prob_Project
git init
git add .
git commit -m "Initial commit — DRSP v1.0"
git remote add origin https://github.com/YOUR_USERNAME/drsp.git
git push -u origin main
```

### Step 3 — Import to Vercel
1. Go to https://vercel.com → **New Project**
2. Import your GitHub repository
3. **Framework Preset**: Vite
4. **Root Directory**: `frontend`
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`

### Step 4 — Environment Variables in Vercel
In Vercel → Settings → Environment Variables:
```
VITE_API_URL = https://your-app-name.railway.app
```

### Step 5 — Deploy
Click **Deploy**. Vercel gives you a URL like:
`https://drsp.vercel.app`

---

## 4. API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check + model status |
| POST | `/predict` | Run diabetes risk prediction |
| GET | `/model/intelligence` | Feature importances + metrics |
| GET | `/stats` | Dataset statistics |

### POST /predict — Request Body
```json
{
  "age": 45.5,
  "gender": "male",
  "bmi": 28.3,
  "hypertension": 0,
  "heart_disease": 0,
  "smoking_history": "never",
  "HbA1c_level": 5.5,
  "blood_glucose_level": 125
}
```

### POST /predict — Response
```json
{
  "prediction": 0,
  "confidence": 0.87,
  "risk_level": "Low",
  "risk_score": 0.03,
  "interpretation": "Your biomarkers indicate a low probability...",
  "patient_values": { ... }
}
```

### Risk Level Thresholds
| Risk Level | Risk Score |
|------------|------------|
| Low | < 20% |
| Moderate | 20% – 44% |
| High | 45% – 69% |
| Critical | ≥ 70% |

---

## 5. Quick Test Commands

```powershell
# Health check
curl http://localhost:8000/health

# Prediction (low risk)
curl -X POST http://localhost:8000/predict `
  -H "Content-Type: application/json" `
  -d '{"age":45,"gender":"male","bmi":28.3,"hypertension":0,"heart_disease":0,"smoking_history":"never","HbA1c_level":5.5,"blood_glucose_level":125}'

# Prediction (high risk)
curl -X POST http://localhost:8000/predict `
  -H "Content-Type: application/json" `
  -d '{"age":62,"gender":"female","bmi":38.5,"hypertension":1,"heart_disease":1,"smoking_history":"current","HbA1c_level":8.2,"blood_glucose_level":240}'
```
