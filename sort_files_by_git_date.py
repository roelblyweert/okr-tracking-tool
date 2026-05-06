#!/usr/bin/env python3
"""Sort tracked files by their last git commit date and write to CSV."""
import argparse
import csv
import fnmatch
import subprocess
import sys
from pathlib import Path


def git_toplevel(directory: Path) -> Path | None:
    result = subprocess.run(
        ["git", "-C", str(directory), "rev-parse", "--show-toplevel"],
        capture_output=True,
    )
    if result.returncode != 0:
        return None
    return Path(result.stdout.decode().strip())


def list_tracked(toplevel: Path, rel_dir: str) -> list[bytes]:
    result = subprocess.run(
        ["git", "-C", str(toplevel), "ls-files", "-z", "--", rel_dir],
        capture_output=True,
        check=True,
    )
    return [p for p in result.stdout.split(b"\x00") if p]


def _looks_like_date(b: bytes) -> bool:
    return (
        len(b) == 10
        and b[4:5] == b"-"
        and b[7:8] == b"-"
        and b[:4].isdigit()
        and b[5:7].isdigit()
        and b[8:10].isdigit()
    )


def last_commit_dates(toplevel: Path, rel_dir: str) -> dict[bytes, str]:
    result = subprocess.run(
        [
            "git", "-C", str(toplevel), "log",
            "--no-renames", "--diff-filter=AMR",
            "--name-only", "-z",
            "--pretty=format:%x00%as%x00",
            "--", rel_dir,
        ],
        capture_output=True,
        check=True,
    )
    dates: dict[bytes, str] = {}
    current_date: str | None = None
    for raw in result.stdout.split(b"\x00"):
        chunk = raw.lstrip(b"\n")
        if not chunk:
            continue
        if _looks_like_date(chunk):
            current_date = chunk.decode("ascii")
            continue
        if current_date is not None and chunk not in dates:
            dates[chunk] = current_date
    return dates


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Sort tracked files by their last git commit date and write to CSV.",
    )
    parser.add_argument("directory", type=Path, help="Directory to scan (must be inside a git working tree).")
    parser.add_argument("-o", "--output", type=Path, required=True, help="Output CSV path.")
    parser.add_argument(
        "--order",
        choices=["desc", "asc"],
        default="desc",
        help="Sort order: desc=newest first (default), asc=oldest first.",
    )
    parser.add_argument(
        "-p", "--pattern", type=str, default=None,
        help="Optional glob pattern matched against filenames, e.g. '*.py'. "
        "Quote it to keep the shell from expanding it.",
    )
    args = parser.parse_args()

    directory = args.directory.resolve()
    if not directory.is_dir():
        print(f"Error: {directory} is not a directory", file=sys.stderr)
        sys.exit(1)

    toplevel = git_toplevel(directory)
    if toplevel is None:
        print(f"Error: {directory} is not inside a git working tree", file=sys.stderr)
        sys.exit(1)

    try:
        rel = directory.relative_to(toplevel)
    except ValueError:
        rel = Path(".")
    rel_dir = "." if str(rel) == "." else str(rel)

    tracked = list_tracked(toplevel, rel_dir)
    if args.pattern is not None:
        pattern = args.pattern
        tracked = [
            p for p in tracked
            if fnmatch.fnmatch(Path(p.decode("utf-8", errors="surrogateescape")).name, pattern)
        ]

    dates = last_commit_dates(toplevel, rel_dir)

    entries: list[tuple[str, str]] = []
    for path_bytes in tracked:
        date = dates.get(path_bytes)
        path_str = path_bytes.decode("utf-8", errors="surrogateescape")
        if date is None:
            print(f"Warning: skipping {path_str}: tracked but no commit history", file=sys.stderr)
            continue
        rel_path = path_str if rel_dir == "." else str(Path(path_str).relative_to(rel_dir))
        entries.append((rel_path, date))

    entries.sort(key=lambda e: e[1], reverse=(args.order == "desc"))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", newline="", encoding="utf-8", errors="surrogateescape") as fh:
        writer = csv.writer(fh)
        writer.writerow(["path", "last_committed_on"])
        for path, date in entries:
            writer.writerow([path, date])

    print(f"Wrote {len(entries)} entries to {args.output}")


if __name__ == "__main__":
    main()
