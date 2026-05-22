const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const { resolveDate, getTodayStr } = require('../utils/dateParser');

const supabase = createClient(config.supabase.url, config.supabase.anonKey);

async function saveTransaction({ item, amount, category, type, date, lineUserId }) {
  const resolvedDate = resolveDate(date) || getTodayStr();

  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      item,
      amount,
      category,
      type,
      date: resolvedDate,
      line_user_id: lineUserId,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getMonthlySummary(lineUserId) {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('line_user_id', lineUserId)
    .gte('date', firstDay)
    .lte('date', lastDay)
    .order('date', { ascending: false });

  if (error) throw error;

  const income = data.filter(t => t.type === 'รายรับ');
  const expense = data.filter(t => t.type === 'รายจ่าย');

  const totalIncome = income.reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = expense.reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  // หมวดที่ใช้เยอะสุด
  const categoryMap = {};
  expense.forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
  });
  const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];

  return {
    totalIncome,
    totalExpense,
    balance,
    topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
    recentItems: data.slice(0, 5),
    month: `${now.getMonth() + 1}/${now.getFullYear()}`,
  };
}

async function getRecentTransactions(lineUserId, limit = 10) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('line_user_id', lineUserId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

module.exports = { saveTransaction, getMonthlySummary, getRecentTransactions };
