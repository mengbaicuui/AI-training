#!/usr/bin/env python3
"""
使用 PaddleOCR-VL-1.5 解析PDF 或图像，输出结构化文本（Markdown/JSON）。
可选 --ocr-correct 模式：同时运行 PP-OCRv5 并用其精准字符识别结果修正 VL 的误识别
（如 S$ 货币符号丢失），融合两者优势。
适用于 Apple Silicon（可选 MLX-VLM 加速）。参考：
https://www.paddleocr.ai/latest/version3.x/pipeline_usage/PaddleOCR-VL-Apple-Silicon.html
"""
from pathlib import Path
import argparse
import os
import re
import sys
import types

SCRIPT_DIR = Path(__file__).resolve().parent
REFERENCE_DIR = SCRIPT_DIR.parent / "reference"
DEFAULT_OUT_DIR = SCRIPT_DIR.parent / "parsed"


def _patch_langchain_compat():
    """新版 langchain 移除了 paddleocr/paddlex 依赖的老路径，注入轻量兼容层。"""
    lc = sys.modules.setdefault("langchain", types.ModuleType("langchain"))
    try:
        from langchain.docstore.document import Document as _D  # noqa: F401
    except Exception:
        try:
            from langchain_core.documents import Document
            ds = types.ModuleType("langchain.docstore")
            dd = types.ModuleType("langchain.docstore.document")
            dd.Document = Document; ds.document = dd; lc.docstore = ds
            sys.modules["langchain.docstore"] = ds
            sys.modules["langchain.docstore.document"] = dd
        except Exception:
            pass
    try:
        from langchain.text_splitter import RecursiveCharacterTextSplitter as _R  # noqa: F401
    except Exception:
        try:
            from langchain_text_splitters import RecursiveCharacterTextSplitter
            ts = types.ModuleType("langchain.text_splitter")
            ts.RecursiveCharacterTextSplitter = RecursiveCharacterTextSplitter
            lc.text_splitter = ts
            sys.modules["langchain.text_splitter"] = ts
        except Exception:
            pass


# ---------------------------------------------------------------------------
# OCRv5 fusion helpers
# ---------------------------------------------------------------------------

def collect_ocr_corrections(ocr_result) -> dict:
    """
    从 PP-OCRv5 识别结果中提取货币修正映射。
    例：OCRv5 识别出 'S$200' → 记录 {'S200': 'S$200'}
    只收录高置信度（score >= threshold）的结果，避免误修正。
    """
    corrections = {}
    texts = ocr_result.get("rec_texts", [])
    scores = ocr_result.get("rec_scores", [])
    for text, score in zip(texts, scores):
        if score < 0.85:
            continue
        for m in re.finditer(r'([A-Z]{1,3})\$([\d,\.]+)', text):
            prefix, number = m.group(1), m.group(2)
            wrong = f"{prefix}{number}"      # e.g. S200
            correct = f"{prefix}${number}"   # e.g. S$200
            corrections[wrong] = correct
    return corrections


def apply_corrections(content: str, corrections: dict) -> str:
    """
    将 corrections 中的错误形式替换为正确形式。
    按长度降序替换，避免短串误覆盖长串（如先替换 S$1,000 再替换 S$1）。
    """
    for wrong, correct in sorted(corrections.items(), key=lambda x: -len(x[0])):
        content = content.replace(wrong, correct)
    return content


def run_ocr_on_images(image_paths: list, ocr_pipeline) -> dict:
    """
    对多张图片运行 PP-OCRv5，返回合并的 corrections 字典。
    """
    all_corrections = {}
    for img_path in image_paths:
        try:
            results = list(ocr_pipeline.predict(str(img_path)))
            for res in results:
                corrections = collect_ocr_corrections(res)
                all_corrections.update(corrections)
        except Exception as e:
            print(f"  [ocr-correct] OCRv5 failed on {img_path}: {e}")
    return all_corrections


