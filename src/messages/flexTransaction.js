const { formatDateThai } = require('../utils/dateParser');
const { formatMoney } = require('../utils/moneyParser');
const { getPersonalityComment } = require('./personality');

function buildTransactionFlex(transaction) {
  const isIncome = transaction.type === 'รายรับ';
  const color = isIncome ? '#27ae60' : '#e74c3c';
  const emoji = isIncome ? '💚' : '❤️';
  const headerText = isIncome ? 'บันทึกรายรับ' : 'บันทึกรายจ่าย';
  const dateStr = formatDateThai(transaction.date);

  const comment = getPersonalityComment(transaction.type, transaction.category);

  return {
    type: 'flex',
    altText: `${headerText}: ${transaction.item} ฿${formatMoney(Number(transaction.amount))}`,
    contents: {
      type: 'bubble',
      size: 'kilo',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: color,
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: `${emoji} ${headerText}`,
            color: '#ffffff',
            weight: 'bold',
            size: 'md',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '16px',
        contents: [
          row('📝 รายการ', transaction.item),
          row('💵 จำนวน', `฿${formatMoney(Number(transaction.amount))}`),
          row('🏷 หมวด', transaction.category),
          row('📅 วันที่', dateStr),
          { type: 'separator', margin: 'sm' },
          {
            type: 'text',
            text: comment,
            size: 'xs',
            color: '#888888',
            wrap: true,
            margin: 'sm',
          },
        ],
      },
      styles: {
        header: { separator: false },
        body: { separator: true },
      },
    },
  };
}

function row(label, value) {
  return {
    type: 'box',
    layout: 'horizontal',
    contents: [
      { type: 'text', text: label, size: 'sm', color: '#888888', flex: 2 },
      { type: 'text', text: value, size: 'sm', color: '#333333', flex: 3, wrap: true, align: 'end' },
    ],
  };
}

module.exports = { buildTransactionFlex };
