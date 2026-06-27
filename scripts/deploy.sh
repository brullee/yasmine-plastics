#!/bin/bash
[ -n "$1" ] && npm version "$1"
next build && git push --follow-tags