def extract_pdf_page_images(pdf_path: Path, scale: float = 2.0) -> list:
    """将 PDF 每页渲染为临时图片，返回图片路径列表。"""
    import pypdfium2 as pdfium
    pdf = pdfium.PdfDocument(str(pdf_path))
    tmp_dir = pdf_path.parent / f"_ocrtmp_{pdf_path.stem}"
    tmp_dir.mkdir(exist_ok=True)
    img_paths = []
    for i, page in enumerate(pdf):
        img_path = tmp_dir / f"page_{i:04d}.png"
        if not img_path.exists():
            bitmap = page.render(scale=scale)
            bitmap.to_pil().save(str(img_path))
        img_paths.append(img_path)
    return img_paths


def correct_pages_res(pages_res: list, corrections: dict) -> list:
    """
    尝试就地修正 VL pipeline 返回的 pages_res 中每个 block 的 block_content。
    如果结果对象不支持修改，则静默跳过（后续兜底 markdown 修正）。
    """
    if not corrections:
        return pages_res
    for page_res in pages_res:
        try:
            parsing_list = page_res["res"]["parsing_res_list"]
            for block in parsing_list:
                block["block_content"] = apply_corrections(
                    block.get("block_content", ""), corrections
                )
        except Exception:
            pass  # result object may not support mutation; markdown fallback will handle it
    return pages_res


