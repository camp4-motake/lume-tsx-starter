---
name: commit-changes
description: Stage current changes and commit them.
disable-model-invocation: true
allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *)
---

Stage the current changes, generate a commit message describing the changes, and commit them.
Use the Conventional Commits format (e.g., feat, fix, refactor, docs).
Write the commit message in English unless otherwise instructed.
Run lint/format as needed before committing.
