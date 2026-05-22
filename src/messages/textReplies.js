function helpMessage() {
  return {
    type: 'text',
    text: `💰 ManageMoney Bot

📝 วิธีบันทึก:
• "กินข้าวมันไก่ 80"
• "ค่าแท็กซี่ 150"
• "เงินเดือน 25000"
• "ขายของได้ 1200 เมื่อวาน"

📊 ดูสรุป:
• พิมพ์ "สรุป" หรือ "ยอดเดือนนี้"

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
};
