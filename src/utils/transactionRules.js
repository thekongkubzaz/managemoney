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

module.exports = { shouldAutoSave, isQueryCommand, isHelpCommand };
