function helpMessage() {
  return {
    type: 'text',
    text: `💰 ผู้ช่วยลุงสมจด

📝 วิธีบันทึก:
• "กินลาบ 60"
• "ถูกลอตเตอรี่ 4000"
• "ขายของเมื่อวาน 1500"

📊 ดูสรุป:
• พิมพ์ "สรุป" หรือ "ยอดเดือนนี้"

🗑 ลบรายการ:
• "ลบ กินลาบ 60"

❓ ถามกลับ:
• ถ้าข้อความกำกวม บอทจะถามก่อนบันทึก`,
  };
}

function confirmMessage(parsed) {
  return {
    type: 'text',
    text: `🤔 ยืนยันการบันทึก?\n\n${parsed.type === 'รายรับ' ? '💚' : '❤️'} ${parsed.type}\n📝 ${parsed.item}\n💵 ฿${Number(parsed.amount || 0).toLocaleString()}\n🏷 ${parsed.category}\n\nตอบ "ใช่" เพื่อบันทึก หรือ "ยกเลิก" เพื่อยกเลิก`,
  };
}

function askAmountMessage(item) {
  return {
    type: 'text',
    text: `💬 "${item}" มีจำนวนเงินเท่าไหร่ครับ?`,
  };
}

function askTypeMessage(item) {
  return {
    type: 'text',
    text: `💬 "${item}" เป็นรายรับหรือรายจ่ายครับ?`,
  };
}

function cancelledMessage() {
  return {
    type: 'text',
    text: '✅ ยกเลิกแล้วครับ',
  };
}

function unknownMessage() {
  return {
    type: 'text',
    text: `😅 ไม่เข้าใจครับ ลองพิมพ์ใหม่อีกครั้ง เช่น "กินข้าว 50" หรือพิมพ์ "ช่วยด้วย" เพื่อดูวิธีใช้`,
  };
}

function errorMessage() {
  return {
    type: 'text',
    text: '⚠️ เกิดข้อผิดพลาดครับ กรุณาลองใหม่อีกครั้ง',
  };
}

const GENERAL_RESPONSES = {
  greeting: {
    type: 'text',
    text: '💰 สวัสดีครับ! พิมพ์รายการรายรับ/รายจ่ายได้เลย เช่น "กินลาบ 60" หรือพิมพ์ "ช่วยด้วย" เพื่อดูวิธีใช้',
  },
  help: {
    type: 'text',
    text: `💰 ผู้ช่วยลุงสมจด\n\n📝 วิธีบันทึก:\n• "กินลาบ 60"\n• "ถูกลอตเตอรี่ 4000"\n• "ขายของเมื่อวาน 1500"\n\n📊 ดูสรุป:\n• พิมพ์ "สรุป" หรือ "ยอดเดือนนี้"\n\n🗑 ลบรายการ:\n• "ลบ กินลาบ 60"\n\n❓ ถามกลับ:\n• ถ้าข้อความกำกวม บอทจะถามก่อนบันทึก`,
  },
  error: {
    type: 'text',
    text: '⚠️ เกิดข้อผิดพลาดครับ กรุณาลองใหม่อีกครั้ง',
  },
};

function generateMissingFieldReply(missingFields, parsed) {
  if (missingFields.includes('amount')) {
    return {
      type: 'text',
      text: `💬 "${parsed.item || 'รายการนี้'}" มีจำนวนเงินเท่าไหร่ครับ?`,
    };
  }
  if (missingFields.includes('type')) {
    return {
      type: 'text',
      text: `💬 "${parsed.item || 'รายการนี้'}" เป็นรายรับหรือรายจ่ายครับ?`,
    };
  }
  return {
    type: 'text',
    text: '💬 ช่วยบอกรายละเอียดเพิ่มเติมได้ไหมครับ?',
  };
}

async function buildSummaryReply(userId) {
  const { getMonthlySummary } = require('../services/transactionService');
  const { buildSummaryFlex } = require('./flexSummary');
  const summary = await getMonthlySummary(userId);
  return buildSummaryFlex(summary);
}

function generateConfirmQuickReply(transactionData) {
  return {
    type: 'text',
    text: `🤔 ยืนยันการบันทึก?\n\n${transactionData.type === 'รายรับ' ? '💚' : '❤️'} ${transactionData.type}\n📝 ${transactionData.item}\n💵 ฿${Number(transactionData.amount || 0).toLocaleString()}\n🏷 ${transactionData.category}`,
    quickReply: {
      items: [
        {
          type: 'action',
          action: {
            type: 'message',
            label: '✅ ใช่',
            text: 'ใช่',
          },
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '❌ ยกเลิก',
            text: 'ยกเลิก',
          },
        },
      ],
    },
  };
}

module.exports = {
  helpMessage,
  confirmMessage,
  askAmountMessage,
  askTypeMessage,
  cancelledMessage,
  unknownMessage,
  errorMessage,
  generateConfirmQuickReply,
  generateMissingFieldReply,
  buildSummaryReply,
  GENERAL_RESPONSES,
};
