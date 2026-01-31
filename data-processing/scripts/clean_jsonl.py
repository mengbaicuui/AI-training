import json
import os


def clean_jsonl(file_path):
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
                if "_origin_id" in data:
                    del data["_origin_id"]
            except json.JSONDecodeError as e:
                print(f"Error decoding line {line_num}: {e}")
                continue

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

            if not (has_query and has_positive and has_negative):
                deleted_records.append(data)
                continue

            valid_records.append(data)

    # Write back the valid records
    with open(file_path, "w", encoding="utf-8") as f:
        for record in valid_records:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    # Print deleted data
    print(f"Total records processed: {len(valid_records) + len(deleted_records)}")
    print(f"Kept valid records: {len(valid_records)}")
    print(f"Deleted records: {len(deleted_records)}")

    if deleted_records:
        print("\n=== DELETED DATA DETAILS ===")
        for i, record in enumerate(deleted_records, 1):
            print(f"[{i}] {json.dumps(record, ensure_ascii=False)}")


if __name__ == "__main__":
    file_path = "merge-large.jsonl"
    if os.path.exists(file_path):
        clean_jsonl(file_path)
    else:
        print(f"File not found: {file_path}")
