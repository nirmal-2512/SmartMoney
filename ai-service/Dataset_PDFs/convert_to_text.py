import fitz
from pathlib import Path

pdf_folder = "transaction_pdfs"
output_folder = "pdfs_txts"

Path(output_folder).mkdir(exist_ok=True)

for pdf in Path(pdf_folder).glob("*.pdf"):
    doc = fitz.open(pdf)
    text = ""

    for page in doc:
        text += page.get_text()

    txt_file = Path(output_folder) / f"{pdf.stem}.txt"

    with open(txt_file, "w", encoding="utf-8") as f:
        f.write(text)

    print(f"Converted: {pdf.name}")