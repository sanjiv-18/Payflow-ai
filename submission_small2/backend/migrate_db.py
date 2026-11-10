import sqlite3

conn = sqlite3.connect('d:/PAYFLOW AI/backend/payflow.db')
cur = conn.cursor()
cols = [r[1] for r in cur.execute('PRAGMA table_info(users)').fetchall()]
print('Existing cols in users:', cols)
if 'subscription_tier' not in cols:
    cur.execute("ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'professional'")
    print("Added subscription_tier")
if 'persona' not in cols:
    cur.execute("ALTER TABLE users ADD COLUMN persona VARCHAR(50) DEFAULT 'business'")
    print("Added persona")
conn.commit()
print('Updated users cols:', [r[1] for r in cur.execute('PRAGMA table_info(users)').fetchall()])
conn.close()
