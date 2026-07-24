---
name: check-build
description: Run the full verification gate (lint, type-check, production build) and summarize failures. Run before committing or when asked to verify the site builds.
allowed-tools: Bash(deno task *) Bash(deno check *)
---

Run the project's verification gate in order. Continue through all steps even if one fails, then
summarize.

## Steps

1. `deno task lint` — deno lint + stylelint on `src/**/*.css`.
2. `deno check _config.ts` — type-checks the config, plugins, and their import graph.
3. `deno task build` — production build to `_site/`; this is where the image pipeline
   (`imageDimensions → picture → imageQuality → transformImages → dropRedundantImages`) and
   cache busting surface errors that lint cannot catch.

## Report

- If everything passes: one line confirming the gate is green.
- If anything fails: per step, quote the exact error output and name the offending file(s).
  Do not fix anything unless the user asked for fixes — report first.
