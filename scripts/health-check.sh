#!/usr/bin/env bash
# Checks that a deployment of the site is up and actually rendering, not just returning
# 200. Shared by the daily health-check workflow and Claude's check-live skill.
# Usage: scripts/health-check.sh [site-url]   (defaults to production)
set -u
SITE="${1:-https://www.yasmineplastics.com}"
SITE="${SITE%/}"
failed=0

# Record which deployment was checked - informational, never fails the run.
echo "site: $SITE"
echo "live: $(curl -sS --fail --max-time 30 "$SITE/api/version" 2>/dev/null || echo 'version unavailable')"

# $1 path, remaining args: strings the HTML must contain
check() {
  path=$1; shift
  # --retry covers a Neon cold start; --fail turns any 4xx/5xx into an error
  if ! body=$(curl -sSL --fail --retry 2 --retry-delay 10 --max-time 60 "$SITE$path"); then
    echo "::error::$path did not return a successful response"
    failed=1
    return
  fi
  missing=0
  for marker in "$@"; do
    if ! grep -qF "$marker" <<< "$body"; then
      echo "::error::$path is missing \"$marker\" - the page rendered without it"
      missing=1
    fi
  done
  if [ $missing -eq 0 ]; then echo "ok $path"; else failed=1; fi
}

check /             '<html'
# Product data from Payload - only present when the database query succeeded.
check /en/products  'categoryNameEn'
# The login form itself is drawn client-side, so look for the server-rendered brand block
# and the form's client reference instead - both are absent when the login view crashes
# while rendering.
check /admin/login  'login__brand' 'LoginViewForm'

exit $failed
