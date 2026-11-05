#!/usr/bin/env node
// PreToolUse hook on Edit/Write/MultiEdit: blocks em/en dashes in added text and flags new
// comment blocks over 2 lines (not blocked, so a truly essential long comment can stay).
import { existsSync, readFileSync } from 'node:fs'
import { extname } from 'node:path'
import { readHookInput } from './lib/shell.mjs'

const MAX_COMMENT_LINES = 2
const DASH = /[–—]/
const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.sh', '.py'])
const COMMENT_LINE = /^\s*(\/\/|\/\*|\*|#(?!!))/
const IGNORED_COMMENT = /eslint-|@ts-|prettier-ignore/

const input = readHookInput()
const tool = input.tool_input ?? {}
const file = tool.file_path ?? ''

// [oldText, newText] pairs for what this call writes.
let pairs = []
if (input.tool_name === 'Write') {
  const before = existsSync(file) ? readFileSync(file, 'utf8') : ''
  pairs = [[before, tool.content ?? '']]
} else if (input.tool_name === 'MultiEdit') {
  pairs = (tool.edits ?? []).map((e) => [e.old_string ?? '', e.new_string ?? ''])
} else {
  pairs = [[tool.old_string ?? '', tool.new_string ?? '']]
}

const dashLines = []
const longComments = []

for (const [oldText, newText] of pairs) {
  const oldLines = new Set(oldText.split('\n').map((l) => l.trim()))
  const lines = newText.split('\n')
  const isAdded = (l) => !oldLines.has(l.trim())

  for (const l of lines) if (isAdded(l) && DASH.test(l)) dashLines.push(l.trim())

  if (!CODE_EXT.has(extname(file).toLowerCase())) continue
  let run = []
  const flush = () => {
    if (run.length > MAX_COMMENT_LINES && run.some(isAdded)) longComments.push(run)
    run = []
  }
  for (const l of lines) {
    if (COMMENT_LINE.test(l) && !IGNORED_COMMENT.test(l)) run.push(l)
    else flush()
  }
  flush()
}

if (dashLines.length) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: `Blocked: the user never wants em or en dashes. Rewrite these lines with a colon, comma, period or plain hyphen:\n${dashLines.slice(0, 5).join('\n')}`,
    },
  }))
  process.exit(0)
}

if (longComments.length) {
  const sizes = longComments.map((r) => r.length).join(', ')
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      additionalContext: `Comment check: this edit adds comment blocks of ${sizes} lines in ${file}. The user wants comments of 1-2 short lines, only where the code can't speak for itself. Shorten or delete them in a follow-up edit unless the detail is truly essential.`,
    },
  }))
}
