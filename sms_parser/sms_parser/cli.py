from transformers import AutoModelForSequenceClassification
from transformers.pipelines import pipeline
from .utils.preprocessing import clean_sms
import re
import json

# Load classifiers and tokenizers
clf = pipeline(
    "text-classification",
    model="sms_parser/models/classifier",
    tokenizer="sms_parser/models/classifier",
)

ner = pipeline(
    "ner",
    model="sms_parser/models/ner",
    tokenizer="sms_parser/models/ner",
    aggregation_strategy="simple",
)
category_pipe = pipeline(
    "text-classification",
    model="sms_parser/models/category",
    tokenizer="sms_parser/models/category",
)

# Label maps
label_map = {0: "transaction", 1: "future_transaction", 2: "non_transaction"}
category_labels = {
    0: "Food",
    1: "Entertainment",
    2: "Transfer",
    3: "Shopping",
    4: "Recharge",
    5: "Other",
}


def classify_category(sms: str) -> str:
    result = category_pipe(sms)[0]
    return category_labels[int(result["label"].split("_")[-1])]


def extract_details(sms: str) -> dict:
    sms = clean_sms(sms)

    # Transaction Type
    classification = clf(sms)[0]
    transaction_class = label_map[int(classification["label"].split("_")[-1])]

    # Named Entity Recognition
    ner_result = ner(sms)
    entities = {}
    for ent in ner_result:
        key = ent["entity_group"]
        entities[key] = ent["word"]

    # Amount extraction
    amount = None
    currency = "INR"
    if "AMOUNT" in entities:
        amt_match = re.search(r"[\d,]+(?:\.\d+)?", entities["AMOUNT"])
        if amt_match:
            amount = float(amt_match.group(0).replace(",", ""))

    # Date extraction
    date = None
    date_match = re.search(r"\d{4}-\d{2}-\d{2}", sms)
    if date_match:
        date = date_match.group(0)

    # Transaction Type (CREDIT / DEBIT)
    type_ = "NONE"
    if re.search(r"credited|received|deposited|refunded", sms, re.I):
        type_ = "CREDIT"
    elif re.search(r"debited|spent|purchased|withdrawn|paid|sent", sms, re.I):
        type_ = "DEBIT"

    # Account extraction
    from_account = None
    to_account = None
    if "ACCOUNT" in entities:
        from_account = entities["ACCOUNT"]

    # Predict category
    category = classify_category(sms)

    return {
        "transactionClass": transaction_class,  # e.g., "transaction", "future_transaction"
        "Type": type_,
        "amount": amount,
        "currencyCode": currency,
        "date": date,
        "fromAccount": from_account,
        "toAccount": to_account,
        "category": category,
    }


def main():
    sms = input("📩 Enter SMS: ")
    result = extract_details(sms)
    print(json.dumps(result, indent=2))
