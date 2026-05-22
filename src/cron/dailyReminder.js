const { supabase } = require('../services/supabaseClient');
const { pushMessage } = require('../services/lineService');

const REMINDER_MESSAGES = [
  'สวัสดีตอนเย็นครับ 🌙\nวันนี้มีรายจ่ายอะไรที่ยังไม่ได้บันทึกไหมครับ?\nพิมพ์มาได้เลยนะครับ 😊',
  '🌙 ก่อนนอนอย่าลืมบันทึกรายจ่ายวันนี้นะครับ!\nมีอะไรที่ยังหลงลืมไหมครับ?',
  'ทบทวนรายจ่ายวันนี้กันครับ 📝\nวันนี้จ่ายอะไรไปบ้างครับ?',
];

async function getActiveUserIds() {
  // ดึง user ที่มีรายการใน 30 วันล่าสุด
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceStr = since.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('transactions')
    .select('line_user_id')
    .gte('date', sinceStr)
    .not('line_user_id', 'is', null);

  if (error) throw error;

  // unique user ids
  const ids = [...new Set((data || []).map(r => r.line_user_id))];
  return ids;
}

async function sendDailyReminder() {
  const message = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];
  const userIds = await getActiveUserIds();

  console.log(`📢 Sending daily reminder to ${userIds.length} users`);

  const results = await Promise.allSettled(
    userIds.map(userId =>
      pushMessage(userId, { type: 'text', text: message })
    )
  );

  const ok  = results.filter(r => r.status === 'fulfilled').length;
  const err = results.filter(r => r.status === 'rejected').length;
  console.log(`✅ Sent: ${ok} | ❌ Failed: ${err}`);

  return { sent: ok, failed: err, total: userIds.length };
}

module.exports = { sendDailyReminder };
