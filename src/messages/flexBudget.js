const { formatMoney } = require('../utils/moneyParser');

function buildBudgetFlex(budgetSummary, month) {
  if (!budgetSummary || budgetSummary.length === 0) {
    return {
      type: 'text',
      text: '📋 ยังไม่มีงบประมาณเดือนนี้ครับ\nพิมพ์ "ตั้งงบ อาหาร 3000" เพื่อตั้งงบประมาณ',
    };
  }

  const totalBudget = budgetSummary.reduce((s, b) => s + b.budget, 0);
  const totalActual = budgetSummary.reduce((s, b) => s + b.actual, 0);
  const totalRemaining = totalBudget - totalActual;
  const overallPct = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;
  const overColor = overallPct >= 100 ? '#FF334B' : overallPct >= 80 ? '#FF8C00' : '#00B900';

  return {
    type: 'flex',
    altText: `💸 งบประมาณเดือน ${month} | ใช้ไปแล้ว ${overallPct}%`,
    contents: {
      type: 'bubble',
      size: 'mega',

      header: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '20px',
        background: {
          type: 'linearGradient',
          angle: '135deg',
          startColor: '#0f3460',
          endColor: '#16213e',
        },
        contents: [
          {
            type: 'text',
            text: `💸 งบประมาณเดือน ${month}`,
            color: '#ffffff',
            weight: 'bold',
            size: 'md',
          },
          { type: 'separator', margin: '12px', color: '#ffffff33' },
          {
            type: 'box',
            layout: 'horizontal',
            margin: '12px',
            contents: [
              overviewCard('งบทั้งหมด', `฿${formatMoney(totalBudget)}`, '#aaaacc'),
              overviewCard('ใช้ไปแล้ว', `฿${formatMoney(totalActual)}`, '#FF8C00'),
              overviewCard('คงเหลือ', `฿${formatMoney(totalRemaining)}`, totalRemaining >= 0 ? '#00B900' : '#FF334B'),
            ],
          },
          // overall progress bar
          {
            type: 'box',
            layout: 'vertical',
            margin: '10px',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                justifyContent: 'space-between',
                contents: [
                  { type: 'text', text: 'ภาพรวมการใช้จ่าย', size: 'xs', color: '#aaaacc' },
                  { type: 'text', text: `${overallPct}%`, size: 'xs', color: overColor, align: 'end' },
                ],
              },
              progressBar(Math.min(overallPct, 100), overColor),
            ],
          },
        ],
      },

      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '16px',
        contents: [
          { type: 'text', text: '📊 งบแต่ละหมวด', size: 'sm', weight: 'bold', color: '#333333' },
          ...budgetSummary.map(b => budgetRow(b)),
        ],
      },
    },
  };
}

function buildBudgetSetFlex(data, isUpdate, month) {
  const statusText = isUpdate ? 'อัปเดตงบประมาณแล้ว' : 'ตั้งงบประมาณแล้ว';
  return {
    type: 'flex',
    altText: `✅ ${statusText}: ${data.category} ฿${formatMoney(data.budget)}`,
    contents: {
      type: 'bubble',
      size: 'kilo',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0f3460',
        paddingAll: '16px',
        contents: [
          { type: 'text', text: `✅ ${statusText}`, color: '#ffffff', weight: 'bold', size: 'md' },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '16px',
        contents: [
          budgetInfoRow('🏷 หมวด', data.category),
          budgetInfoRow('💵 งบ/เดือน', `฿${formatMoney(Number(data.amount))}`),
          budgetInfoRow('📅 เดือน', month),
        ],
      },
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────

function overviewCard(label, value, color) {
  return {
    type: 'box',
    layout: 'vertical',
    flex: 1,
    alignItems: 'center',
    contents: [
      { type: 'text', text: label, size: 'xxs', color: '#aaaacc', align: 'center' },
      { type: 'text', text: value, size: 'xs', weight: 'bold', color, align: 'center', wrap: false },
    ],
  };
}

function progressBar(pct, color) {
  const safePct = Math.max(1, Math.min(pct, 100));
  return {
    type: 'box',
    layout: 'horizontal',
    height: '6px',
    margin: '6px',
    backgroundColor: '#333366',
    cornerRadius: '4px',
    contents: [
      { type: 'box', layout: 'vertical', flex: safePct, backgroundColor: color, cornerRadius: '4px', contents: [] },
      { type: 'box', layout: 'vertical', flex: 100 - safePct, contents: [] },
    ],
  };
}

function budgetRow(b) {
  const pct = Math.min(b.percent, 100);
  const barColor = b.percent >= 100 ? '#FF334B' : b.percent >= 80 ? '#FF8C00' : '#00B900';
  const statusEmoji = b.percent >= 100 ? '🔴' : b.percent >= 80 ? '🟡' : '🟢';

  return {
    type: 'box',
    layout: 'vertical',
    spacing: 'none',
    paddingTop: '6px',
    contents: [
      {
        type: 'box',
        layout: 'horizontal',
        contents: [
          { type: 'text', text: `${statusEmoji} ${b.category}`, size: 'sm', color: '#333333', flex: 4 },
          {
            type: 'text',
            text: `฿${formatMoney(b.actual)} / ฿${formatMoney(b.budget)}`,
            size: 'xs',
            color: '#666666',
            align: 'end',
            flex: 5,
          },
        ],
      },
      {
        type: 'box',
        layout: 'horizontal',
        height: '5px',
        margin: '4px',
        backgroundColor: '#EEEEEE',
        cornerRadius: '4px',
        contents: [
          { type: 'box', layout: 'vertical', flex: Math.max(pct, 1), backgroundColor: barColor, cornerRadius: '4px', contents: [] },
          { type: 'box', layout: 'vertical', flex: 100 - pct, contents: [] },
        ],
      },
      {
        type: 'text',
        text: b.remaining >= 0
          ? `เหลือ ฿${formatMoney(b.remaining)} (${b.percent}%)`
          : `เกินงบ ฿${formatMoney(Math.abs(b.remaining))} ⚠️`,
        size: 'xxs',
        color: b.remaining >= 0 ? '#888888' : '#FF334B',
        margin: '2px',
      },
    ],
  };
}

function budgetInfoRow(label, value) {
  return {
    type: 'box',
    layout: 'horizontal',
    contents: [
      { type: 'text', text: label, size: 'sm', color: '#888888', flex: 2 },
      { type: 'text', text: value, size: 'sm', color: '#333333', flex: 3, align: 'end', weight: 'bold' },
    ],
  };
}

module.exports = { buildBudgetFlex, buildBudgetSetFlex };
