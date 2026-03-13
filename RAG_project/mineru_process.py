import argparse
import io
import os
import time
import json
import zipfile
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("MINERU_API_KEY")
# mineru.net 官网 API（提交任务 / 查询结果）
TASK_BASE = os.getenv(
    "MINERU_TASK_URL", "https://mineru.net/api/v4/extract/task"
).rstrip("/")
# OpenDataLab 上传解析（本地文件）
FILE_PARSE_URL = os.getenv(
    "MINERU_BASE_URL", "https://api.minerU.opendatalab.com/v1"
).rstrip("/") + "/file_parse"

INPUT_DIR = Path("data/pdfs")
OUTPUT_DIR = Path("data/books")

PARSE_MAX_RETRIES = 3
PARSE_RETRY_BACKOFF = [5, 15, 45]
POLL_INTERVAL = 10  # 轮询任务状态间隔（秒）
POLL_TIMEOUT = 3600  # 轮询超时（秒）


def _task_headers():
    key = os.getenv("MINERU_API_KEY") or API_KEY
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {key}",
    }


def get_task_result(task_id: str):
    """GET 查询任务状态与结果。返回 (state, data)。state: done|running|pending|failed|converting"""
    url = f"{TASK_BASE}/{task_id}"
    try:
        res = requests.get(url, headers=_task_headers(), timeout=(30, 60))
        if res.status_code != 200:
            return None, None
        out = res.json()
        if out.get("code") != 0:
            return None, out
        data = out.get("data") or {}
        return data.get("state"), data
    except (requests.exceptions.RequestException, OSError):
        return None, None


def wait_for_task_and_get_zip_url(task_id: str):
    """轮询直到任务完成，返回 full_zip_url；失败返回 None。"""
    start = time.time()
    while time.time() - start < POLL_TIMEOUT:
        state, data = get_task_result(task_id)
        if state is None:
            print("  Query task failed, retry...")
            time.sleep(POLL_INTERVAL)
            continue
        if state == "done":
            return data.get("full_zip_url")
        if state == "failed":
            print(f"  Task failed: {data.get('err_msg', 'unknown')}")
            return None
        if state == "running" and data.get("extract_progress"):
            prog = data["extract_progress"]
            print(f"  Progress: {prog.get('extracted_pages', '?')}/{prog.get('total_pages', '?')} pages")
        else:
            print(f"  State: {state}, waiting...")
        time.sleep(POLL_INTERVAL)
    print("  Timeout waiting for task.")
    return None


def download_zip_and_extract_markdown(zip_url: str) -> str:
    """下载结果 zip，解压并合并所有 .md 内容。"""
    res = requests.get(zip_url, timeout=(30, 300))
    res.raise_for_status()
    z = zipfile.ZipFile(io.BytesIO(res.content), "r")
    md_parts = []
    for name in sorted(z.namelist()):
        if name.endswith(".md") and not name.startswith("__MACOSX"):
            with z.open(name) as f:
                md_parts.append(f.read().decode("utf-8", errors="replace"))
    z.close()
    return "\n\n".join(md_parts) if md_parts else ""


def parse_pdf_by_url(pdf_url: str, model_version: str = "vlm", extra_params: dict | None = None):
    """使用 mineru.net 官网 API：提交任务，轮询结果，返回最终用于保存的完整响应（含 data）。"""
    data = {"url": pdf_url, "model_version": model_version}
    if extra_params:
        data.update(extra_params)
    last_error = None
    for attempt in range(PARSE_MAX_RETRIES):
        try:
            if attempt > 0:
                time.sleep(PARSE_RETRY_BACKOFF[attempt - 1])
                print(f"  Retry {attempt}/{PARSE_MAX_RETRIES - 1}...")
            print(f"  POST {TASK_BASE} url={pdf_url[:60]}...")
            res = requests.post(
                TASK_BASE, headers=_task_headers(), json=data, timeout=(30, 60)
            )
            if res.status_code != 200:
                print(f"  Error Status: {res.status_code}")
                print(f"  Response: {res.text}")
                return None
            out = res.json()
            if out.get("code") != 0:
                print(f"  API error: {out.get('msg', out)}")
                return None
            task_data = out.get("data") or {}
            task_id = task_data.get("task_id")
            if not task_id:
                return out
            print(f"  task_id: {task_id}, polling for result...")
            zip_url = wait_for_task_and_get_zip_url(task_id)
            if not zip_url:
                return None
            print("  Downloading result zip...")
            md_content = download_zip_and_extract_markdown(zip_url)
            return {"data": {"markdown": md_content, "task_id": task_id}}
        except (requests.exceptions.RequestException, OSError) as e:
            last_error = e
            print(f"  Attempt {attempt + 1} failed: {e}")
    print(f"Failed after {PARSE_MAX_RETRIES} attempts: {last_error}")
    return None


