# Maintenance & Operations Guide

**Date:** 2026-08-04
**Project:** AMPLIVO

## Overview
This guide provides technical operations teams with the standard operating procedures (SOPs) required to maintain the health and integrity of the AMPLIVO application in a production environment.

## 1. Routine Maintenance

### 1.1 Dependency Audits
- **Frequency:** Weekly (Automated via CI pipeline)
- **Procedure:** 
  - Backend: Run `pip-audit -r requirements.txt`.
  - Frontend: Run `npm audit`.
- **Action:** Any high or critical vulnerabilities must be patched immediately. Ensure all dependencies remain pinned until explicitly upgraded.

### 1.2 Database Maintenance
- **Vacuuming:** PostgreSQL automatically runs `autovacuum`. However, DBAs should monitor dead tuple bloat on heavily updated tables like `user_sessions` and `refresh_tokens`.
- **Backups:** Verify that the automated nightly snapshots and WAL archiving procedures are functioning correctly. Refer to the Database Backup & Recovery strategy document.

## 2. Troubleshooting & Diagnostics

### 2.1 Reading Application Logs
- Application logs are output in structured JSON format in production.
- Use the `correlation_id` to trace a single user's request path across various application layers (e.g., from Authentication Middleware to the Database Repository).

### 2.2 Health Checks
- `GET /health`: Use for basic orchestration restarts (e.g., Kubelet Liveness Probe).
- `GET /health/ready`: Use to ensure the application only receives traffic when the database is available (Readiness Probe).

### 2.3 Common Issues
- **`500 Internal Server Error` bursts:** Check the Slack/PagerDuty webhook alerts. High likelihood of database connectivity loss or an unhandled null-reference exception in a newly deployed feature.
- **`429 Too Many Requests`:** The IP or user is hitting the global rate limits. If this is a legitimate spike in traffic (e.g., a marketing campaign), the `RateLimiterMiddleware` thresholds in `main.py` may need to be adjusted.

## 3. Deployment Operations
- Follow the defined CI/CD pipeline.
- **Database Migrations:** Ensure `alembic upgrade head` is executed successfully before routing traffic to the new application containers. Never run destructive migrations (column drops) without a multi-phase deployment strategy.
