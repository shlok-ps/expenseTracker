# training/train_classifier.py
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from transformers.training_args import TrainingArguments
from transformers.trainer import Trainer


MODEL = "distilbert-base-uncased"

# Load dataset
ds = load_dataset(
    "json",
    data_files="sms_parser/data/classification/created_data.jsonl",
    split="train",
)
ds = ds.train_test_split(test_size=0.2)

tokenizer = AutoTokenizer.from_pretrained(MODEL)


def preprocess(batch):
    return tokenizer(batch["text"], truncation=True, padding=True)


ds = ds.map(preprocess, batched=True)

model = AutoModelForSequenceClassification.from_pretrained(MODEL, num_labels=3)

args = TrainingArguments(
    output_dir="models/classifier",
    eval_strategy="epoch",
    num_train_epochs=4,
    per_device_train_batch_size=8,
    save_total_limit=1,
)

trainer = Trainer(
    model=model,
    args=args,
    train_dataset=ds["train"],
    eval_dataset=ds["test"],
    tokenizer=tokenizer,
)
trainer.train()
model.save_pretrained("sms_parser/models/classifier")
tokenizer.save_pretrained("sms_parser/models/classifier")
