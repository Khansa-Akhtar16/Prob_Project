import urllib.request
import json

patients = [
    {
        'name': 'Patient A (Healthy Young Adult)',
        'data': {'age': 25, 'gender': 'female', 'bmi': 22.0, 'hypertension': 0, 'heart_disease': 0, 'smoking_history': 'never', 'HbA1c_level': 4.5, 'blood_glucose_level': 85}
    },
    {
        'name': 'Patient B (Borderline Pre-diabetic)',
        'data': {'age': 55, 'gender': 'male', 'bmi': 29.5, 'hypertension': 1, 'heart_disease': 0, 'smoking_history': 'former', 'HbA1c_level': 6.2, 'blood_glucose_level': 115}
    },
    {
        'name': 'Patient C (Severe Diabetic Profile)',
        'data': {'age': 68, 'gender': 'female', 'bmi': 34.0, 'hypertension': 1, 'heart_disease': 1, 'smoking_history': 'current', 'HbA1c_level': 8.5, 'blood_glucose_level': 210}
    }
]

for p in patients:
    payload = json.dumps(p['data']).encode()
    req = urllib.request.Request('http://localhost:8000/predict', data=payload, headers={'Content-Type':'application/json'}, method='POST')
    try:
        r = urllib.request.urlopen(req)
        res = json.loads(r.read())
        print(f"\n--- {p['name']} ---")
        print(f"Risk Level: {res['risk_level']}")
        print(f"Prediction (0=No, 1=Yes): {res['prediction']}")
        print(f"Confidence: {res['confidence']*100:.2f}%")
        print(f"Risk Score (Probability of Diabetes): {res['risk_score']*100:.2f}%")
        print(f"Interpretation: {res['interpretation']}")
    except Exception as e:
        print(f"Error testing {p['name']}: {e}")
