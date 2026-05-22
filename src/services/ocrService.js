const axios = require('axios');
const { config } = require('../config');

async function getImageBuffer(messageId) {
  const url = `https://api-data.line.me/v2/bot/message/${messageId}/content`;
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${config.line.channelAccessToken}` },
    responseType: 'arraybuffer',
  });
  return Buffer.from(res.data);
}

async function parseReceiptImage(messageId) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const { config: cfg } = require('./geminiService') || {};

  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  const model = genAI.getGenerativeModel({ model: config.gemini.model });

  const imageBuffer = await getImageBuffer(messageId);
  const base64 = imageBuffer.toString('base64');

  const prompt = `วิเคราะห์ใบเสร็จ/สลิปนี้และตอบกลับเป็น JSON เท่านั้น ห้ามมี markdown:
{
  "item": "ชื่อร้านหรือรายการหลัก",
  "amount": ยอดรวมเป็นตัวเลข,
  "category": "หมวดหมู่ เช่น อาหาร เดินทาง ช้อปปิ้ง สุขภาพ อื่นๆ",
  "date": "YYYY-MM-DD หรือ null ถ้าไม่พบ",
  "type": "รายจ่าย",
  "items_detail": "รายการสินค้าย่อ (ถ้ามี)",
  "store_name": "ชื่อร้าน"
}
ถ้าไม่ใช่ใบเสร็จให้ตอบ: {"error": "ไม่ใช่ใบเสร็จ"}`;

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: base64 } },
      ],
    }],
  });

  const text = result.response.text().trim()
    .replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();

  return JSON.parse(text);
}

module.exports = { parseReceiptImage };
