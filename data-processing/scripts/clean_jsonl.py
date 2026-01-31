import json
import os


def validate_and_clean_record(data):
    """
    Validates a record and removes unnecessary fields.
    Returns (is_valid, cleaned_data)
    """
    if "_origin_id" in data:
        del data["_origin_id"]

    # Check for required fields based on file inspection
    # Keys are: messages (Query), positive_messages, negative_messages

    has_query = False
    if (
        "messages" in data
        and isinstance(data["messages"], list)
        and len(data["messages"]) > 0
    ):
        has_query = True

    has_positive = False
    if (
        "positive_messages" in data
        and isinstance(data["positive_messages"], list)
        and len(data["positive_messages"]) > 0
    ):
        has_positive = True

    has_negative = False
    if (
        "negative_messages" in data
        and isinstance(data["negative_messages"], list)
        and len(data["negative_messages"]) > 0
    ):
        has_negative = True

    if has_query and has_positive and has_negative:
        return True, data
    return False, data


def clean_json_list(file_path):
    """Handles JSON Array files"""
    with open(file_path, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            return False  # Not a JSON list file

    if not isinstance(data, list):
        return False  # Not a list

    valid_records = []
    deleted_records = []

    for record in data:
        is_valid, cleaned_record = validate_and_clean_record(record)
        if is_valid:
            valid_records.append(cleaned_record)
        else:
            deleted_records.append(cleaned_record)

    # Write back
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(valid_records, f, ensure_ascii=False, indent=2)

    print_stats(len(valid_records), len(deleted_records), deleted_records)
    return True


def clean_jsonl_file(file_path):
    """Handles JSONL files"""
    deleted_records = []
    valid_records = []

    # Read the file
    with open(file_path, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
                is_valid, cleaned_record = validate_and_clean_record(data)
                if is_valid:
                    valid_records.append(cleaned_record)
                else:
                    deleted_records.append(cleaned_record)

            except json.JSONDecodeError as e:
                print(f"Error decoding line {line_num}: {e}")
                continue

    # Write back the valid records
    with open(file_path, "w", encoding="utf-8") as f:
        for record in valid_records:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    print_stats(len(valid_records), len(deleted_records), deleted_records)


def print_stats(valid_count, deleted_count, deleted_records):
    print(f"Total records processed: {valid_count + deleted_count}")
    print(f"Kept valid records: {valid_count}")
    print(f"Deleted records: {deleted_count}")

    if deleted_records:
        print("\n=== DELETED DATA DETAILS ===")
        # Show first 10
        limit = 10
        for i, record in enumerate(deleted_records[:limit], 1):
            print(f"[{i}] {json.dumps(record, ensure_ascii=False)}")
        if len(deleted_records) > limit:
             print(f"... and {len(deleted_records) - limit} more deleted records.")


def clean_jsonl(file_path):
    # Try cleaning as JSON list first
    if clean_json_list(file_path):
        return

    # Fallback to JSONL
    clean_jsonl_file(file_path)


if __name__ == "__main__":
    file_path = "merge-large.jsonl"
    if os.path.exists(file_path):
        clean_jsonl(file_path)
    else:
        print(f"File not found: {file_path}")
