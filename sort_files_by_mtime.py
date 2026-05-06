#!/usr/bin/env python3
"""Sort files in a directory by last modification date and write to CSV."""
import argparse
import csv
import fnmatch
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Iterator


def iter_files(root: Path, pattern: str | None) -> Iterator[Path]:
    for dirpath, dirnames, filenames in os.walk(root, followlinks=False):
        dirnames[:] = [d for d in dirnames if not d.startswith(".")]
        for name in filenames:
            if name.startswith("."):
                continue
            if pattern is not None and not fnmatch.fnmatch(name, pattern):
                continue
            full = Path(dirpath) / name
            if full.is_symlink():
                continue
            yield full


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Sort files in a directory by last modification date and write to CSV.",
    )
    parser.add_argument("directory", type=Path, help="Directory to scan recursively.")
    parser.add_argument(
        "-o", "--output", type=Path, required=True, help="Output CSV path."
    )
    parser.add_argument(
        "--order",
        choices=["desc", "asc"],
        default="desc",
        help="Sort order: desc=newest first (default), asc=oldest first.",
    )
    parser.add_argument(
        "-p",
        "--pattern",
        type=str,
        default=None,
        help="Optional glob pattern matched against filenames, e.g. '*.py'. "
        "Quote it to keep the shell from expanding it.",
    )
    args = parser.parse_args()

    root = args.directory.resolve()
    if not root.is_dir():
        print(f"Error: {root} is not a directory", file=sys.stderr)
        sys.exit(1)

    entries: list[tuple[Path, float]] = []
    for path in iter_files(root, args.pattern):
        try:
            mtime = path.stat().st_mtime
        except OSError as exc:
            print(f"Warning: skipping {path}: {exc}", file=sys.stderr)
            continue
        entries.append((path, mtime))

    entries.sort(key=lambda e: e[1], reverse=(args.order == "desc"))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow(["path", "modified_at"])
        for path, mtime in entries:
            date = datetime.fromtimestamp(mtime).astimezone().date().isoformat()
            writer.writerow([str(path.relative_to(root)), date])

    print(f"Wrote {len(entries)} entries to {args.output}")


if __name__ == "__main__":
    main()
