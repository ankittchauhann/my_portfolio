#!/usr/bin/env bash
file=$(jq -r '.tool_input.file_path // empty')
biome="$CLAUDE_PROJECT_DIR/node_modules/.bin/biome"

[ -n "$file" ] && [ -x "$biome" ] || exit 0

case "$file" in
  *.ts | *.tsx | *.js | *.jsx | *.json | *.css | *.astro)
    "$biome" check --write --no-errors-on-unmatched "$file" >/dev/null 2>&1
    ;;
esac
exit 0
