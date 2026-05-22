const { parseTransaction, parseExpenseMessage } = require('../services/geminiService');
const { saveTransaction, getMonthlySummary, saveAndBuildReply } = require('../services/transactionService');
const { replyMessage } = require('../services/lineService');
const pending = require('../state/pendingConfirmations');
const { setPending, clearPending } = require('../state/pendingConfirmations');
const {
  shouldAutoSave, isQueryCommand, isHelpCommand,
  isGreeting, isHelpRequest, isAnalysisRequest,
  shouldAutoSaveTransaction, toTransactionData, isEditOrDeleteCommand,
} = require('../utils/transactionRules');
const { resolveDate } = require('../utils/dateParser');
const { CONFIRM_YES, CONFIRM_NO } = require('../constants/confirmations');
const {
  helpMessage,
  confirmMessage,
  cancelledMessage,
  unknownMessage,
  errorMessage,
  buildTransactionFlex,
  buildSummaryFlex,
  GENERAL_RESPONSES,
  generateMissingFieldReply,
  generateConfirmQuickReply,
  buildSummaryReply,
} = require('../messages');

async function handleMessage(event) {
  const { replyToken, source, message } = event;
  const userId = source.userId;
  const text = message.text.trim();

  try {
    // ตรวจสอบ pending confirmation ก่อน
    const pendingData = pending.get(userId);
    if (pendingData) {
      return await handleConfirmation(replyToken, userId, text, pendingData);
    }

    // คำสั่งพิเศษ
    if (isHelpCommand(text)) {
      return await replyMessage(replyToken, helpMessage());
    }

    if (isQueryCommand(text)) {
      return await handleSummary(replyToken, userId);
    }

    // วิเคราะห์ด้วย Gemini AI
    const parsed = await parseTransaction(text);

    if (!parsed || parsed.type === 'unknown') {
      return await replyMessage(replyToken, unknownMessage());
    }

    if (!parsed.amount) {
      // ไม่มีจำนวนเงิน ถามกลับ
      pending.set(userId, { ...parsed, _waitingFor: 'amount' });
      return await replyMessage(replyToken, {
        type: 'text',
        text: `💬 "${parsed.item}" มีจำนวนเงินเท่าไหร่ครับ?`,
      });
    }

    if (shouldAutoSave(parsed)) {
      // บันทึกทันที
      return await saveParsedAndReply(replyToken, userId, parsed);
    } else {
      // ถามยืนยัน
      pending.set(userId, parsed);
      return await replyMessage(replyToken, confirmMessage(parsed));
    }
  } catch (err) {
    console.error('handleMessage error:', err);
    return await replyMessage(replyToken, errorMessage());
  }
}

async function handleConfirmation(replyToken, userId, text, pendingData) {
  const yes = ['ใช่', 'yes', 'ok', 'ตกลง', 'บันทึก', 'ยืนยัน', 'โอเค', 'ได้'].some(k =>
    text.toLowerCase().includes(k)
  );
  const no = ['ไม่', 'no', 'ยกเลิก', 'cancel'].some(k =>
    text.toLowerCase().includes(k)
  );

  // กรณีรอรับจำนวนเงิน
  if (pendingData._waitingFor === 'amount') {
    const amountMatch = text.replace(/,/g, '').match(/\d+(?:\.\d+)?/);
    if (amountMatch) {
      const updatedData = { ...pendingData, amount: parseFloat(amountMatch[0]) };
      delete updatedData._waitingFor;
      pending.clear(userId);
      return await saveParsedAndReply(replyToken, userId, updatedData);
    } else {
      return await replyMessage(replyToken, {
        type: 'text',
        text: '⚠️ ไม่เจอจำนวนเงินครับ กรุณาพิมพ์ตัวเลข เช่น "150"',
      });
    }
  }

  if (yes) {
    pending.clear(userId);
    return await saveParsedAndReply(replyToken, userId, pendingData);
  } else if (no) {
    pending.clear(userId);
    return await replyMessage(replyToken, cancelledMessage());
  } else {
    return await replyMessage(replyToken, {
      type: 'text',
      text: '❓ ตอบ "ใช่" เพื่อบันทึก หรือ "ยกเลิก" เพื่อยกเลิกครับ',
    });
  }
}

async function saveParsedAndReply(replyToken, userId, parsed) {
  const saved = await saveTransaction({
    item: parsed.item,
    amount: parsed.amount,
    category: parsed.category,
    type: parsed.type,
    date: parsed.date,
    lineUserId: userId,
  });

  return await replyMessage(replyToken, buildTransactionFlex(saved));
}

async function handleSummary(replyToken, userId) {
  const summary = await getMonthlySummary(userId);
  return await replyMessage(replyToken, buildSummaryFlex(summary));
}

async function handlePendingConfirmation(userId, userMessage) {
  const pendingData = pending.get(userId);
  if (!pendingData) return null;

  const normalizedMessage = userMessage.trim().toLowerCase();

  // กรณีรอรับจำนวนเงิน
  if (pendingData._waitingFor === 'amount') {
    const amountMatch = userMessage.replace(/,/g, '').match(/\d+(?:\.\d+)?/);
    if (amountMatch) {
      const updatedData = { ...pendingData, amount: parseFloat(amountMatch[0]) };
      delete updatedData._waitingFor;
      clearPending(userId);
      return saveAndBuildReply(toTransactionData(updatedData), userId);
    }
    return '⚠️ ไม่เจอจำนวนเงินครับ กรุณาพิมพ์ตัวเลข เช่น "150"';
  }

  if (CONFIRM_YES.some((word) => normalizedMessage === word)) {
    clearPending(userId);
    return saveAndBuildReply(pendingData, userId);
  }

  if (CONFIRM_NO.some((word) => normalizedMessage === word)) {
    clearPending(userId);
    return 'ยกเลิกแล้วครับ ถ้าจะบันทึกใหม่ พิมพ์รายการมาได้เลย';
  }

  return null;
}

async function handleTextMessage(userId, userMessage) {
  const pendingReply = await handlePendingConfirmation(userId, userMessage);
  if (pendingReply) return pendingReply;

  if (isEditOrDeleteCommand(userMessage)) {
    return {
      type: 'text',
      text: '⚠️ ขณะนี้ยังไม่รองรับการแก้ไข/ลบรายการครับ\nกรุณาพิมพ์รายการใหม่ได้เลย',
    };
  }

  if (isGreeting(userMessage)) {
    return GENERAL_RESPONSES.greeting;
  }

  if (isHelpRequest(userMessage)) {
    return GENERAL_RESPONSES.help;
  }

  if (isAnalysisRequest(userMessage)) {
    return buildSummaryReply(userId, userMessage);
  }

  if (userMessage.length < 2) {
    return GENERAL_RESPONSES.help;
  }

  try {
    console.log(`📩 [${userId || 'unknown'}] "${userMessage}"`);
    const parsed = await parseExpenseMessage(userMessage);
    console.log('🤖 Gemini:', JSON.stringify(parsed));

    if (parsed.missing_fields && parsed.missing_fields.length > 0) {
      return generateMissingFieldReply(parsed.missing_fields, parsed);
    }

    const transactionData = toTransactionData(parsed);

    if (shouldAutoSaveTransaction(parsed, userMessage)) {
      return saveAndBuildReply(transactionData, userId);
    }

    if (userId) {
      setPending(userId, transactionData);
    }

    return generateConfirmQuickReply(transactionData);
  } catch (error) {
    console.error('❌ Error handling message:', error);
    return GENERAL_RESPONSES.error;
  }
}

module.exports = { handleMessage, handleTextMessage, handlePendingConfirmation };
