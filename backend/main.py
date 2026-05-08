"""
Diabetes Risk & Severity Prediction System
FastAPI Backend — main.py
"""

import os
import numpy as np
import joblib
from fastapi import FastAPI, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field, validator
from typing import Optional
import uvicorn

# ─────────────────────────────────────────────
# App Init
# ─────────────────────────────────────────────
app = FastAPI(
    title="Diabetes Risk & Severity Prediction API",
    description="XGBoost-powered diabetes risk prediction system",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Load Model Artifacts
# ─────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

try:
    # We join paths safely to find files in the same directory as main.py
    model = joblib.load(os.path.join(BASE_DIR, "xgboost_diabetes_model.pkl"))
    scaler = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))
    feature_names = joblib.load(os.path.join(BASE_DIR, "feature_names.pkl"))
    print(f"[OK] Model artifacts loaded successfully from: {BASE_DIR}")
    print(f"Features: {feature_names}")
except Exception as e:
    print(f"[ERR] Failed to load model artifacts: {e}")
    # This helps you see exactly where it tried to look in the Railway logs
    print(f"Attempted search path: {BASE_DIR}")
    model = scaler = feature_names = None


# ─────────────────────────────────────────────
# Feature Importance (static, computed once)
# ─────────────────────────────────────────────
FEATURE_IMPORTANCE_MAP = None
if model and feature_names:
    raw = dict(zip(feature_names, model.feature_importances_))
    total = sum(raw.values())
    FEATURE_IMPORTANCE_MAP = {
        k: float(round(float(v) / float(total) * 100, 2))
        for k, v in sorted(raw.items(), key=lambda x: -x[1])
    }

# ─────────────────────────────────────────────
# Schemas
# ─────────────────────────────────────────────
class PredictionRequest(BaseModel):
    age: float = Field(..., ge=0, le=120, description="Patient age in years")
    gender: str = Field(..., description="male | female | other")
    bmi: float = Field(..., ge=10.0, le=100.0, description="Body Mass Index")
    hypertension: int = Field(..., ge=0, le=1, description="0 = No, 1 = Yes")
    heart_disease: int = Field(..., ge=0, le=1, description="0 = No, 1 = Yes")
    smoking_history: str = Field(..., description="never | former | current | ever | not current | unknown")
    HbA1c_level: float = Field(..., ge=3.0, le=15.0, description="HbA1c level (%)")
    blood_glucose_level: float = Field(..., ge=50, le=400, description="Blood glucose level (mg/dL)")

    @validator("gender")
    def validate_gender(cls, v):
        allowed = {"male", "female", "other"}
        if v.lower() not in allowed:
            raise ValueError(f"gender must be one of {allowed}")
        return v.lower()

    @validator("smoking_history")
    def validate_smoking(cls, v):
        allowed = {"never", "former", "current", "ever", "not current", "unknown", "no info"}
        if v.lower() not in allowed:
            raise ValueError(f"smoking_history must be one of {allowed}")
        return v.lower()


class PredictionResponse(BaseModel):
    prediction: int
    confidence: float
    risk_level: str
    risk_score: float
    interpretation: str
    patient_values: dict


