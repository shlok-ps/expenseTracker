from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import os
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

DATA_DIR = os.path.join(os.path.dirname(__file__), "model")
MODEL_PATH = os.path.join(DATA_DIR, "sms_transaction_classifier.joblib")
FEEDBACK_PATH = os.path.join(DATA_DIR, "feedback.csv")
INITIAL_DATA_PATH = os.path.join(DATA_DIR, "synthetic_sms_dataset.csv")

app = FastAPI()
model = joblib.load(MODEL_PATH)


class SMSRequest(BaseModel):
    text: str


class Feedback(BaseModel):
    text: str
    correct_label: str  # 'transaction' or 'non_transaction'


@app.post("/predict")
def predict_sms(data: SMSRequest):
    prediction = model.predict([data.text])[0]
    confidence = model.predict_proba([data.text])[0].max()
    return {"prediction": prediction, "confidence": round(confidence, 2)}


@app.post("/feedback")
def submit_feedback(data: Feedback):
    # 1. Save feedback
    feedback_df = pd.DataFrame([{"text": data.text, "label": data.correct_label}])
    if os.path.exists(FEEDBACK_PATH):
        feedback_df.to_csv(FEEDBACK_PATH, mode="a", header=False, index=False)
    else:
        feedback_df.to_csv(FEEDBACK_PATH, index=False)

    # 2. Retrain model
    retrain_model()

    return {"message": "✅ Feedback received and model updated"}


def retrain_model():
    global model

    # Load original + feedback data
    df_main = pd.read_csv(INITIAL_DATA_PATH)
    if os.path.exists(FEEDBACK_PATH):
        df_feedback = pd.read_csv(FEEDBACK_PATH)
        df_combined = pd.concat([df_main, df_feedback], ignore_index=True)
    else:
        df_combined = df_main

    # Retrain
    model = Pipeline(
        [
            ("tfidf", TfidfVectorizer()),
            ("clf", LogisticRegression(max_iter=1000)),
        ]
    )
    model.fit(df_combined["text"], df_combined["label"])

    # Save model
    joblib.dump(model, MODEL_PATH)
