/**
 * เก็บ state ของรายการที่รอยืนยัน (in-memory)
 * key = lineUserId, value = parsed transaction object
 */
const pending = new Map();

function set(userId, data) {
  pending.set(userId, data);
}

function get(userId) {
  return pending.get(userId) || null;
}

function clear(userId) {
  pending.delete(userId);
}

module.exports = { set, get, clear };
