#!/bin/bash
set -e
next build
[ -n "$1" ] && npm version "$1"
git push origin "$(git branch --show-current)" --follow-tags
