# CLAUDE.md

This file provides guidance for AI assistants (Claude and others) working in
this repository.

## Repository Overview

**alo-games** is a games project by Jan Nonnen (helvalius), currently in its
initial setup phase. Only a MIT LICENSE file has been committed so far — no
application code, framework, or tooling has been added yet.

- **License**: MIT (Copyright 2026 Jan Nonnen)
- **Remote**: `http://local_proxy@127.0.0.1:35323/git/helvalius/alo-games`
- **Default branch**: `main`

---

## Repository Status

> **This repository is empty.** When code, dependencies, and tooling are added,
> update this file to reflect the actual stack, conventions, and workflows.

---

## Git Workflow

### Branching

- Feature branches must follow the pattern: `claude/<short-description>-<session-id>`
- Never push directly to `main`
- Always create a PR/MR for review before merging

### Commits

- Use clear, descriptive commit messages in the imperative mood:
  `Add player movement controller`, not `added stuff`
- Keep commits focused and atomic
- GPG signing is enabled on this repository — do not bypass it

### Pushing

Always use the `-u` flag when pushing a new branch:

```bash
git push -u origin <branch-name>
```

If a push fails due to a network error, retry with exponential backoff:
2 s → 4 s → 8 s → 16 s (maximum 4 retries).

---

## Development Conventions (to be filled in)

Once the technology stack is chosen, document the following here:

### Project Structure

```
# Add directory layout once source code exists
```

### Setup & Installation

```bash
# Add setup commands once dependencies are defined
```

### Running the Application

```bash
# Add run commands once the project is bootstrapped
```

### Running Tests

```bash
# Add test commands once a test framework is chosen
```

### Build & Deployment

```bash
# Add build/deploy commands once CI/CD is configured
```

---

## Key Conventions for AI Assistants

1. **Read before editing.** Always read a file before modifying it.
2. **Minimal changes.** Only change what is directly requested. Avoid
   refactoring, adding comments, or "cleaning up" surrounding code unless
   asked.
3. **No speculative features.** Do not add error handling, validation, or
   abstractions for scenarios that don't exist yet.
4. **Security first.** Never introduce SQL injection, XSS, command injection,
   or other OWASP Top 10 vulnerabilities.
5. **No secrets in code.** Never commit API keys, passwords, or tokens.
   Use environment variables and document them in `.env.example`.
6. **Branch discipline.** All work goes on the designated feature branch.
   Never push to `main` without explicit permission.
7. **Update this file.** Whenever significant new tooling, conventions, or
   workflows are established, update CLAUDE.md to reflect the current state.

---

## Environment Variables

No environment variables are defined yet. When they are added, document them
here and maintain a `.env.example` file at the repository root.

---

## CI/CD

No CI/CD pipeline is configured yet. When one is added, document the workflow
triggers, required secrets, and deployment targets here.
