const { formatMoney } = require('../utils/moneyParser');
const { formatDateThai } = require('../utils/dateParser');

function buildSummaryFlex(summary) {
  const {
    totalIncome, totalExpense, balance,
    topCategory, categoryBreakdown,
    recentItems, month, totalTransactions,
  } = summary;

  const isProfit = balance >= 0;
  const balanceColor = isProfit ? '#00B900' : '#FF334B';
  const balanceBg   = isProfit ? '#F0FFF4' : '#FFF0F0';
  const balanceLabel = isProfit ? '💰 เงินคงเหลือ' : '⚠️ เงินขาด';

  const savingRate = totalIncome > 0
    ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
    : 0;

  return {
    type: 'flex',
    altText: `📊 สรุปเดือน ${month} | คงเหลือ ฿${formatMoney(balance)}`,
    contents: {
      type: 'bubble',
      size: 'mega',

      // ─── HEADER ───────────────────────────────────────────
      header: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '20px',
        background: {
          type: 'linearGradient',
          angle: '135deg',
          startColor: '#1a1a2e',
          endColor: '#16213e',
        },
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            justifyContent: 'space-between',
            contents: [
              {
                type: 'text',
                text: '📊 สรุปรายรับ-รายจ่าย',
                color: '#ffffff',
                size: 'md',
                weight: 'bold',
              },
              {
                type: 'text',
                text: `เดือน ${month}`,
                color: '#aaaacc',
                size: 'sm',
                align: 'end',
              },
            ],
          },
          { type: 'separator', margin: '12px', color: '#ffffff33' },
          // Balance Card
          {
            type: 'box',
            layout: 'vertical',
            margin: '12px',
            backgroundColor: balanceBg,
            cornerRadius: '12px',
            paddingAll: '14px',
            alignItems: 'center',
            contents: [
              { type: 'text', text: balanceLabel, size: 'sm', color: '#555555', align: 'center' },
              {
                type: 'text',
                text: `฿${formatMoney(Math.abs(balance))}`,
                size: 'xxl',
                weight: 'bold',
                color: balanceColor,
                align: 'center',
              },
              {
                type: 'text',
                text: totalIncome > 0 ? `อัตราออม ${savingRate}%` : ' ',
                size: 'xs',
                color: '#888888',
                align: 'center',
              },
            ],
          },
        ],
      },

      // ─── BODY ─────────────────────────────────────────────
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '16px',
        contents: [

          // รายรับ / รายจ่าย card
          {
            type: 'box',
            layout: 'horizontal',
            spacing: 'sm',
            contents: [
              incomeExpenseCard('💚 รายรับ', totalIncome, '#00B900', '#F0FFF4'),
              incomeExpenseCard('❤️ รายจ่าย', totalExpense, '#FF334B', '#FFF0F0'),
            ],
          },

          // จำนวนรายการ
          {
            type: 'box',
            layout: 'horizontal',
            backgroundColor: '#F7F8FA',
            cornerRadius: '8px',
            paddingAll: '10px',
            justifyContent: 'space-between',
            contents: [
              { type: 'text', text: '🧾 รายการทั้งหมด', size: 'sm', color: '#555555' },
              { type: 'text', text: `${totalTransactions || 0} รายการ`, size: 'sm', weight: 'bold', color: '#333333', align: 'end' },
            ],
          },

          // หมวดหมู่ที่ใช้
          ...(categoryBreakdown && categoryBreakdown.length > 0 ? [
            { type: 'separator' },
            { type: 'text', text: '🏷 หมวดที่ใช้เยอะสุด', size: 'sm', weight: 'bold', color: '#333333' },
            ...categoryBreakdown.map((cat, i) =>
              categoryRow(cat, totalExpense, i === 0)
            ),
          ] : []),

          // รายการล่าสุด
          ...(recentItems && recentItems.length > 0 ? [
            { type: 'separator' },
            { type: 'text', text: '📋 รายการล่าสุด', size: 'sm', weight: 'bold', color: '#333333' },
            ...recentItems.slice(0, 5).map(t => recentRow(t)),
          ] : []),
        ],
      },
    },
  };
}

// ─── Helper Components ─────────────────────────────────────

function incomeExpenseCard(label, amount, color, bg) {
  return {
    type: 'box',
    layout: 'vertical',
    flex: 1,
    backgroundColor: bg,
    cornerRadius: '10px',
    paddingAll: '12px',
    alignItems: 'center',
    contents: [
      { type: 'text', text: label, size: 'xs', color: '#666666', align: 'center' },
      {
        type: 'text',
        text: `฿${formatMoney(amount)}`,
        size: 'sm',
        weight: 'bold',
        color,
        align: 'center',
        wrap: false,
      },
    ],
  };
}

function categoryRow(cat, totalExpense, isTop) {
  const pct = totalExpense > 0 ? Math.round((cat.amount / totalExpense) * 100) : 0;
  return {
    type: 'box',
    layout: 'vertical',
    spacing: 'none',
    contents: [
      {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'text',
            text: `${isTop ? '🥇' : '•'} ${cat.name}`,
            size: 'xs',
            color: '#444444',
            flex: 5,
          },
          {
            type: 'text',
            text: `฿${formatMoney(cat.amount)} (${pct}%)`,
            size: 'xs',
            color: '#FF334B',
            align: 'end',
            flex: 4,
          },
        ],
      },
      // progress bar
      {
        type: 'box',
        layout: 'horizontal',
        height: '4px',
        margin: '4px',
        backgroundColor: '#EEEEEE',
        cornerRadius: '4px',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            flex: pct,
            backgroundColor: isTop ? '#FF334B' : '#FFAAAA',
            cornerRadius: '4px',
            contents: [],
          },
          { type: 'box', layout: 'vertical', flex: 100 - pct, contents: [] },
        ],
      },
    ],
  };
}

function recentRow(t) {
  const isIncome = t.type === 'รายรับ';
  const dateStr = t.date ? formatDateThai(t.date) : '';
  return {
    type: 'box',
    layout: 'horizontal',
    paddingTop: '4px',
    contents: [
      {
        type: 'box',
        layout: 'vertical',
        flex: 5,
        contents: [
          {
            type: 'text',
            text: t.item.length > 14 ? t.item.substring(0, 14) + '…' : t.item,
            size: 'xs',
            color: '#333333',
          },
          { type: 'text', text: dateStr, size: 'xxs', color: '#AAAAAA' },
        ],
      },
      {
        type: 'text',
        text: `${isIncome ? '+' : '-'}฿${formatMoney(Number(t.amount))}`,
        size: 'xs',
        weight: 'bold',
        color: isIncome ? '#00B900' : '#FF334B',
        align: 'end',
        flex: 3,
      },
    ],
  };
}

module.exports = { buildSummaryFlex };
