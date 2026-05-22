-- สร้างตาราง transactions
CREATE TABLE transactions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('รายรับ', 'รายจ่าย')),
  date DATE NOT NULL,
  line_user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- เปิด RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: อนุญาต insert/select
CREATE POLICY "Allow all inserts" ON transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all selects" ON transactions
  FOR SELECT USING (true);

-- Index สำหรับ query เร็วขึ้น
CREATE INDEX idx_transactions_user ON transactions (line_user_id);
CREATE INDEX idx_transactions_date ON transactions (date);
