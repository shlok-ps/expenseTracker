import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib


def train():
    # Step 1: Load or create data
    data = pd.read_csv("sample_data/synthetic_sms_dataset.csv")

    # Step 2: Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        data["text"], data["label"], test_size=0.25, random_state=42
    )

    # Step 3: Define pipeline
    pipeline = Pipeline(
        [
            ("tfidf", TfidfVectorizer()),
            ("clf", LogisticRegression(max_iter=1000)),
        ]
    )

    # Step 4: Train model
    pipeline.fit(X_train, y_train)

    # Step 5: Evaluate
    y_pred = pipeline.predict(X_test)
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    print(f"\nAccuracy: {accuracy_score(y_test, y_pred):.2f}")

    # Step 6: Save model
    joblib.dump(pipeline, "sms_transaction_classifier.joblib")
    print("\n✅ Model saved to sms_transaction_classifier.joblib")


def predict():
    model = joblib.load("sms_transaction_classifier.joblib")
    sms = "We have received recharge request of Bronze_1M_699 for your JioFiber service having JioFixedVoice Number +916613551093. Transaction ID : TB00000ATO00.Please keep this transaction ID for future reference. Once the recharge is successful, you will receive a confirmation message."
    print(model.predict([sms]))  # Output: ['transaction']
