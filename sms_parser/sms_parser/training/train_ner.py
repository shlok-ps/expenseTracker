# training/train_ner.py
from datasets import load_dataset
from transformers import (
    AutoTokenizer,
    AutoModelForTokenClassification,
    DataCollatorForTokenClassification,
)
from transformers.trainer import Trainer
from transformers.training_args import TrainingArguments

MODEL = "distilbert-base-uncased"
LABEL_LIST = ["O", "B-AMOUNT", "I-AMOUNT", "B-ACCOUNT", "I-ACCOUNT", "B-DATE", "I-DATE"]

label2id = {l: i for i, l in enumerate(LABEL_LIST)}
id2label = {i: l for i, l in enumerate(LABEL_LIST)}

dataset = load_dataset(
    "json", data_files="sms_parser/data/ner/ner_dataset.json", split="train"
)
dataset = dataset.train_test_split(test_size=0.2)

tokenizer = AutoTokenizer.from_pretrained(MODEL)


def tokenize_and_align_labels(examples):
    tokenized_inputs = tokenizer(
        examples["tokens"], truncation=True, is_split_into_words=True, padding=True
    )
    labels = []

    for i, label in enumerate(examples["ner_tags"]):
        word_ids = tokenized_inputs.word_ids(batch_index=i)
        label_ids = []
        previous_word_idx = None
        for word_idx in word_ids:
            if word_idx is None:
                label_ids.append(-100)
            elif word_idx != previous_word_idx:
                label_ids.append(label2id[label[word_idx]])
            else:
                label_ids.append(label2id[label[word_idx]])
            previous_word_idx = word_idx
        labels.append(label_ids)

    tokenized_inputs["labels"] = labels
    return tokenized_inputs


tokenized = dataset.map(tokenize_and_align_labels, batched=True)
model = AutoModelForTokenClassification.from_pretrained(
    MODEL, num_labels=len(LABEL_LIST), id2label=id2label, label2id=label2id
)

args = TrainingArguments(
    output_dir="models/ner",
    eval_strategy="epoch",
    num_train_epochs=5,
    per_device_train_batch_size=8,
    report_to="tensorboard",
    logging_dir="sms_parser/logs",
    logging_strategy="epoch",
    logging_steps=1,
)

trainer = Trainer(
    model=model,
    args=args,
    train_dataset=tokenized["train"],
    eval_dataset=tokenized["test"],
    tokenizer=tokenizer,
    data_collator=DataCollatorForTokenClassification(tokenizer),
)

trainer.train()
model.save_pretrained("sms_parser/models/ner")
tokenizer.save_pretrained("sms_parser/models/ner")
