/**
 * ตัดสินใจว่าจะบันทึกทันที หรือถามยืนยันก่อน
 */
function shouldAutoSave(parsed) {
  // บันทึกทันทีถ้า confidence=high และมีจำนวนเงิน
  if (parsed.confidence === 'high' && parsed.amount && parsed.type !== 'unknown') {
    return true;
  }
  return false;
}

function isQueryCommand(text) {
  const keywords = ['สรุป', 'ยอด', 'รายงาน', 'ดูรายการ', 'balance', 'รายรับรายจ่าย', 'เดือนนี้'];
  return keywords.some(k => text.includes(k));
}

function isHelpCommand(text) {
  const keywords = ['ช่วยด้วย', 'วิธีใช้', 'help', 'ใช้ยังไง', 'คำสั่ง'];
  return keywords.some(k => text.toLowerCase().includes(k));
}

function isGreeting(text) {
  const keywords = ['สวัสดี', 'หวัดดี', 'hello', 'hi', 'ดีจ้า', 'ดีครับ', 'ดีค่ะ'];
  return keywords.some(k => text.toLowerCase().includes(k));
}

function isHelpRequest(text) {
  return isHelpCommand(text);
}

function isAnalysisRequest(text) {
  return isQueryCommand(text);
}

function shouldAutoSaveTransaction(parsed, userMessage) {
  if (!parsed || !parsed.amount || !parsed.type) return false;
  if (parsed.missing_fields && parsed.missing_fields.length > 0) return false;
  const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0;
  return confidence >= 0.8;
}

function toTransactionData(parsed) {
  return {
    item: parsed.item || 'ไม่ระบุ',
    amount: parsed.amount,
    category: parsed.category || 'อื่นๆ',
    type: parsed.type || 'รายจ่าย',
    date: parsed.date || new Date().toISOString().split('T')[0],
  };
}

module.exports = {
  shouldAutoSave,
  isQueryCommand,
  isHelpCommand,
  isGreeting,
  isHelpRequest,
  isAnalysisRequest,
  shouldAutoSaveTransaction,
  toTransactionData,
};
