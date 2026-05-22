const { EXPENSE_CATEGORIES, INCOME_CATEGORIES } = require('./categories');

function buildParsePrompt(userMessage, todayStr) {
  return `
วันนี้คือ ${todayStr}

วิเคราะห์ข้อความนี้และตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่น:
"${userMessage}"

หมวดรายจ่าย: ${EXPENSE_CATEGORIES.join(', ')}
หมวดรายรับ: ${INCOME_CATEGORIES.join(', ')}

ตอบในรูปแบบ JSON นี้เท่านั้น:
{
  "type": "รายรับ" | "รายจ่าย" | "unknown",
  "item": "ชื่อรายการ",
  "amount": number | null,
  "category": "หมวดหมู่",
  "date": "YYYY-MM-DD" | null,
  "confidence": "high" | "low",
  "reason": "เหตุผลสั้นๆ ถ้า confidence=low"
}

กฎ:
- ถ้ามีจำนวนเงินและรู้ประเภทชัดเจน → confidence=high
- ถ้าไม่รู้ประเภท (รายรับหรือรายจ่าย) หรือไม่มีจำนวนเงิน → confidence=low
- วันที่: ถ้าบอก "เมื่อวาน" ให้คำนวณจากวันนี้ ถ้าไม่บอก → null (ใช้วันนี้)
- "โอน" โดยไม่ระบุ → confidence=low
`;
}

module.exports = { buildParsePrompt };
