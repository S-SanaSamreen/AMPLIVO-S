import logging
import httpx
import asyncio
from app.core.config import settings

logger = logging.getLogger(__name__)

async def trigger_alert(title: str, message: str, extra: dict | None = None) -> None:
    """
    Trigger an alert to external monitoring systems (e.g., Slack, PagerDuty).
    Silently fails to prevent disrupting the main thread if the alerting system is down.
    """
    if not settings.ALERT_WEBHOOK_URL:
        # Development mode or unconfigured - just log the alert intent
        logger.warning(f"ALERT [{title}]: {message} | {extra}")
        return

    payload = {
        "text": f"*{title}*\n{message}\n```{extra}```"
    }
    
    try:
        # Fire and forget without blocking the response
        async with httpx.AsyncClient() as client:
            await client.post(str(settings.ALERT_WEBHOOK_URL), json=payload, timeout=5.0)
    except Exception as e:
        logger.error(f"Failed to send alert to webhook: {e}")

def fire_alert_background(title: str, message: str, extra: dict | None = None) -> None:
    """Helper to dispatch alert on the current event loop without awaiting."""
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(trigger_alert(title, message, extra))
    except RuntimeError:
        # If no loop is running, we just swallow or fallback (rare in FastAPI)
        pass
