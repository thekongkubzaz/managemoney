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

module.exports = { resolveDate, getTodayStr, getYesterdayStr, formatDateThai };
