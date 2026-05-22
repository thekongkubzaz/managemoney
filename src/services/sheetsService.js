const { google } = require('googleapis');
const { config } = require('../config');

function getAuthClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}');
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function appendTransaction(transaction) {
  if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return; // ข้ามถ้ายังไม่ตั้งค่า
  }
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const row = [
      transaction.date,
      transaction.type,
      transaction.item,
      transaction.amount,
      transaction.category,
      transaction.line_user_id || '',
      new Date().toISOString(),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'transactions!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    console.log(`📊 Synced to Google Sheets: ${transaction.item}`);
  } catch (err) {
    console.error('❌ Google Sheets sync failed:', err.message);
    // ไม่ throw เพื่อไม่ให้กระทบการบันทึกหลัก
  }
}

module.exports = { appendTransaction };
