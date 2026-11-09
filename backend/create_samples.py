import fitz
import os

os.makedirs("d:/PAYFLOW AI/sample_invoices", exist_ok=True)

def create_sample_pdf(filename, inv_num, vendor, desc, amount_str, due):
    doc = fitz.open()
    page = doc.new_page()
    text = f"""INVOICE

Invoice Number: {inv_num}
Date: 2026-11-01
Due Date: {due}

VENDOR:
{vendor}
100 Tech Park, Suite 200
San Francisco, CA 94107

BILLED TO:
PayFlow Client Corp
support@payflow.ai

DESCRIPTION:
{desc}

TOTAL AMOUNT DUE: ${amount_str} USD

Payment terms: Net 30
Please send payment via PayPal or ACH.
"""
    page.insert_text((50, 72), text, fontsize=12)
    doc.save(f"d:/PAYFLOW AI/sample_invoices/{filename}")
    doc.close()
    print(f"Created {filename}")

if __name__ == "__main__":
    create_sample_pdf("sample_cloud_invoice.pdf", "INV-9001", "Acme Cloud Hosting", "3x Production Kubernetes Clusters & Load Balancers", "1,450.00", "2026-11-25")
    create_sample_pdf("sample_design_invoice.pdf", "INV-9002", "Apex Design Studio", "Complete UI/UX Revamp for Mobile & Web App", "3,200.00", "2026-11-15")
