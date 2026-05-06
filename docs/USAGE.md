# sort_files_by_mtime

A small CLI that walks a directory recursively, sorts every regular file by last modification time, and writes the result to a CSV.

## Setup

Python 3.10+ is required (the script uses `X | None` type syntax).

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt   # stdlib only — installs nothing
```

## Usage

```sh
python3 sort_files_by_mtime.py <directory> -o <output.csv> [--order desc|asc] [--pattern GLOB]
```

### Arguments

| Flag | Required | Default | Description |
| --- | --- | --- | --- |
| `directory` (positional) | yes | — | Directory to scan recursively. |
| `-o`, `--output` | yes | — | CSV file to write. Parent directories are created if missing. |
| `--order` | no | `desc` | `desc` = newest first, `asc` = oldest first. |
| `-p`, `--pattern` | no | (all files) | Glob matched against the **filename** (not path), e.g. `*.py`, `report_*.csv`. Always quote it so the shell does not expand it before the script sees it. |

### Examples

```sh
# Newest files first, scanning the current directory
python3 sort_files_by_mtime.py . -o /tmp/files.csv

# Oldest first
python3 sort_files_by_mtime.py . -o /tmp/files.csv --order asc

# Only Python files
python3 sort_files_by_mtime.py ~/code -o /tmp/py.csv --pattern '*.py'

# Output into a directory that does not exist yet — it gets created
python3 sort_files_by_mtime.py . -o /tmp/new/dir/files.csv
```

## CSV format

Two columns:

| Column | Example | Notes |
| --- | --- | --- |
| `path` | `docs/USAGE.md` | Relative to the scanned directory. |
| `modified_at` | `2026-05-06T14:32:11+02:00` | Local-time ISO-8601 with offset. |

## Traversal rules

- Symlinks are **not** followed and symlinked files are skipped — avoids infinite loops on cyclic symlinks.
- Hidden files and directories (those whose name starts with `.`) are skipped — keeps `.git/`, `.venv/`, `.DS_Store`, etc. out of the output.
- Per-file `OSError` (e.g. permission denied during the walk) prints a warning to stderr and the file is skipped; the rest of the run continues.
- The script does **not** consult `.gitignore`. If you want to exclude additional content, narrow the scan with a more specific `directory` argument or use `--pattern`.
