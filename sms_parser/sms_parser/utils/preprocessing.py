# utils/preprocessing.py
import re

def normalize_amount(text):
    # Convert "Rs.", "INR" etc. to "INR" and normalize amounts like ₹2,500.00 → 2500
    text = re.sub(r'Rs\.?|₹', 'INR', text)
    text = re.sub(r'INR\s+', 'INR ', text)
    text = re.sub(r'[^\d.,\sINR]', '', text)  # keep digits, dots, commas, and INR
    text = re.sub(r'INR\s?([\d,]+\.?\d*)', lambda m: f"INR {m.group(1).replace(',', '')}", text)
    return text

def normalize_date(text):
    # Normalize DD-MM-YYYY / DD/MM/YYYY → YYYY-MM-DD
    matches = re.findall(r'(\d{2})[-/](\d{2})[-/](\d{4})', text)
    for d, m, y in matches:
        iso_date = f"{y}-{m}-{d}"
        text = text.replace(f"{d}-{m}-{y}", iso_date).replace(f"{d}/{m}/{y}", iso_date)
    return text

def clean_sms(text):
    text = text.strip()
    text = normalize_amount(text)
    text = normalize_date(text)
    return text

