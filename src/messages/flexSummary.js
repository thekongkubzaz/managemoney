const { formatMoney } = require('../utils/moneyParser');

function buildSummaryFlex(summary) {
  const { totalIncome, totalExpense, balance, topCategory, recentItems, month } = summary;
  const balanceColor = balance >= 0 ? '#27ae60' : '#e74c3c';
  const balanceEmoji = balance >= 0 ? '✅' : '⚠️';

  const recentRows = (recentItems || []).slice(0, 5).map(t => ({
    type: 'box',
    layout: 'horizontal',
    contents: [
      {
        type: 'text',
        text: t.item.length > 12 ? t.item.substring(0, 12) + '…' : t.item,
        size: 'xs',
        color: '#555555',
        flex: 4,
        wrap: false,
      },
      {
        type: 'text',
        text: `${t.type === 'รายรับ' ? '+' : '-'}฿${formatMoney(Number(t.amount))}`,
        size: 'xs',
        color: t.type === 'รายรับ' ? '#27ae60' : '#e74c3c',
        flex: 3,
        align: 'end',
      },
    ],
  }));

  return {
    type: 'flex',
    altText: `สรุปเดือน ${month}: คงเหลือ ฿${formatMoney(balance)}`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#2c3e50',
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: `📊 สรุปเดือน ${month}`,
            color: '#ffffff',
            weight: 'bold',
            size: 'md',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '16px',
        contents: [
          // รายรับ / รายจ่าย
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              statBox('💚 รายรับ', `฿${formatMoney(totalIncome)}`, '#27ae60'),
              statBox('❤️ รายจ่าย', `฿${formatMoney(totalExpense)}`, '#e74c3c'),
            ],
          },
          // คงเหลือ
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#f8f9fa',
            cornerRadius: '8px',
            paddingAll: '12px',
            contents: [
              {
                type: 'text',
                text: `${balanceEmoji} คงเหลือ`,
                size: 'sm',
                color: '#888888',
              },
              {
                type: 'text',
                text: `฿${formatMoney(balance)}`,
                size: 'xl',
                weight: 'bold',
                color: balanceColor,
              },
            ],
          },
          // หมวดที่ใช้เยอะสุด
          topCategory
            ? {
                type: 'text',
                text: `🏆 ใช้เยอะสุด: ${topCategory.name} (฿${formatMoney(topCategory.amount)})`,
                size: 'sm',
                color: '#555555',
              }
            : { type: 'text', text: ' ', size: 'xs' },
          // separator
          { type: 'separator' },
          // รายการล่าสุด
          {
            type: 'text',
            text: '📋 รายการล่าสุด',
            size: 'sm',
            weight: 'bold',
            color: '#333333',
          },
          ...recentRows,
        ],
      },
    },
  };
}

function statBox(label, value, color) {
  return {
    type: 'box',
    layout: 'vertical',
    flex: 1,
    alignItems: 'center',
    contents: [
      { type: 'text', text: label, size: 'xs', color: '#888888' },
      { type: 'text', text: value, size: 'sm', weight: 'bold', color },
    ],
  };
}

module.exports = { buildSummaryFlex };
