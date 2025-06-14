import random
import re
import json
from datetime import datetime, timedelta

CURRENCIES = ["INR", "USD"]
ACCOUNTS = ["1234", "5678", "7890"]
MERCHANTS = ["Amazon", "IRCTC", "Swiggy", "Netflix", "Uber", "Paytm"]
TEMPLATES = [
    "INR {amount} debited from A/c {account} on {date}.",
    "You spent {currency} {amount} at {merchant} from A/c {account} on {date}.",
    "A credit of {currency} {amount} was received in A/c {account} on {date}.",
    "{currency} {amount} transferred to {merchant} from A/c {account} on {date}.",
]


def random_date():
    days_ago = random.randint(1, 60)
    return (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")


def tokenize(text):
    return text.replace("/", " / ").replace(".", " .").split()


def ner_label_tokens(tokens, spans):
    labels = ["O"] * len(tokens)
    for label, span_text in spans:
        span_tokens = tokenize(span_text)
        for i in range(len(tokens)):
            if tokens[i : i + len(span_tokens)] == span_tokens:
                labels[i] = f"B-{label}"
                for j in range(1, len(span_tokens)):
                    labels[i + j] = f"I-{label}"
                break
    return labels


def generate_record():
    amount = f"{random.randint(100, 9999)}"
    currency = random.choice(CURRENCIES)
    account = random.choice(ACCOUNTS)
    date = random_date()
    merchant = random.choice(MERCHANTS)

    template = random.choice(TEMPLATES)
    text = template.format(
        amount=amount, currency=currency, account=account, merchant=merchant, date=date
    )

    spans = []
    if currency and amount:
        spans.append(
            (
                "AMOUNT",
                f"{currency} {amount}" if " " in template else f"{currency}{amount}",
            )
        )
    if account:
        spans.append(("ACCOUNT", f"A/c {account}"))
    if date:
        spans.append(("DATE", date))

    tokens = tokenize(text)
    ner_tags = ner_label_tokens(tokens, spans)

    return {"tokens": tokens, "ner_tags": ner_tags}


def generate_dataset(n=500, output_file="ner_dataset.json"):
    dataset = [generate_record() for _ in range(n)]
    with open(output_file, "w") as f:
        json.dump(dataset, f, indent=2)
    print(f"✅ Generated {n} NER records in HuggingFace format at {output_file}")


if __name__ == "__main__":
    generate_dataset()
