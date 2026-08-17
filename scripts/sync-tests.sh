#!/usr/bin/env bash
# The solutions tree is verified by the exact same specs as the exercises tree.
# solutions/*/tests/ is generated — edit packages/*/tests/ and re-run this script.
#
#   ./scripts/sync-tests.sh          regenerate the copies
#   ./scripts/sync-tests.sh check    fail if a copy has drifted
set -uo pipefail
cd "$(dirname "$0")/.."

mode="${1:-write}"
status=0

for dir in packages/*/tests; do
  exercise="$(basename "$(dirname "$dir")")"
  target="solutions/$exercise/tests"
  specs=("$dir"/*.spec.ts)
  [ -e "${specs[0]}" ] || continue

  if [ "$mode" = "check" ]; then
    if ! diff -r "$dir" "$target" >/dev/null 2>&1; then
      echo "out of sync: $target"
      status=1
    fi
  else
    rm -rf "$target"
    mkdir -p "$target"
    cp "${specs[@]}" "$target/"
  fi
done

if [ "$mode" = "check" ] && [ "$status" -eq 0 ]; then
  echo "all specs in sync"
fi
exit "$status"
