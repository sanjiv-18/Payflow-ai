"""
PayPal Sandbox payment service.

Uses the official PayPal REST API (v2/checkout/orders).
Strictly separates Sandbox execution from unconfigured demo mode.
Never marks payments as captured without verified proof of capture from PayPal.
"""

import httpx
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

# ─────────────────────── helpers ───────────────────────

def is_paypal_configured() -> bool:
    """Return True only if valid non-empty PayPal credentials are configured."""
    cid = (settings.PAYPAL_CLIENT_ID or "").strip()
    sec = (settings.PAYPAL_CLIENT_SECRET or "").strip()
    return bool(cid and sec and cid != "your-paypal-sandbox-client-id" and sec != "your-paypal-sandbox-client-secret")


async def _get_access_token() -> Optional[str]:
    """Exchange client credentials for a PayPal access token."""
    if not is_paypal_configured():
        return None
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{settings.PAYPAL_BASE_URL}/v1/oauth2/token",
                headers={"Accept": "application/json"},
                data={"grant_type": "client_credentials"},
                auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET),
                timeout=15,
            )
            resp.raise_for_status()
            return resp.json().get("access_token")
    except Exception as exc:
        logger.error("PayPal OAuth2 authentication failed: %s", exc)
        return None


# ─────────────────────── public API ───────────────────────

async def create_order(amount: float, currency: str, invoice_id: str, invoice_number: str) -> dict:
    """
    Create a PayPal Sandbox order via the official v2/checkout/orders API.
    """
    if not is_paypal_configured():
        return {
            "order_id": None,
            "status": "CREDENTIALS_REQUIRED",
            "demo": True,
            "configured": False,
            "message": "PayPal Sandbox credentials are not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to backend/.env.",
        }

    token = await _get_access_token()
    if not token:
        raise RuntimeError("PayPal authentication failed. Check your Sandbox client credentials in .env.")

    payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "reference_id": invoice_id,
                "description": f"Invoice {invoice_number}",
                "amount": {
                    "currency_code": currency.upper(),
                    "value": f"{amount:.2f}",
                },
                "custom_id": invoice_id,
            }
        ],
        "application_context": {
            "brand_name": "PayFlow AI",
            "landing_page": "BILLING",
            "user_action": "PAY_NOW",
            "return_url": f"{settings.FRONTEND_URL}/payments",
            "cancel_url": f"{settings.FRONTEND_URL}/planner",
        },
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{settings.PAYPAL_BASE_URL}/v2/checkout/orders",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=20,
            )
            resp.raise_for_status()
            data = resp.json()
            return {
                "order_id": data["id"],
                "status": data["status"],
                "demo": False,
                "configured": True,
            }
    except httpx.HTTPStatusError as exc:
        logger.error("PayPal create_order HTTP error %s: %s", exc.response.status_code, exc.response.text)
        raise RuntimeError(f"PayPal API error: {exc.response.status_code} — {exc.response.text}")


async def capture_order(order_id: str) -> dict:
    """
    Capture a PayPal order after user approval on PayPal Sandbox checkout.
    Verifies that the capture is genuinely processed by PayPal.
    """
    if not is_paypal_configured():
        raise RuntimeError(
            "PayPal Sandbox credentials are required to capture payments. "
            "Simulated checkout does not mark invoices as Paid."
        )

    token = await _get_access_token()
    if not token:
        raise RuntimeError("Could not obtain PayPal access token for capture.")

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{settings.PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}/capture",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                timeout=20,
            )
            resp.raise_for_status()
            data = resp.json()

            purchase_units = data.get("purchase_units", [])
            captures = []
            for pu in purchase_units:
                captures.extend(pu.get("payments", {}).get("captures", []))

            if not captures:
                raise RuntimeError("No capture record returned by PayPal REST API.")

            capture = captures[0]
            amount_obj = capture.get("amount", {})
            payer = data.get("payer", {})

            return {
                "capture_id": capture["id"],
                "status": capture["status"],
                "amount": float(amount_obj.get("value", 0)),
                "currency": amount_obj.get("currency_code", "USD"),
                "payer_email": payer.get("email_address", ""),
                "demo": False,
            }
    except httpx.HTTPStatusError as exc:
        logger.error("PayPal capture HTTP error %s: %s", exc.response.status_code, exc.response.text)
        raise RuntimeError(f"PayPal capture failed: {exc.response.status_code}")
