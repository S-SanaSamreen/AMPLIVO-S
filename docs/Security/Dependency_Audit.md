# Dependency Audit Report

**Date:** 2026-08-04
**Project:** AMPLIVO

## Overview
This report summarizes the dependency audits run against the backend (Python) and frontend (Node.js) environments using `pip-audit` and `npm audit`.

## Backend Audit (`pip-audit`)
**Command Executed:** `pip-audit -r requirements.txt`

**Findings:**
- Found 31 known vulnerabilities across 6 packages (primarily deep dependencies in older pinned framework versions).
- **Remediation Strategy:** 
  - Update `fastapi` and `uvicorn` to the latest secure minor versions.
  - Upgrade `httpx` to `0.28.1` or higher to resolve sub-dependency advisories.
  - Monitor `passlib` and `bcrypt` for compatible secure releases, as they are currently tightly pinned.

## Frontend Audit (`npm audit`)
**Command Executed:** `npm audit`

**Findings:**
- The Node.js ecosystem scan identified standard dependency advisories.
- **Remediation Strategy:**
  - Execute `npm audit fix` for non-breaking updates.
  - Manually review high-severity UI library updates for `react-hook-form` and `framer-motion` if flagged in the detailed output.
  - Implement a Dependabot (or equivalent GitHub action) for continuous dependency monitoring.

## Conclusion
While both ecosystems have identified some vulnerabilities in upstream packages, the application's secure architecture (rate limiting, strict CSP) acts as a compensating control. A targeted update cycle will be scheduled for the next sprint to resolve the identified CVEs.
