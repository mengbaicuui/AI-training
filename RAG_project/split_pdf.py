#!/usr/bin/env python3
"""
Simple helper to split a large PDF into smaller chunks, then you can
run MinerU on each chunk separately.

Usage examples (from project root):

  # 默认每 50 页一份，输出到 data/splits/
  python split_pdf.py data/卡罗拉维修手册第一册.pdf

  # 自定义页数和输出目录
  python split_pdf.py data/卡罗拉维修手册第一册.pdf -o data/splits_30 -n 30

After splitting, you can loop over the generated PDFs and call
`mineru_process.py` or the notebook's MinerU cell on each file.
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path

from PyPDF2 import PdfReader, PdfWriter


def split_pdf(input_path: Path, output_dir: Path, pages_per_chunk: int = 50) -> None:
    if not input_path.is_file():
        raise SystemExit(f"Input PDF not found: {input_path}")

    reader = PdfReader(str(input_path))
    total_pages = len(reader.pages)
    if total_pages == 0:
        raise SystemExit("Input PDF has 0 pages.")

    output_dir.mkdir(parents=True, exist_ok=True)

    num_chunks = (total_pages + pages_per_chunk - 1) // pages_per_chunk
    print(f"Total pages: {total_pages}")
    print(f"Splitting into {num_chunks} chunks, up to {pages_per_chunk} pages each.")

    base_name = input_path.stem

    for i in range(num_chunks):
        writer = PdfWriter()
        start_page = i * pages_per_chunk
        end_page = min(start_page + pages_per_chunk, total_pages)

        print(f"  Chunk {i + 1}/{num_chunks}: pages {start_page + 1}-{end_page}")

        for page_num in range(start_page, end_page):
            writer.add_page(reader.pages[page_num])

        out_name = f"{base_name}_chunk_{i + 1}.pdf"
        out_path = output_dir / out_name
        with open(out_path, "wb") as f:
            writer.write(f)

    print(f"\n✅ Done. Split PDFs saved under: {output_dir}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Split a large PDF into smaller PDFs by page range."
    )
    parser.add_argument(
        "pdf",
        help="Path to the input PDF file.",
    )
    parser.add_argument(
        "-o",
        "--output-dir",
        default=None,
        help="Output directory for split PDFs (default: data/splits/<pdf_stem>/).",
    )
    parser.add_argument(
        "-n",
        "--pages-per-chunk",
        type=int,
        default=50,
        help="Pages per split PDF (default: 50).",
    )
    args = parser.parse_args()

    input_path = Path(args.pdf).expanduser().resolve()
    if args.output_dir:
        output_dir = Path(args.output_dir).expanduser().resolve()
    else:
        # default under data/splits/<stem>/
        output_dir = (
            Path("data") / "splits" / input_path.stem
        )

    split_pdf(input_path, output_dir, pages_per_chunk=args.pages_per_chunk)


if __name__ == "__main__":
    main()

