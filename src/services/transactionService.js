const { supabase, TABLE } = require('./supabaseClient');
const { resolveDate, getTodayStr } = require('../utils/dateParser');
const { appendTransaction } = require('./sheetsService');

async function saveTransaction({ item, amount, category, type, date, lineUserId }) {
  const resolvedDate = resolveDate(date) || getTodayStr();

  const { data, error } = await supabase
    .from(TABLE)
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

  // Sync to Google Sheets (non-blocking)
  appendTransaction(data).catch(() => {});

  return data;
}

async function getMonthlySummary(lineUserId) {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from(TABLE)
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
  const categoryBreakdown = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, amount]) => ({ name, amount }));

  const topCategory = categoryBreakdown[0] || null;

  return {
    totalIncome,
    totalExpense,
    balance,
    topCategory,
    categoryBreakdown,
    recentItems: data.slice(0, 5),
    month: `${now.getMonth() + 1}/${now.getFullYear()}`,
    totalTransactions: data.length,
  };
}

async function getRecentTransactions(lineUserId, limit = 10) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('line_user_id', lineUserId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

async function getTransactions({ lineUserId, type, category, startDate, endDate, limit = 50 } = {}) {
  let query = supabase.from(TABLE).select('*');

  if (lineUserId) query = query.eq('line_user_id', lineUserId);
  if (type)       query = query.eq('type', type);
  if (category)   query = query.eq('category', category);
  if (startDate)  query = query.gte('date', startDate);
  if (endDate)    query = query.lte('date', endDate);

  query = query.order('date', { ascending: false }).limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function findMatchingTransactions(lineUserId, keyword, amount) {
  let query = supabase
    .from(TABLE)
    .select('*')
    .eq('line_user_id', lineUserId)
    .order('date', { ascending: false })
    .limit(10);

  if (keyword) query = query.ilike('item', `%${keyword}%`);
  if (amount)  query = query.eq('amount', amount);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function deleteTransaction(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
  return true;
}

async function saveAndBuildReply(transactionData, userId) {
  const { buildTransactionFlex } = require('../messages/flexTransaction');
  const saved = await saveTransaction({ ...transactionData, lineUserId: userId });
  return buildTransactionFlex(saved);
}

module.exports = { saveTransaction, getMonthlySummary, getRecentTransactions, getTransactions, saveAndBuildReply, findMatchingTransactions, deleteTransaction };