def parse_pdf(file_path):
    """OpenDataLab：上传本地 PDF 解析（带重试）。"""
    path = Path(file_path)
    headers = {"Authorization": f"Bearer {os.getenv('MINERU_API_KEY') or API_KEY}"}
    last_error = None
    for attempt in range(PARSE_MAX_RETRIES):
        try:
            if attempt > 0:
                time.sleep(PARSE_RETRY_BACKOFF[attempt - 1])
                print(f"  Retry {attempt}/{PARSE_MAX_RETRIES - 1}...")
            print(f"  Sending {path.name} to {FILE_PARSE_URL}...")
            with open(path, "rb") as f:
                files = {"files": (path.name, f, "application/pdf")}
                response = requests.post(
                    FILE_PARSE_URL, headers=headers, files=files, timeout=(30, 600)
                )
            if response.status_code != 200:
                print(f"  Error Status: {response.status_code}")
                print(f"  Response: {response.text}")
                return None
            return response.json()
        except (requests.exceptions.RequestException, OSError) as e:
            last_error = e
            print(f"  Attempt {attempt + 1} failed: {e}")
    print(f"Failed after {PARSE_MAX_RETRIES} attempts: {last_error}")
    return None


def extract_markdown(result_json):
    """从 API 返回的 JSON 中提取 Markdown。"""
    # mineru.net: data 可能直接是内容或含 markdown
    data = result_json.get("data")
    if isinstance(data, str):
        return data
    if isinstance(data, dict):
        return data.get("markdown", "") or json.dumps(data, ensure_ascii=False, indent=2)
    content = (
        result_json.get("result", {}).get("markdown", "")
        or (data if isinstance(data, str) else "")
        or ""
    )
    if isinstance(content, dict):
        content = result_json.get("data", {}).get("markdown", "") or ""
    if not content:
        content = json.dumps(result_json, ensure_ascii=False, indent=2)
    return content if isinstance(content, str) else str(content)


def process_pdfs():
    """批量处理 data/pdfs 下 PDF（仅支持本地文件，走 file_parse）。"""
    INPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    pdf_files = list(INPUT_DIR.glob("*.pdf"))
    if not pdf_files:
        print(f"No PDF files found in {INPUT_DIR}")
        return
    print(f"Found {len(pdf_files)} PDFs to process.")
    for pdf_file in pdf_files:
        output_path = OUTPUT_DIR / (pdf_file.stem + ".md")
        if output_path.exists():
            print(f"Skipping {pdf_file.name}, output exists.")
            continue
        print(f"Processing {pdf_file.name}...")
        result_json = parse_pdf(pdf_file)
        if not result_json:
            continue
        content = extract_markdown(result_json)
        output_path.write_text(content, encoding="utf-8")
        print(f"  Saved to {output_path}")


