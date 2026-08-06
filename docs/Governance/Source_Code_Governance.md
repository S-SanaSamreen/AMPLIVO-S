# Source Code Governance

**Date:** 2026-08-04
**Project:** AMPLIVO

## 1. Git Workflow & Branching Strategy
The project strictly follows a customized **Trunk-Based Development** model to ensure continuous integration without long-lived feature branches blocking deployments.

- `main`: The single source of truth. Always deployable.
- `feature/*`: Short-lived branches (lifespan < 2 days). Must be squashed and merged into `main` via Pull Requests (PR).
- `hotfix/*`: Emergency patches branching off `main`, bypassing the standard sprint lifecycle but requiring immediate peer review.

### Pull Request (PR) Requirements
- Minimum 1 approved peer review.
- Must pass all GitHub Actions CI checks (Testing, Security Audits, Linting).
- Code coverage must not dip below the 80% threshold.

## 2. Release Management
- **Versioning:** Semantic Versioning (SemVer) `MAJOR.MINOR.PATCH`.
- **Tags:** Releases are triggered automatically by tagging a commit on the `main` branch (e.g., `v1.2.0`). This kicks off the deployment pipeline to production.
- **Changelog:** A `CHANGELOG.md` is maintained utilizing Conventional Commits (`feat:`, `fix:`, `chore:`).

## 3. Code Ownership
To ensure accountability, critical directories are mapped to specific engineering domains:

- `frontend/`: Managed by the **Frontend Guild**. Codeowners automatically requested for PRs altering this directory.
- `Backend/app/core/`, `Backend/app/middleware/`: Managed by the **Platform Security Team**.
- `Backend/app/api/`: Managed by the **Backend Feature Team**.

## 4. License Compliance
- The internal codebase is proprietary and strictly licensed under the **Enterprise EULA**.
- **Third-Party Open Source:** `pip-audit` and `npm audit` pipelines check license compatibility. Affero General Public License (AGPL) or similar infectious copyleft licenses are strictly prohibited in the dependency tree to prevent forced open-sourcing of the proprietary monolith.
