# Backup & Recovery Strategy

**Date:** 2026-08-04
**Project:** AMPLIVO

## Overview
Data loss is unacceptable in enterprise environments. This document outlines the backup, retention, and disaster recovery plan for the AMPLIVO PostgreSQL database.

## Backup Tiers

### 1. Point-in-Time Recovery (PITR)
- **Mechanism:** PostgreSQL Write-Ahead Logs (WAL) are continuously archived to secure cloud storage (e.g., AWS S3).
- **RPO (Recovery Point Objective):** ~5 minutes.
- **Retention:** WAL files are retained for 30 days, enabling restoration to any precise second within that window.

### 2. Daily Snapshots
- **Mechanism:** Automated full storage volume snapshots are taken nightly at 03:00 UTC.
- **RTO (Recovery Time Objective):** < 1 hour.
- **Retention:** 
  - Daily snapshots kept for 7 days.
  - Weekly snapshots kept for 4 weeks.
  - Monthly snapshots kept for 1 year (Compliance requirement).

### 3. Logical Dumps
- **Mechanism:** `pg_dump` is executed weekly to generate portable logical backups.
- **Purpose:** Useful for extracting specific tables, migrating between distinct infrastructure providers, or seeding obfuscated staging environments.

## Disaster Recovery Procedure
1. **Identify the Incident:** Determine if the data loss was due to hardware failure, malicious activity, or accidental deletion.
2. **Select Restoration Point:**
   - If catastrophic failure: Restore from the latest daily snapshot.
   - If accidental deletion: Utilize PITR to restore to the moment immediately preceding the event.
3. **Validation:** The restored database instance must be isolated and validated by engineering leads before routing live production traffic.
4. **Post-Mortem:** Conduct a root-cause analysis to prevent recurrence.
