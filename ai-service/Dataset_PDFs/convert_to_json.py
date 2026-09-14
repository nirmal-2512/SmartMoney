import json
from pathlib import Path

# Folder paths
TXT_FOLDER = Path("pdfs_txts")
OUTPUT_FOLDER = Path("json_output")

OUTPUT_FOLDER.mkdir(exist_ok=True)

for txt_file in TXT_FOLDER.glob("*.txt"):

    print(f"Processing: {txt_file.name}")

    with open(txt_file, "r", encoding="utf-8") as f:
        text = f.read()

    data = {
        "file_name": txt_file.name,
        "bank": "SBI",
        "raw_text": text
    }

    output_file = OUTPUT_FOLDER / f"{txt_file.stem}.json"

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

print("✅ All TXT files converted to JSON.")