def main():
    parser = argparse.ArgumentParser(description="MinerU API：PDF 转 Markdown（支持 URL 或本地文件）")
    parser.add_argument(
        "pdf_path_or_url",
        nargs="?",
        default=None,
        help="PDF 文件路径或 PDF 的 URL（mineru.net 官网 API 需 URL）",
    )
    parser.add_argument("-o", "--output", default=None, help="输出 .md 路径")
    parser.add_argument(
        "--task-id",
        default=None,
        help="仅根据 task_id 查询并拉取结果（不提交新任务）",
    )
    parser.add_argument(
        "--status",
        action="store_true",
        help="仅查询一次任务状态并打印 res.json() 与 res.json()['data']，不轮询、不下载",
    )
    parser.add_argument(
        "--profile",
        default=None,
        help="预设配置名称，例如 hsbc_en：pipeline + is_ocr=false + enable_formula=false + enable_table=true + language=en（仅 URL 模式）",
    )
    parser.add_argument(
        "--model",
        default="vlm",
        help="mineru.net 任务 model_version（仅 URL 模式）",
    )
    args = parser.parse_args()

    if not API_KEY:
        print("Error: MINERU_API_KEY not found in environment variables.")
        exit(1)

    # 仅查询一次状态并打印（与官网片段一致：GET + print status_code / json() / json()["data"]）
    if args.status:
        task_id = (args.task_id or args.pdf_path_or_url or "").strip()
        if not task_id:
            print("Error: --status requires --task-id or a task_id as argument.")
            exit(1)
        url = f"{TASK_BASE}/{task_id}"
        header = {"Content-Type": "application/json", "Authorization": f"Bearer {API_KEY}"}
        res = requests.get(url, headers=header, timeout=(30, 60))
        print(res.status_code)
        j = res.json()
        print(json.dumps(j, ensure_ascii=False, indent=2))
        if "data" in j:
            print("--- data ---")
            print(json.dumps(j["data"], ensure_ascii=False, indent=2))
        return

    # 根据 task_id 轮询并下载结果到 .md
    if args.task_id:
        task_id = args.task_id.strip()
        out_path = Path(args.output) if args.output else Path("data/books/result.md")
        out_path.parent.mkdir(parents=True, exist_ok=True)
        print(f"Querying task_id: {task_id}")
        zip_url = wait_for_task_and_get_zip_url(task_id)
        if not zip_url:
            exit(1)
        print("  Downloading result zip...")
        md_content = download_zip_and_extract_markdown(zip_url)
        out_path.write_text(md_content, encoding="utf-8")
        print(f"  Saved to {out_path}")
        return

    if not args.pdf_path_or_url:
        process_pdfs()
        return

    raw = args.pdf_path_or_url.strip()
    if raw.startswith("http://") or raw.startswith("https://"):
        # mineru.net 官网 API：通过 URL
        profile_params: dict | None = None
        model = args.model
        if args.profile == "hsbc_en":
            # 专门针对英文保险 PDF 的配置
            model = "pipeline" if args.model == "vlm" else args.model
            profile_params = {
                "is_ocr": False,
                "enable_formula": False,
                "enable_table": True,
                "language": "en",
            }
            print(f"Using profile hsbc_en -> model={model}, params={profile_params}")
        print(f"Processing URL (mineru.net task API)...")
        result_json = parse_pdf_by_url(raw, model_version=model, extra_params=profile_params)
        if not result_json:
            exit(1)
        content = extract_markdown(result_json)
        out_path = Path(args.output) if args.output else Path("data/books/from_url.md")
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(content, encoding="utf-8")
        print(f"  Saved to {out_path}")
    else:
        # 本地文件：OpenDataLab file_parse
        pdf_path = Path(raw)
        if not pdf_path.is_file():
            print(f"Error: file not found: {pdf_path}")
            exit(1)
        out_path = Path(args.output) if args.output else pdf_path.with_suffix(".md")
        out_path.parent.mkdir(parents=True, exist_ok=True)
        print(f"Processing {pdf_path.name} (file_parse)...")
        result_json = parse_pdf(pdf_path)
        if not result_json:
            exit(1)
        content = extract_markdown(result_json)
        out_path.write_text(content, encoding="utf-8")
        print(f"  Saved to {out_path}")


if __name__ == "__main__":
    main()
