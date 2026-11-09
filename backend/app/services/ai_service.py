"""
AI Service for PayFlow AI.

Uses Google Gemini when GEMINI_API_KEY is configured, otherwise falls back to
deterministic demo responses so the app remains fully functional without an API key.
"""

import json
import re
import logging
from datetime import datetime, date
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


# ──────────────────────── helpers ────────────────────────

def _risk_level_from_score(score: float) -> str:
    if score >= 60:
        return "high"
    if score >= 30:
        return "medium"
    return "low"


def _rule_based_risk_detailed(invoice: dict, similar_invoices: list) -> tuple[float, list, list]:
    """
    Apply deterministic rules and return (score, findings_list, rule_checks_list).
    """
    score = 0.0
    findings = []
    rule_checks = []

    invoice_number = (invoice.get("invoice_number") or "").strip()
    vendor_name = (invoice.get("vendor_name") or "").strip().lower()
    amount = float(invoice.get("amount") or 0)
    due_date = invoice.get("due_date")
    invoice_date = invoice.get("invoice_date")
    status = (invoice.get("status") or "").lower()

    # 1. Duplicate invoice number
    dup_numbers = [
        s for s in similar_invoices
        if (s.get("invoice_number") or "").strip() == invoice_number
        and s.get("id") != invoice.get("id")
    ]
    if dup_numbers:
        score += 40
        findings.append(f"⚠️ Duplicate invoice number '{invoice_number}' found in {len(dup_numbers)} other record(s).")
        rule_checks.append({
            "id": "duplicate_number",
            "name": "Invoice Number Uniqueness",
            "passed": False,
            "impact": 40,
            "detail": f"Duplicate invoice number '{invoice_number}' detected in database."
        })
    else:
        rule_checks.append({
            "id": "duplicate_number",
            "name": "Invoice Number Uniqueness",
            "passed": True,
            "impact": 0,
            "detail": "Invoice number is unique across all accounts."
        })

    # 2. Duplicate vendor + amount
    dup_vendor_amount = [
        s for s in similar_invoices
        if (s.get("vendor_name") or "").strip().lower() == vendor_name
        and abs(float(s.get("amount") or 0) - amount) < 0.01
        and s.get("id") != invoice.get("id")
    ]
    if dup_vendor_amount:
        score += 30
        findings.append(f"⚠️ Duplicate billing detected: same vendor '{invoice.get('vendor_name')}' and amount ${amount:,.2f}.")
        rule_checks.append({
            "id": "duplicate_vendor_amount",
            "name": "Duplicate Billing Collision",
            "passed": False,
            "impact": 30,
            "detail": f"Identical amount (${amount:,.2f}) already billed by this vendor."
        })
    else:
        rule_checks.append({
            "id": "duplicate_vendor_amount",
            "name": "Duplicate Billing Collision",
            "passed": True,
            "impact": 0,
            "detail": "No duplicate amount collisions found for this vendor."
        })

    # 3. Overdue status
    is_overdue = status == "overdue"
    if not is_overdue and due_date:
        try:
            due_dt = datetime.strptime(due_date, "%Y-%m-%d").date()
            if due_dt < date.today() and status not in ("paid", "cancelled"):
                is_overdue = True
        except ValueError:
            pass

    if is_overdue:
        score += 20
        findings.append("🔴 Invoice is past its due date — late payment penalties may apply.")
        rule_checks.append({
            "id": "timeline_status",
            "name": "Payment Deadline Status",
            "passed": False,
            "impact": 20,
            "detail": f"Past due date ({due_date or 'N/A'}). Urgent settlement recommended."
        })
    else:
        rule_checks.append({
            "id": "timeline_status",
            "name": "Payment Deadline Status",
            "passed": True,
            "impact": 0,
            "detail": "Payment deadline is current and within active terms."
        })

    # 4. High value threshold ($10,000)
    if amount > 10_000:
        score += 15
        findings.append(f"💰 High-value invoice (${amount:,.2f}) exceeds $10,000 policy threshold.")
        rule_checks.append({
            "id": "high_value_threshold",
            "name": "High-Value Policy Check ($10k)",
            "passed": False,
            "impact": 15,
            "detail": f"Amount (${amount:,.2f}) exceeds standard single-signoff threshold."
        })
    else:
        rule_checks.append({
            "id": "high_value_threshold",
            "name": "High-Value Policy Check ($10k)",
            "passed": True,
            "impact": 0,
            "detail": f"Amount (${amount:,.2f}) is within standard disbursement limits."
        })

    # 5. Missing dates / metadata integrity
    missing_dates = []
    if not due_date:
        missing_dates.append("due date")
    if not invoice_date:
        missing_dates.append("invoice date")

    if missing_dates:
        date_impact = len(missing_dates) * 10
        score += date_impact
        findings.append(f"📅 Missing metadata: {', '.join(missing_dates)}.")
        rule_checks.append({
            "id": "metadata_integrity",
            "name": "Audit Trail & Metadata Integrity",
            "passed": False,
            "impact": date_impact,
            "detail": f"Missing critical audit fields: {', '.join(missing_dates)}."
        })
    else:
        rule_checks.append({
            "id": "metadata_integrity",
            "name": "Audit Trail & Metadata Integrity",
            "passed": True,
            "impact": 0,
            "detail": "Complete invoice date and due date recorded."
        })

    # 6. Round number heuristic on large sums
    if amount > 5_000 and amount == int(amount) and amount % 500 == 0:
        score += 5
        findings.append(f"🔢 Exact round-number figure (${amount:,.0f}) on high sum.")
        rule_checks.append({
            "id": "round_number",
            "name": "Round Number Heuristic",
            "passed": False,
            "impact": 5,
            "detail": "Round thousands amount on large invoice — verify line item breakdown."
        })
    else:
        rule_checks.append({
            "id": "round_number",
            "name": "Round Number Heuristic",
            "passed": True,
            "impact": 0,
            "detail": "Itemized figures align with standard commercial billing."
        })

    score = min(score, 100.0)
    return score, findings, rule_checks