# ─────────────────────────────────────────────
# Encoding Helper
# ─────────────────────────────────────────────
def encode_input(data: PredictionRequest) -> np.ndarray:
    """Encode raw API input exactly as the training pipeline did."""
    gender_map = {"female": 0, "male": 1, "other": 2}
    gender_enc = gender_map.get(data.gender, 0)

    # One-hot smoking — matches training columns exactly
    smoking_cols = {
        "smoking_current": 0,
        "smoking_ever": 0,
        "smoking_former": 0,
        "smoking_never": 0,
        "smoking_not current": 0,
        "smoking_unknown": 0,
    }
    sh = data.smoking_history.lower()
    if sh == "current":
        smoking_cols["smoking_current"] = 1
    elif sh == "ever":
        smoking_cols["smoking_ever"] = 1
    elif sh == "former":
        smoking_cols["smoking_former"] = 1
    elif sh == "never":
        smoking_cols["smoking_never"] = 1
    elif sh == "not current":
        smoking_cols["smoking_not current"] = 1
    else:
        smoking_cols["smoking_unknown"] = 1

    # Build feature vector in exact training order
    feature_vector = [
        gender_enc,
        data.age,
        data.hypertension,
        data.heart_disease,
        data.bmi,
        data.HbA1c_level,
        data.blood_glucose_level,
        smoking_cols["smoking_current"],
        smoking_cols["smoking_ever"],
        smoking_cols["smoking_former"],
        smoking_cols["smoking_never"],
        smoking_cols["smoking_not current"],
        smoking_cols["smoking_unknown"],
    ]

    return np.array([feature_vector], dtype=np.float64)


def get_risk_level(prob: float) -> tuple[str, str]:
    """Return (risk_level, interpretation) based on probability."""
    if prob < 0.20:
        return "Low", "Your biomarkers indicate a low probability of diabetes. Maintain current lifestyle habits."
    elif prob < 0.45:
        return "Moderate", "Some risk factors are elevated. Lifestyle modifications and monitoring are recommended."
    elif prob < 0.70:
        return "High", "Multiple risk factors indicate elevated diabetes risk. Medical consultation is strongly advised."
    else:
        return "Critical", "Biomarker profile indicates very high diabetes risk. Immediate medical evaluation is essential."


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "features": len(feature_names) if feature_names else 0,
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(data: PredictionRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        X = encode_input(data)
        X_scaled = scaler.transform(X)
        prediction = int(model.predict(X_scaled)[0])
        proba = model.predict_proba(X_scaled)[0]
        confidence = float(proba[prediction])
        risk_score = float(proba[1])  # always probability of class=1
        risk_level, interpretation = get_risk_level(risk_score)

        return PredictionResponse(
            prediction=prediction,
            confidence=round(confidence, 4),
            risk_level=risk_level,
            risk_score=round(risk_score, 4),
            interpretation=interpretation,
            patient_values={
                "age": data.age,
                "gender": data.gender,
                "bmi": data.bmi,
                "hypertension": data.hypertension,
                "heart_disease": data.heart_disease,
                "smoking_history": data.smoking_history,
                "HbA1c_level": data.HbA1c_level,
                "blood_glucose_level": data.blood_glucose_level,
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/model/intelligence")
def model_intelligence():
    """Returns feature importances and model metadata for the dashboard."""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    importances = []
    if FEATURE_IMPORTANCE_MAP:
        for rank, (feat, score) in enumerate(FEATURE_IMPORTANCE_MAP.items(), 1):
            importances.append({"rank": rank, "feature": feat, "score": score})

    return {
        "model_type": "XGBoost Classifier",
        "n_estimators": model.n_estimators if hasattr(model, "n_estimators") else "N/A",
        "n_features": len(feature_names),
        "feature_importances": importances,
        "metrics": {
            "accuracy": 0.9678,
            "auc_roc": 0.98,
            "precision": 0.9701,
            "recall": 0.9678,
            "f1_score": 0.9672,
            "dataset_size": 95103,
        },
        "pipeline": [
            {"step": "Raw Data", "detail": "95,103 patient records"},
            {"step": "Cleaning", "detail": "Deduplication, outlier removal"},
            {"step": "SMOTE", "detail": "Class imbalance correction"},
            {"step": "Scaling", "detail": "StandardScaler normalization"},
            {"step": "XGBoost", "detail": "Gradient-boosted trees"},
            {"step": "Prediction", "detail": "Risk + confidence output"},
        ],
    }


@app.get("/stats")
def dataset_stats():
    return {
        "total_patients": 95103,
        "diabetic_patients": 8085,
        "non_diabetic_patients": 87018,
        "accuracy": 96.78,
        "auc_roc": 0.98,
        "f1_score": 0.9672,
        "features_used": 13,
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
