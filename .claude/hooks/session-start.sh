#!/bin/bash
set -euo pipefail

# Only run in Claude Code on the web (remote) sessions.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Install project dependencies so type-check and build work in the session.
# `npm install` (not `ci`) lets the cached container reuse node_modules.
npm install