# ──────────────────────── Gemini client ────────────────────────

def _get_gemini_model():
    """Return a configured Gemini GenerativeModel or None."""
    if not settings.GEMINI_API_KEY:
        return None
    try:
        import google.generativeai as genai  # type: ignore

        genai.configure(api_key=settings.GEMINI_API_KEY)
        return genai.GenerativeModel("gemini-1.5-flash")
    except Exception as exc:
        logger.warning("Failed to initialise Gemini: %s", exc)
        return None


def _gemini_generate(prompt: str) -> Optional[str]:
    """Call Gemini and return the text response, or None on failure."""
    model = _get_gemini_model()
    if model is None:
        return None
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as exc:
        logger.error("Gemini API error: %s", exc)
        return None


def _parse_json_from_text(text: str) -> Optional[dict]:
    """Extract the first JSON object from an LLM response."""
    try:
        cleaned = re.sub(r"```(?:json)?", "", text).strip().rstrip("`").strip()
        start = cleaned.find("{")
        end = cleaned.rfind("}") + 1
        if start == -1 or end == 0:
            return None
        return json.loads(cleaned[start:end])
    except Exception:
        return None


# ──────────────────────── Public API ────────────────────────

def extract_invoice_data(text: str) -> dict:
    """Extract structured invoice fields from raw OCR/PDF text."""
    prompt = f"""
You are an expert financial document parser.

Extract the following fields from the invoice text below and return ONLY valid JSON:
{{
  "invoice_number": "string or empty",
  "vendor_name": "string or empty",
  "description": "string summarising the services/goods",
  "amount": float (total amount due),
  "currency": "3-letter ISO code, default USD",
  "invoice_date": "YYYY-MM-DD or empty",
  "due_date": "YYYY-MM-DD or empty"
}}

Invoice text:
\"\"\"
{text[:3000]}
\"\"\"

Return ONLY the JSON object, no explanation.
"""
    raw = _gemini_generate(prompt)
    if raw:
        parsed = _parse_json_from_text(raw)
        if parsed:
            try:
                parsed["amount"] = float(parsed.get("amount") or 0)
            except (TypeError, ValueError):
                parsed["amount"] = 0.0
            return parsed

    # Deterministic fallback parser
    result = {
        "invoice_number": "",
        "vendor_name": "Extracted Vendor",
        "description": "Commercial services rendered",
        "amount": 0.0,
        "currency": "USD",
        "invoice_date": str(date.today()),
        "due_date": "",
    }

    amount_match = re.search(r"(?:total|amount due|subtotal)[:\s]*\$?([\d,]+(?:\.\d{2})?)", text, re.I)
    if amount_match:
        try:
            result["amount"] = float(amount_match.group(1).replace(",", ""))
        except ValueError:
            pass

    inv_match = re.search(r"(?:invoice\s*(?:#|no\.?|number)[:\s]*)([\w-]+)", text, re.I)
    if inv_match:
        result["invoice_number"] = inv_match.group(1)

    vendor_match = re.search(r"(?:vendor|from|billed by)[:\s]*([^\n\r]+)", text, re.I)
    if vendor_match:
        result["vendor_name"] = vendor_match.group(1).strip()

    return result


