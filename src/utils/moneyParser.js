/**
 * ดึงตัวเลขจำนวนเงินจากข้อความ
 */
function extractAmount(text) {
  // รองรับ: 1,200 / 1200 / 1.2k / 1k
  const cleaned = text.replace(/,/g, '');
  const kMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*[kK]/);
  if (kMatch) return parseFloat(kMatch[1]) * 1000;

  const numMatch = cleaned.match(/\d+(?:\.\d+)?/);
  if (numMatch) return parseFloat(numMatch[0]);

  return null;
}

function formatMoney(amount) {
  return amount.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

module.exports = { extractAmount, formatMoney };
