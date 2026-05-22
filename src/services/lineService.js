const line = require('@line/bot-sdk');
const { config } = require('../config');

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.line.channelAccessToken,
});

async function replyMessage(replyToken, messages) {
  const msgs = Array.isArray(messages) ? messages : [messages];
  return client.replyMessage({ replyToken, messages: msgs });
}

async function pushMessage(userId, messages) {
  const msgs = Array.isArray(messages) ? messages : [messages];
  return client.pushMessage({ to: userId, messages: msgs });
}

async function handleEvent(event) {
  if (event.type !== 'message') return;

  const userId = event.source.userId;
  const replyToken = event.replyToken;

  // ── รูปภาพ (ใบเสร็จ/สลิป) ──────────────────────────
  if (event.message.type === 'image') {
    return handleImageEvent(userId, event.message.id, replyToken);
  }

  if (event.message.type !== 'text') return;

  const { handleTextMessage } = require('../handlers/messageHandler');
  const userMessage = event.message.text.trim();
  const reply = await handleTextMessage(userId, userMessage);

  if (!reply) return;

  const messages = typeof reply === 'string'
    ? [{ type: 'text', text: reply }]
    : Array.isArray(reply) ? reply : [reply];

  return client.replyMessage({ replyToken, messages });
}

async function handleImageEvent(userId, messageId, replyToken) {
  try {
    await client.replyMessage({
      replyToken,
      messages: [{ type: 'text', text: '🔍 กำลังอ่านใบเสร็จ รอสักครู่นะครับ...' }],
    });

    const { parseReceiptImage } = require('./ocrService');
    const { setPending } = require('../state/pendingConfirmations');
    const { generateConfirmQuickReply } = require('../messages/textReplies');

    const parsed = await parseReceiptImage(messageId);

    if (parsed.error) {
      return pushMessage(userId, { type: 'text', text: `😅 ${parsed.error}\nลองส่งรูปใบเสร็จใหม่นะครับ` });
    }

    const transactionData = {
      item: parsed.store_name || parsed.item || 'ใบเสร็จ',
      amount: parsed.amount,
      category: parsed.category || 'อื่นๆ',
      type: 'รายจ่าย',
      date: parsed.date || new Date().toISOString().split('T')[0],
    };

    setPending(userId, transactionData);

    const detailText = parsed.items_detail ? `\n📋 ${parsed.items_detail}` : '';
    const confirmMsg = generateConfirmQuickReply(transactionData);
    confirmMsg.text = `🧾 อ่านใบเสร็จได้แล้วครับ${detailText}\n\n` + confirmMsg.text;

    return pushMessage(userId, confirmMsg);
  } catch (err) {
    console.error('❌ OCR error:', err);
    return pushMessage(userId, {
      type: 'text',
      text: '⚠️ อ่านใบเสร็จไม่ได้ครับ ลองพิมพ์รายการเองได้เลยนะครับ',
    });
  }
}

module.exports = { client, replyMessage, pushMessage, handleEvent };
