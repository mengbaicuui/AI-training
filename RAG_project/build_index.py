#!/usr/bin/env python3
"""
Convenience wrapper to build a Chroma index for the RAG project.

Example:
    python build_index.py \\
        --pdf data/卡罗拉维修手册第一册.pdf \\
        --source mineru

You can switch to the PaddleOCR-VL parsed output by:
    python build_index.py --pdf data/卡罗拉维修手册第一册.pdf --source paddleocr
"""

from __future__ import annotations

import argparse
from pathlib import Path

from rag.ingest import INDEX_DIR, ingest_pdf


def main() -> None:
    parser = argparse.ArgumentParser(description="Build RAG index from car manual PDF.")
    parser.add_argument(
        "--pdf",
        type=str,
        required=True,
        help="Path to PDF (e.g., data/卡罗拉维修手册第一册.pdf)",
    )
    parser.add_argument(
        "--source",
        choices=["mineru", "paddleocr"],
        default="mineru",
        help="Parsing backend to use for ingestion.",
    )
    parser.add_argument(
        "--index-dir",
        type=str,
        default=str(INDEX_DIR),
        help=f"Chroma index directory (default: {INDEX_DIR})",
    )
    parser.add_argument(
        "--collection",
        type=str,
        default="car_manual",
        help="Chroma collection name.",
    )
    parser.add_argument(
        "--mineru-base-url",
        type=str,
        default=None,
        help="Override MinerU base URL (default: env MINERU_BASE_URL or http://localhost:8000).",
    )
    args = parser.parse_args()

    pdf_path = Path(args.pdf).expanduser().resolve()
    if not pdf_path.exists():
        raise SystemExit(f"PDF not found: {pdf_path}")

    ingest_pdf(
        pdf_path,
        source=args.source,  # type: ignore[arg-type]
        mineru_base_url=args.mineru_base_url or "",
        index_dir=Path(args.index_dir),
        collection_name=args.collection,
    )


if __name__ == "__main__":
    main()

