# User and Administrator Guide

**Date:** 2026-08-04
**Project:** AMPLIVO

## Overview
This guide provides instructions for both standard users interacting with the application and administrators managing the system.

---

## 1. User Guide

### 1.1 Account Registration
- Navigate to the **Sign Up** page.
- Provide a valid email address, a secure password, and accept the Terms of Service.
- An email verification link will be sent to the provided address via Brevo.
- You must click the verification link before gaining access to the platform.

### 1.2 Authentication (Login)
- Navigate to the **Log In** page.
- Enter your credentials.
- Note: Your account will be temporarily locked for 15 minutes after 5 consecutive failed login attempts.

### 1.3 Session Management
- Sessions automatically timeout after a period of inactivity.
- You can manually log out, which immediately invalidates your active session and revokes backend tokens.

---

## 2. Administrator Guide

### 2.1 Accessing the Admin Dashboard
- Users flagged with the `is_superuser=True` boolean in the database possess administrative privileges.
- Admin endpoints (e.g., `/metrics`) are strictly restricted and will return a `403 Forbidden` for standard users.

### 2.2 System Metrics
- Administrators can monitor real-time system performance (CPU, Memory, Active Tasks) via the `/metrics` endpoint on the backend. This requires passing a valid admin Bearer token.

### 2.3 User Management
- All authentication events (login successes, failures, lockouts) are logged to the `audit_logs` and `login_history` tables.
- Administrators can query these tables directly via SQL or through future administrative UI panels to trace suspicious activity.

### 2.4 Incident Response
- In the event of a security breach, administrators can forcefully revoke all refresh tokens for a specific user, requiring them to re-authenticate immediately across all devices.