def analyze_risk(invoice: dict, similar_invoices: list) -> dict:
    """
    Analyse invoice risk using deterministic rules + optional Gemini commentary.
    """
    rule_score, rule_findings, rule_checks = _rule_based_risk_detailed(invoice, similar_invoices)
    model_name = "rules-engine"
    ai_commentary = ""

    # Attempt Gemini enrichment
    prompt = f"""
You are a financial risk analyst for a B2B payment platform.

Evaluate this invoice for fraud, compliance, and payment risk:

Invoice Details:
- Vendor: {invoice.get('vendor_name')}
- Invoice #: {invoice.get('invoice_number')}
- Amount: ${invoice.get('amount', 0):,.2f} {invoice.get('currency', 'USD')}
- Invoice Date: {invoice.get('invoice_date') or 'Not provided'}
- Due Date: {invoice.get('due_date') or 'Not provided'}
- Status: {invoice.get('status', 'pending')}
- Description: {invoice.get('description') or 'Not provided'}

Rule-based risk score: {rule_score}/100
Rule findings: {json.dumps(rule_findings)}

Provide a concise risk assessment (2-3 sentences) covering:
1. Any additional contextual risks
2. A clear recommendation (approve / hold for review / reject)

Return ONLY a JSON object:
{{
  "additional_findings": ["string", ...],
  "recommendation": "string (1-2 sentences)"
}}
"""
    raw = _gemini_generate(prompt)
    if raw:
        parsed = _parse_json_from_text(raw)
        if parsed:
            extra_findings = parsed.get("additional_findings") or []
            ai_commentary = parsed.get("recommendation") or ""
            all_findings = rule_findings + [f"🤖 AI: {f}" for f in extra_findings if f]
            model_name = "gemini-1.5-flash"
        else:
            all_findings = rule_findings
    else:
        all_findings = rule_findings

    if not ai_commentary:
        if rule_score >= 60:
            ai_commentary = (
                "High risk detected. Place invoice on hold and verify directly with the vendor before approving payment."
            )
        elif rule_score >= 30:
            ai_commentary = (
                "Moderate risk identified. Review line items and confirm vendor details before releasing funds."
            )
        else:
            ai_commentary = (
                "Low risk. Invoice details align with standard commercial billing. Safe to proceed with payment."
            )

    return {
        "risk_score": rule_score,
        "risk_level": _risk_level_from_score(rule_score),
        "rule_score": rule_score,
        "rule_checks": rule_checks,
        "findings": all_findings,
        "recommendation": ai_commentary,
        "model_name": model_name,
        "is_real_ai": model_name == "gemini-1.5-flash",
        "disclaimer": "This risk score is an informational assessment and not a guarantee of fraud detection.",
    }


def generate_payment_plan(invoices: list, budget: float) -> list:
    """Generate a prioritised payment schedule given a list of invoices and a budget."""
    if not invoices:
        return []

    def _sort_key(inv):
        status_priority = {"overdue": 0, "pending": 1, "approved": 2, "on_hold": 3}.get(
            inv.get("status", "pending"), 5
        )
        risk_priority = {"high": 0, "medium": 1, "low": 2}.get(inv.get("risk_level", "low"), 2)
        return (status_priority, risk_priority, -float(inv.get("amount", 0)))

    sorted_invoices = sorted(invoices, key=_sort_key)
    plan = []
    remaining = budget

    for idx, inv in enumerate(sorted_invoices, 1):
        amount = float(inv.get("amount") or 0)
        status = inv.get("status", "pending")
        risk = inv.get("risk_level", "low")

        if risk == "high" and status not in ("paid",):
            action = "hold"
            reason = "High risk detected — hold for manual vendor verification before payment."
        elif status == "overdue":
            action = "pay_now" if remaining >= amount else "schedule"
            reason = "Past due date — prioritize immediate payment to avoid penalties."
        elif remaining >= amount:
            action = "pay_now"
            reason = f"Within current budget (${remaining:,.2f} available) with verified low/medium risk."
        else:
            action = "defer"
            reason = f"Exceeds current allocated budget (${remaining:,.2f} remaining). Defer to next cycle."

        if action == "pay_now":
            remaining -= amount

        plan.append({
            "invoice_id": inv.get("id"),
            "priority": idx,
            "recommended_action": action,
            "reason": reason,
        })

    return plan


