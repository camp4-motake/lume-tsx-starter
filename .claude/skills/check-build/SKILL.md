---
name: check-build
description: Run the full verification gate (lint, type-check, production build) and summarize failures. Run before committing or when asked to verify the site builds.
allowed-tools: Bash(deno task:*), Bash(deno check:*)
---

Run `deno task check` — the project's verification gate. The canonical step list lives in the
`check` task in `deno.json` (currently: lint, `deno check _config.ts`, production build).

The task stops at the first failing step. When that happens, run the remaining steps from the
task individually so the report covers all failures, not just the first.

## Report

- If everything passes: one line confirming the gate is green.
- If anything fails: per step, quote the exact error output and name the offending file(s).
  Do not fix anything unless the user asked for fixes — report first.
