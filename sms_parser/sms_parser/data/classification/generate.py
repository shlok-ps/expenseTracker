import random
import json
from datetime import datetime, timedelta
from faker import Faker

fake = Faker()
random.seed(42)

transaction_templates = [
    "INR {amount} debited from A/c {account} on {date}.",
    "Your account {account} was credited with {amount} on {date}.",
    "Transaction of INR {amount} successful using card ending {account} on {date}.",
    "{amount} withdrawn from ATM on {date}. A/c ending {account}.",
]

non_transaction_templates = [
    "Get 20% off on your next order with code SAVE20!",
    "Welcome to XYZ Bank. Thank you for opening your account.",
    "Enjoy exclusive movie offers with your ABC Credit Card.",
    "Download our app to access more offers and services.",
]

future_transaction_templates = [
    "Your SIP of INR {amount} will be debited from A/c {account} on {date}.",
    "EMI of INR {amount} due on {date} for Loan A/c {account}.",
    "Your insurance premium of {amount} will be auto-debited on {date}.",
    "Upcoming payment of INR {amount} for Credit Card ending {account} due on {date}.",
]


def generate_amount():
    return f"{random.randint(100, 50000)}.00"


def generate_account():
    return str(random.randint(1000, 9999))


def generate_date(days_offset=0):
    date = datetime.now() + timedelta(days=days_offset)
    return date.strftime("%Y-%m-%d")


def generate_sample(template, days_offset=0):
    return template.format(
        amount=generate_amount(),
        account=generate_account(),
        date=generate_date(days_offset),
    )


def generate_dataset(n_per_class=500):
    data = []

    for _ in range(n_per_class):
        # Transaction
        data.append(
            {
                "text": generate_sample(random.choice(transaction_templates)),
                "label": 0,
            }
        )

        # Future Transaction
        data.append(
            {
                "text": generate_sample(
                    random.choice(future_transaction_templates), days_offset=3
                ),
                "label": 1,
            }
        )

        # Non-Transaction
        data.append(
            {
                "text": random.choice(non_transaction_templates),
                "label": 2,
            }
        )

    random.shuffle(data)
    return data


def save_dataset(data, output_path="created_data.jsonl"):
    with open(output_path, "w") as f:
        for item in data:
            f.write(json.dumps(item) + "\n")


if __name__ == "__main__":
    dataset = generate_dataset(n_per_class=1000)
    save_dataset(dataset)
    print("✅ Generated dataset saved to classifier_data.jsonl")
