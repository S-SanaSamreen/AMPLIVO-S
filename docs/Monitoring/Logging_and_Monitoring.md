# Logging & Monitoring Strategy

**Date:** 2026-08-04
**Project:** AMPLIVO

## Overview
Enterprise systems require rigorous observability to maintain Service Level Objectives (SLOs) and quickly root-cause production incidents. The AMPLIVO backend implements a multi-layered logging and monitoring strategy.

## 1. Structured Logging
The application uses Python's standard `logging` library, wrapped securely to output structured JSON in production (`ENVIRONMENT=production` and `LOG_FORMAT=json`).
- **Benefits:** Easily parsable by log aggregators (e.g., Datadog, ELK stack).
- **Enrichment:** Every log entry associated with a request is enriched with:
  - `request_id`: A unique UUID for the specific HTTP request.
  - `correlation_id`: An optional UUID passed by upstream clients (e.g., via `X-Correlation-ID`) to trace requests across microservices.

## 2. Audit Logging
Regulatory compliance requires strict tracking of sensitive user actions.
- **Middleware:** `AuditMiddleware` asynchronously records critical authentication events to the `audit_logs` database table.
- **Coverage:** Login attempts (success/failure), Registration, Password Resets, Token Revocations.
- **Payload:** Captures the `user_id`, `ip_address`, target `entity_name`, and a JSON diff of `changes`.

## 3. Performance Metrics & Health Probes
- `/metrics`: Emits internal state such as active task counts, memory footprint, and CPU utilization.
- `/health`: Fast liveness probe for Kubernetes/ECS orchestrators.
- `/health/ready`: Deep readiness probe verifying database connectivity before accepting traffic.
- **PerformanceLogger:** Middleware logging requests exceeding the `SLOW_REQUEST_THRESHOLD_MS` to isolate performance regressions.

## 4. Alerting & Incident Response
- **Implementation:** `app/core/alerting.py` provides an asynchronous Webhook integration.
- **Trigger:** Any unhandled exception resulting in a `500 Internal Server Error` automatically pushes an alert payload (including traceback and request identifiers) to the configured `ALERT_WEBHOOK_URL` (e.g., a Slack channel or PagerDuty endpoint).
- **Resilience:** Alerts are dispatched in a background task via `httpx` to prevent blocking the client's HTTP response.

## Conclusion
The application is fully instrumented for "Day 2" operations, ensuring complete transparency into its security posture, performance characteristics, and unexpected failure modes.
