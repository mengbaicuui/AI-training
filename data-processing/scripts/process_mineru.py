import os
import time
import json
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_KEY = os.getenv("MINERU_API_KEY")
BASE_URL = os.getenv(
    "MINERU_BASE_URL", "https://api.minerU.opendatalab.com/v1"
)  # Default or placeholder

if not API_KEY:
    print("Error: MINERU_API_KEY not found in environment variables.")
    exit(1)

INPUT_DIR = Path("data/pdfs")
OUTPUT_DIR = Path("data/books")

# Ensure directories exist
INPUT_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def parse_pdf(file_path):
    """Uploads and parses a file synchronously."""
    url = f"{BASE_URL}/file_parse"
    headers = {"Authorization": f"Bearer {API_KEY}"}
    files = {"files": open(file_path, "rb")}

    try:
        print(f"  Sending {file_path.name} to {url}...")
        response = requests.post(
            url, headers=headers, files=files, timeout=300
        )  # 5 min timeout
        if response.status_code != 200:
            print(f"Error Status: {response.status_code}")
            print(f"Error Response: {response.text}")
            return None

        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Failed to parse {file_path}: {e}")
        return None


def process_pdfs():
    """Main processing loop."""
    pdf_files = list(INPUT_DIR.glob("*.pdf"))
    if not pdf_files:
        print(f"No PDF files found in {INPUT_DIR}")
        return

    print(f"Found {len(pdf_files)} PDFs to process.")

    for pdf_file in pdf_files:
        print(f"Processing {pdf_file.name}...")

        result_json = parse_pdf(pdf_file)
        if not result_json:
            continue

        print("  Parse success. Saving...")

        # Try to extract content from common keys
        content = (
            result_json.get("result", {}).get("markdown", "")
            or result_json.get("data", "")
            or str(result_json)
        )  # Fallback

        # If it's a complex structure, try to find the markdown string
        if isinstance(content, dict):
            # Maybe result['data']['markdown']?
            content = result_json.get("data", {}).get("markdown", "") or str(
                result_json
            )

        output_filename = pdf_file.stem + ".md"
        output_path = OUTPUT_DIR / output_filename

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"  Saved to {output_path}")


if __name__ == "__main__":
    process_pdfs()
