# sort_files_by_git_date

A small CLI that lists every git-tracked file under a directory, sorts them by the date of the most recent commit that touched each file, and writes the result to a CSV.

## Setup

Python 3.10+ is required (the script uses `X | None` type syntax). The directory you scan must be inside a git working tree — the tool reads commit history, not filesystem timestamps.

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt   # stdlib only — installs nothing
```

## Usage

```sh
python3 sort_files_by_git_date.py <directory> -o <output.csv> [--order desc|asc] [--pattern GLOB]
```

### Arguments

| Flag | Required | Default | Description |
| --- | --- | --- | --- |
| `directory` (positional) | yes | — | Directory to scan. Must be inside a git working tree. |
| `-o`, `--output` | yes | — | CSV file to write. Parent directories are created if missing. |
| `--order` | no | `desc` | `desc` = newest first, `asc` = oldest first. |
| `-p`, `--pattern` | no | (all files) | Glob matched against the **filename** (not path), e.g. `*.py`, `report_*.csv`. Always quote it so the shell does not expand it before the script sees it. |

### Examples

```sh
# Newest files first, scanning the current directory
python3 sort_files_by_git_date.py . -o /tmp/files.csv

# Oldest first
python3 sort_files_by_git_date.py . -o /tmp/files.csv --order asc

# Only Python files
python3 sort_files_by_git_date.py ~/code -o /tmp/py.csv --pattern '*.py'

# Output into a directory that does not exist yet — it gets created
python3 sort_files_by_git_date.py . -o /tmp/new/dir/files.csv
```

## CSV format

Two columns:

| Column | Example | Notes |
| --- | --- | --- |
| `path` | `docs/USAGE.md` | Relative to the scanned directory. |
| `last_committed_on` | `2026-05-06` | ISO-8601 author date (`YYYY-MM-DD`) of the most recent commit that touched this path. |

## What is included

- Only files **tracked by git** are listed. Untracked files, files matched by `.gitignore`, and submodule contents are excluded.
- A rename counts as a modification of the **new** path (the tool runs `git log` with `--no-renames`, so a freshly-renamed file shows the rename commit's date rather than its pre-rename history).
- Files staged but never committed are skipped with a warning to stderr.
- The `--pattern` glob is applied to the basename only.
- If the `directory` argument is not inside a git working tree, the tool prints an error and exits with status 1.
