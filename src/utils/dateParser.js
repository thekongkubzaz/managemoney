/**
 * แปลงวันที่จาก string เป็น YYYY-MM-DD
 * รองรับ: null (วันนี้), "YYYY-MM-DD", วันภาษาไทย
 */
function resolveDate(dateStr) {
  if (!dateStr) return getTodayStr();

  // ถ้าเป็น YYYY-MM-DD อยู่แล้ว
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  return getTodayStr();
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function formatDateThai(dateStr) {
  const months = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${parseInt(y) + 543}`;
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function isValidDate(dateStr) {
  if (!dateStr) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr);
  return d instanceof Date && !isNaN(d);
}

function extractDateFromText(text) {
  const lower = text.toLowerCase();

  if (lower.includes('เมื่อวาน') || lower.includes('เมื่อวานนี้') || lower.includes('yesterday')) {
    return getYesterday();
  }
  if (lower.includes('วันนี้') || lower.includes('today')) {
    return getToday();
  }

  // รูปแบบ YYYY-MM-DD
  const isoMatch = text.match(/\d{4}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];

  // รูปแบบ DD/MM/YYYY หรือ DD-MM-YYYY
  const thaiMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (thaiMatch) {
    const [, d, m, y] = thaiMatch;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  return null;
}

module.exports = { resolveDate, getTodayStr, getYesterdayStr, formatDateThai, getToday, getYesterday, isValidDate, extractDateFromText };
