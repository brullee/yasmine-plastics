#!/usr/bin/env bash
# Gates for the verify skill. Usage: check.sh [--quick]
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../../.." || exit 1

quick=false
[ "${1:-}" = "--quick" ] && quick=true
status=0

run_step() {
  local label="$1"; shift
  echo "--- $label ---"
  if "$@"; then echo "✓ $label"; else echo "✗ $label"; status=1; fi
}

run_step "type-check + lint" npm run check

if $quick; then
  echo "- e2e skipped (--quick)"
else
  # One worker, like CI: several parallel helium-browser instances locally crash with
  # "Target page, context or browser has been closed" and fail tests that pass on their own.
  # Upstash warnings are expected without credentials - drop them so real errors stand out.
  run_step "e2e" bash -c "npx playwright test --reporter=line --workers=1 2>&1 | grep -v 'Upstash Redis'; exit \${PIPESTATUS[0]}"
fi

# Two comparisons: uncommitted edits against HEAD, and this branch's commits against where
# it left main. One base-to-working-tree diff would miss an edit to a test file that was
# itself added on this branch - the whole file just shows up as new.
echo "--- tests not weakened ---"
base=$(git merge-base HEAD origin/main 2>/dev/null || git rev-parse HEAD)
diff=$(git diff HEAD -- e2e/; git diff "$base" HEAD -- e2e/)
removed=$(grep -E '^-[^-].*(expect\(|test\()' <<< "$diff" || true)
added_skips=$(grep -E '^\+[^+].*(\.(skip|only|fixme)\()' <<< "$diff" || true)
if [ -z "$removed$added_skips" ]; then
  echo "✓ no assertions or tests removed, nothing skipped"
else
  echo "⚠ review these e2e changes - justify each one:"
  [ -n "$removed" ] && printf '%s\n' "$removed"
  [ -n "$added_skips" ] && printf '%s\n' "$added_skips"
  status=1
fi

exit $status
