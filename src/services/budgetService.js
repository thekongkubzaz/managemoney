const { supabase } = require('./supabaseClient');
const TABLE = 'budgets';

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

async function setBudget(lineUserId, category, amount, month = getCurrentMonth()) {
  // upsert — ถ้ามีอยู่แล้วให้อัปเดต
  const { data: existing } = await supabase
    .from(TABLE)
    .select('id')
    .eq('line_user_id', lineUserId)
    .eq('category', category)
    .eq('month', month)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ amount })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return { ...data, isUpdate: true };
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert([{ line_user_id: lineUserId, category, amount, month }])
    .select()
    .single();
  if (error) throw error;
  return { ...data, isUpdate: false };
}

async function getBudgets(lineUserId, month = getCurrentMonth()) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('line_user_id', lineUserId)
    .eq('month', month)
    .order('category');
  if (error) throw error;
  return data || [];
}

async function getBudgetSummary(lineUserId, month = getCurrentMonth()) {
  const [budgets, transactions] = await Promise.all([
    getBudgets(lineUserId, month),
    (async () => {
      const startDate = `${month}-01`;
      const endDate = new Date(month.split('-')[0], month.split('-')[1], 0)
        .toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('line_user_id', lineUserId)
        .eq('type', 'รายจ่าย')
        .gte('date', startDate)
        .lte('date', endDate);
      if (error) throw error;
      return data || [];
    })(),
  ]);

  // รวมยอดใช้จริงแต่ละหมวด
  const actualMap = {};
  transactions.forEach(t => {
    actualMap[t.category] = (actualMap[t.category] || 0) + Number(t.amount);
  });

  return budgets.map(b => ({
    category: b.category,
    budget: Number(b.amount),
    actual: actualMap[b.category] || 0,
    remaining: Number(b.amount) - (actualMap[b.category] || 0),
    percent: Math.round(((actualMap[b.category] || 0) / Number(b.amount)) * 100),
  }));
}

module.exports = { setBudget, getBudgets, getBudgetSummary, getCurrentMonth };