def correct_saved_markdowns(out_dir: Path, corrections: dict):
    """对已保存的 Markdown 文件做修正（兜底路径）。"""
    if not corrections:
        return
    for md_file in sorted(out_dir.glob("*.md")):
        content = md_file.read_text(encoding="utf-8")
        new_content = apply_corrections(content, corrections)
        if new_content != content:
            md_file.write_text(new_content, encoding="utf-8")
            print(f"  [ocr-correct] patched {md_file.name}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Parse PDF/image with PaddleOCR-VL-1.5 (doc_parser)."
    )
    parser.add_argument(
        "input",
        nargs="?",
        default=None,
        help="PDF or image path. If omitted, parse all PDFs in reference/.",
    )
    parser.add_argument(
        "-o",
        "--output-dir",
        type=Path,
        default=DEFAULT_OUT_DIR,
        help=f"Output directory for Markdown/JSON (default: {DEFAULT_OUT_DIR})",
    )
    parser.add_argument(
        "--mlx",
        action="store_true",
        help="Use MLX-VLM server (http://localhost:8111/).",
    )
    parser.add_argument(
        "--no-mlx",
        action="store_true",
        help="Do not use MLX-VLM; use default backend.",
    )
    parser.add_argument(
        "--model",
        type=str,
        default=None,
        metavar="MODEL_NAME",
        help="VLM model name for MLX server (e.g. PaddlePaddle/PaddleOCR-VL-1.5).",
    )
    parser.add_argument(
        "--max-concurrency",
        type=int,
        default=None,
        metavar="N",
        help="vl_rec_max_concurrency for VLM server.",
    )
    parser.add_argument(
        "--merge-tables",
        action="store_true",
        help="Merge cross-page tables when restructure_pages.",
    )
    parser.add_argument(
        "--relevel-titles",
        action="store_true",
        help="Rebuild multi-level titles when restructure_pages.",
    )
    parser.add_argument(
        "--concatenate-pages",
        action="store_true",
        help="Merge all pages into one result.",
    )
    parser.add_argument(
        "--ocr-correct",
        action="store_true",
        help=(
            "Fuse PP-OCRv5 results with VL-1.5 output: run OCRv5 alongside VL, "
            "use its high-confidence character recognition to correct currency symbols "
            "(e.g. S$ → S) and other special characters that VLM may misread."
        ),
    )
    parser.add_argument(
        "--ocr-version",
        type=str,
        default="PP-OCRv5",
        help="PP-OCR version for --ocr-correct (default: PP-OCRv5).",
    )
    args = parser.parse_args()

    _patch_langchain_compat()

    try:
        from paddleocr import PaddleOCRVL
    except ImportError:
        print(
            "Please install: pip install paddlepaddle>=3.2.1 'paddleocr[doc-parser]'\n"
            "See SKILL.md for full setup."
        )
        raise SystemExit(1)

    # --- Build VL pipeline ---
    use_mlx = args.mlx or (os.environ.get("PADDLEOCR_VL_MLX") == "1" and not args.no_mlx)
    vl_kw = {}
    if use_mlx:
        model_name = args.model or os.environ.get(
            "VL_REC_MODEL_NAME", "PaddlePaddle/PaddleOCR-VL-1.5"
        )
        vl_kw = {
            "vl_rec_backend": "mlx-vlm-server",
            "vl_rec_server_url": os.environ.get("VL_REC_SERVER_URL", "http://localhost:8111/"),
            "vl_rec_api_model_name": model_name,
        }
        print(f"[mlx] model: {model_name}")
    concurrency = args.max_concurrency or (int(os.environ.get("VL_REC_MAX_CONCURRENCY", 0)) or None)
    if concurrency is not None:
        vl_kw["vl_rec_max_concurrency"] = concurrency

    vl_pipeline = PaddleOCRVL(**vl_kw) if vl_kw else PaddleOCRVL()

    # --- Build OCRv5 pipeline (optional) ---
    ocr_pipeline = None
    if args.ocr_correct:
        from paddleocr import PaddleOCR
        print(f"[ocr-correct] Loading {args.ocr_version} for fusion...")
        ocr_pipeline = PaddleOCR(
            ocr_version=args.ocr_version,
            lang="en",
            use_angle_cls=False,
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
        )
        print("[ocr-correct] OCRv5 ready.")

    # --- Resolve input paths ---
    args.output_dir.mkdir(parents=True, exist_ok=True)

    if args.input:
        paths = [Path(args.input).expanduser().resolve()]
        if not paths[0].exists():
            print(f"File not found: {paths[0]}")
            raise SystemExit(1)
    else:
        paths = list(REFERENCE_DIR.glob("*.pdf")) if REFERENCE_DIR.exists() else []
        if not paths:
            print(f"No PDFs in {REFERENCE_DIR}.")
            raise SystemExit(1)

    # --- Process each file ---
    for path in paths:
        stem = path.stem
        out_dir = args.output_dir / stem
        out_dir.mkdir(parents=True, exist_ok=True)
        print(f"Parsing: {path}")

        try:
            # Step 1: collect OCRv5 corrections before VL (runs in parallel conceptually)
            corrections = {}
            if ocr_pipeline is not None:
                if path.suffix.lower() == ".pdf":
                    img_paths = extract_pdf_page_images(path, scale=2.0)
                else:
                    img_paths = [path]
                print(f"  [ocr-correct] Running OCRv5 on {len(img_paths)} image(s)...")
                corrections = run_ocr_on_images(img_paths, ocr_pipeline)
                print(f"  [ocr-correct] {len(corrections)} corrections found: "
                      f"{dict(list(corrections.items())[:5])}{'...' if len(corrections) > 5 else ''}")

            # Step 2: VL parsing
            output = vl_pipeline.predict(input=str(path))
            pages_res = list(output)

            # Step 3: apply corrections to VL block_content in-place
            if corrections:
                pages_res = correct_pages_res(pages_res, corrections)

            # Step 4: restructure and save
            restructured = vl_pipeline.restructure_pages(
                pages_res,
                merge_tables=args.merge_tables,
                relevel_titles=args.relevel_titles,
                concatenate_pages=args.concatenate_pages,
            )
            restructured = list(restructured)
            total = len(restructured)
            for idx, res in enumerate(restructured, start=1):
                page_id = getattr(res, "page_id", idx)
                print(f"  [{stem}] saving page {idx}/{total} (page_id={page_id})")
                res.print()
                res.save_to_json(save_path=str(out_dir))
                res.save_to_markdown(save_path=str(out_dir))

            # Step 5: markdown fallback correction (in case in-place mutation didn't work)
            if corrections:
                correct_saved_markdowns(out_dir, corrections)

            print(f"  -> {out_dir}")

        except Exception as e:
            import traceback
            print(f"  Error: {e}")
            traceback.print_exc()


if __name__ == "__main__":
    main()
