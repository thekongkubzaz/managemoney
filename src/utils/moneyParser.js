const { EXPENSE_CATEGORIES, INCOME_CATEGORIES } = require('../constants/categories');
const { getToday, isValidDate, extractDateFromText } = require('./dateParser');
const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

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

function parseAmountValue(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return isNaN(value) ? null : value;

  const str = String(value).replace(/,/g, '').trim();
  const kMatch = str.match(/^(\d+(?:\.\d+)?)\s*[kK]$/);
  if (kMatch) return parseFloat(kMatch[1]) * 1000;

  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function detectCategoryFromKeyword(text) {
  const lower = text.toLowerCase();
  const categoryMap = {
    'อาหาร':     ['กิน', 'ข้าว', 'อาหาร', 'ก๋วยเตี๋ยว', 'ชา', 'กาแฟ', 'ส้มตำ', 'บุฟเฟต์', 'ร้านอาหาร'],
    'เดินทาง':   ['แท็กซี่', 'taxi', 'grab', 'รถ', 'น้ำมัน', 'bts', 'mrt', 'ค่าเดินทาง'],
    'ช้อปปิ้ง':  ['ซื้อ', 'ห้าง', 'ออนไลน์', 'lazada', 'shopee'],
    'สุขภาพ':    ['หมอ', 'ยา', 'โรงพยาบาล', 'คลินิก'],
    'บันเทิง':   ['หนัง', 'เกม', 'คอนเสิร์ต', 'netflix', 'spotify'],
    'การศึกษา':  ['เรียน', 'หนังสือ', 'คอร์ส', 'ค่าเทอม'],
    'ค่าน้ำค่าไฟ': ['ค่าน้ำ', 'ค่าไฟ', 'อินเทอร์เน็ต', 'โทรศัพท์'],
    'เงินเดือน': ['เงินเดือน', 'salary'],
    'ขายของ':    ['ขายได้', 'ขายของ'],
    'ฟรีแลนซ์':  ['ฟรีแลนซ์', 'freelance', 'งานพิเศษ'],
    'โบนัส':     ['โบนัส', 'bonus'],
  };

  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some((k) => lower.includes(k))) return category;
  }
  return 'อื่นๆ';
}

function detectTypeFromKeyword(text) {
  const incomeKeywords = ['รับ', 'ได้รับ', 'เงินเดือน', 'โบนัส', 'ขายได้', 'รายได้', 'income', 'เงินเข้า'];
  const expenseKeywords = ['จ่าย', 'ซื้อ', 'กิน', 'ค่า', 'ใช้จ่าย', 'expense', 'เงินออก'];

  const lower = text.toLowerCase();
  if (incomeKeywords.some((k) => lower.includes(k))) return 'รายรับ';
  if (expenseKeywords.some((k) => lower.includes(k))) return 'รายจ่าย';
  return 'รายจ่าย'; // default
}

function sanitizeResult(parsed, originalText) {
  if (!parsed || typeof parsed !== 'object') return fallbackParse(originalText);

  // ตรวจสอบ type
  const keywordType = detectTypeFromKeyword(originalText);
  if (!['รายรับ', 'รายจ่าย'].includes(parsed.type)) {
    parsed.type = keywordType;
    parsed.confidence = Math.min(parsed.confidence || 0.5, 0.6);
  }

  // ตรวจสอบ category
  const keywordCategory = detectCategoryFromKeyword(originalText);
  if (!ALL_CATEGORIES.includes(parsed.category)) {
    parsed.category = keywordCategory;
    parsed.confidence = Math.min(parsed.confidence || 0.5, 0.7);
  }

  // ตรวจสอบ date
  const today = getToday();
  const parsedDateFromText = extractDateFromText(originalText);
  if (!parsed.date || !isValidDate(parsed.date)) {
    parsed.date = parsedDateFromText || today;
  }

  if (parsed.amount !== null && parsed.amount !== undefined) {
    parsed.amount = parseAmountValue(parsed.amount);

    if (parsed.amount === null) {
      parsed.amount = null;
      if (!parsed.missing_fields) parsed.missing_fields = [];
      if (!parsed.missing_fields.includes('amount')) {
        parsed.missing_fields.push('amount');
      }
    }
  } else {
    parsed.amount = extractAmount(originalText);
  }

  return parsed;
}

function cleanTransactionItem(text) {
  if (!text) return null;
  // ลบตัวเลขและคำที่เกี่ยวกับเงิน/วันที่ออก
  let cleaned = text
    .replace(/\d+(?:\.\d+)?\s*[kK]/g, '')
    .replace(/\d+([,\.]\d+)*/g, '')
    .replace(/บาท|฿|เมื่อวาน|วันนี้|เมื่อคืน|yesterday|today/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length > 0 ? cleaned : null;
}

function classifyByKeyword(text) {
  return detectTypeFromKeyword(text);
}

function categorizeByKeyword(text, type) {
  return detectCategoryFromKeyword(text);
}

function parseDateFromText(text) {
  return extractDateFromText(text);
}

function isAmbiguousTransactionText(text) {
  if (!text || text.trim().length < 3) return true;
  const hasAmount = /\d/.test(text);
  const hasItem = /[ก-๙a-zA-Z]/.test(text);
  return !hasAmount || !hasItem;
}

function fallbackParse(text) {
  const today = getToday();
  const amount = extractAmount(text);
  const item = cleanTransactionItem(text);
  const type = classifyByKeyword(text);
  const category = categorizeByKeyword(text, type);
  const missing_fields = [];
  if (amount === null) missing_fields.push('amount');
  if (item === null) missing_fields.push('item');
  return {
    item,
    amount,
    category,
    type,
    date: parseDateFromText(text) || today,
    confidence: isAmbiguousTransactionText(text) ? 0.35 : 0.88,
    missing_fields,
    reply_hint: 'ใช้ fallback parser',
  };
}

module.exports = {
  extractAmount,
  formatMoney,
  parseAmountValue,
  sanitizeResult,
  fallbackParse,
  cleanTransactionItem,
  classifyByKeyword,
  categorizeByKeyword,
  parseDateFromText,
  isAmbiguousTransactionText,
};