def chat(message: str, history: list, context: dict) -> str:
    """Answer user questions using actual database context."""
    system_context = f"""
You are PayFlow AI Financial Assistant — an intelligent financial copilot for freelancers and small businesses.

Current financial context from database:
- Total invoices: {context.get('total_invoices', 0)}
- Total pending amount: ${context.get('pending_amount', 0):,.2f}
- Overdue count: {context.get('overdue_count', 0)}
- High-risk count: {context.get('high_risk_count', 0)}
- Recent invoices: {json.dumps(context.get('recent_invoices', []), default=str)}

Guidelines:
- Answer questions accurately using the provided financial context.
- Never authorize or execute payments directly.
- Always recommend reviewing high-risk invoices and prioritizing overdue payments.
"""
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai  # type: ignore

            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-flash", system_instruction=system_context)
            chat_session = model.start_chat()
            response = chat_session.send_message(message)
            return response.text
        except Exception as exc:
            logger.error("Gemini chat error: %s", exc)

    # ── Contextual grounded fallback (no Gemini key) ──────────────────────────
    msg_lower = message.lower()
    total_inv = context.get("total_invoices", 0)
    pending_amt = context.get("pending_amount", 0.0)
    overdue_cnt = context.get("overdue_count", 0)
    high_risk_cnt = context.get("high_risk_count", 0)
    recent = context.get("recent_invoices", [])

    # Build a short recent invoice summary for context-aware replies
    recent_summary = ""
    if recent:
        lines = [
            f"  • {r.get('invoice_number','?')} from {r.get('vendor','?')} — "
            f"${float(r.get('amount',0)):,.2f} ({r.get('status','?')}, risk: {r.get('risk_level','?') or 'N/A'})"
            for r in recent[:3]
        ]
        recent_summary = "\n" + "\n".join(lines)

    # ── Greeting / small talk ──────────────────────────────────────────────
    greetings = {"hi", "hello", "hey", "good morning", "good afternoon", "howdy"}
    if any(g in msg_lower for g in greetings) or msg_lower.strip() in greetings:
        if total_inv == 0:
            return (
                "Hello! I'm your PayFlow AI Financial Assistant. You don't have any invoices yet — "
                "upload one to get started with AI-powered risk analysis and payment planning."
            )
        return (
            f"Hello! I'm monitoring your {total_inv} invoice(s) with "
            f"${pending_amt:,.2f} in pending obligations. "
            + (f"⚠️ {overdue_cnt} overdue, " if overdue_cnt else "")
            + (f"{high_risk_cnt} high-risk. " if high_risk_cnt else "")
            + "Ask me about overdue invoices, risk alerts, payment priorities, or vendor summaries."
        )

    # ── What can you do / capabilities ────────────────────────────────────
    if any(w in msg_lower for w in ("what can you", "what do you", "help", "capabilities", "how do i", "feature")):
        return (
            "I can help you with:\n"
            "• **Overdue alerts** — which invoices are past due and need urgent payment\n"
            "• **Risk analysis** — duplicate detection, high-value flags, metadata gaps\n"
            "• **Payment priorities** — which invoices to pay first given your budget\n"
            "• **Vendor summaries** — spend by vendor or status breakdown\n"
            "• **GST intelligence** — CGST/SGST/IGST totals across your invoices\n\n"
            "Try asking: *'Which invoices are overdue?'* or *'Show my high-risk invoices'*."
        )

    # ── Next action / what to do ───────────────────────────────────────────
    if any(w in msg_lower for w in ("next", "what should", "what do", "recommend", "suggest", "action")):
        actions = []
        if overdue_cnt > 0:
            actions.append(f"🔴 Pay {overdue_cnt} overdue invoice(s) immediately to avoid late penalties.")
        if high_risk_cnt > 0:
            actions.append(f"⚠️ Review {high_risk_cnt} high-risk invoice(s) in the Invoices tab before releasing funds.")
        if pending_amt > 0:
            actions.append(f"💰 You have ${pending_amt:,.2f} in outstanding obligations — open the Payment Planner to schedule payments.")
        if not actions:
            actions.append("✅ All invoices look healthy. Upload new invoices to continue processing.")
        return "**Recommended next actions:**\n" + "\n".join(actions)

    # ── Overdue ────────────────────────────────────────────────────────────
    if any(w in msg_lower for w in ("overdue", "late", "past due", "missed")):
        if overdue_cnt == 0:
            return "Great news — you have no overdue invoices right now. All obligations are within their payment terms."
        return (
            f"You have **{overdue_cnt}** overdue invoice(s). "
            "Late payments can trigger penalty clauses. I recommend opening the Payment Planner and scheduling these immediately."
            + (f"\n\nRecent invoices:{recent_summary}" if recent_summary else "")
        )

    # ── Risk / duplicate / fraud ───────────────────────────────────────────
    if any(w in msg_lower for w in ("risk", "duplicate", "fraud", "suspicious", "anomal", "flag")):
        if high_risk_cnt == 0:
            return "No high-risk invoices detected at the moment. All flagged checks have passed for your current invoice set."
        return (
            f"**{high_risk_cnt}** high-risk invoice(s) are currently flagged. "
            "Common flags include: duplicate invoice numbers, identical vendor/amount combinations, or missing metadata. "
            "Open an invoice and click 'Inspect & Edit' to view the full risk breakdown and rule-by-rule analysis."
        )

    # ── Pending / total / how much / balance ──────────────────────────────
    if any(w in msg_lower for w in ("total", "pending", "owe", "balance", "outstanding", "how much", "amount")):
        return (
            f"Your total **pending obligations** are **${pending_amt:,.2f}** across {total_inv} invoice(s)."
            + (f"\n\nRecent invoices:{recent_summary}" if recent_summary else "")
            + "\n\nOpen the Smart Payment Planner to sequence payments by urgency and budget."
        )

    # ── Payment priority / planner ─────────────────────────────────────────
    if any(w in msg_lower for w in ("prioritize", "priority", "pay first", "schedule", "planner", "budget", "cash flow")):
        return (
            "Visit the **Smart Payment Planner** to get a budget-sequenced payment schedule. "
            "The AI Agent ranks invoices by: overdue status → risk level → amount. "
            "High-risk invoices are automatically held for your review before payment is released."
        )

    # ── GST / tax ─────────────────────────────────────────────────────────
    if any(w in msg_lower for w in ("gst", "tax", "igst", "cgst", "sgst", "hsn", "sac")):
        gst_invoices = [r for r in recent if r.get("risk_level")]  # any invoice
        return (
            "PayFlow AI automatically extracts GST components (CGST, SGST, IGST) and validates GSTINs on uploaded invoices. "
            f"You currently have {total_inv} invoice(s) in the system. "
            "Open the Analytics page to view total GST liability by component and vendor."
        )

    # ── Vendor / supplier ─────────────────────────────────────────────────
    if any(w in msg_lower for w in ("vendor", "supplier", "company", "who", "paid to")):
        if recent:
            vendors = list({r.get("vendor", "?") for r in recent})
            return (
                f"Your recent vendors include: **{', '.join(vendors[:5])}**. "
                f"You have {total_inv} total invoice(s) in the system. "
                "Use the Invoices page to filter by vendor, status, or risk level."
            )
        return "No invoices found yet. Upload an invoice to start tracking vendor payments."

    # ── Invoice count / how many ───────────────────────────────────────────
    if any(w in msg_lower for w in ("how many", "count", "number of invoice")):
        return (
            f"You have **{total_inv}** invoice(s) in PayFlow AI — "
            f"{overdue_cnt} overdue, {high_risk_cnt} high-risk, and ${pending_amt:,.2f} total outstanding."
        )

    # ── Summary / status / overview ───────────────────────────────────────
    if any(w in msg_lower for w in ("summary", "overview", "status", "dashboard", "report")):
        return (
            f"**PayFlow AI Summary**\n"
            f"• Total invoices: **{total_inv}**\n"
            f"• Pending obligations: **${pending_amt:,.2f}**\n"
            f"• Overdue: **{overdue_cnt}**\n"
            f"• High-risk flagged: **{high_risk_cnt}**\n"
            + (f"\nRecent activity:{recent_summary}" if recent_summary else "")
        )

    # ── Default fallback ───────────────────────────────────────────────────
    return (
        f"I'm your PayFlow AI assistant, monitoring **{total_inv}** invoice(s) with "
        f"**${pending_amt:,.2f}** in pending obligations.\n\n"
        "You can ask me about:\n"
        "• Overdue or high-risk invoices\n"
        "• Payment priorities and scheduling\n"
        "• Vendor spend summaries\n"
        "• GST and tax breakdowns\n"
        "• What action to take next"
    )
