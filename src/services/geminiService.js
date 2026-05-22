const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');
const { buildParsePrompt } = require('../constants/prompts');
const { getTodayStr } = require('../utils/dateParser');

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

async function parseTransaction(userMessage) {
  try {
    const model = genAI.getGenerativeModel({ model: config.gemini.model });
    const todayStr = getTodayStr();
    const prompt = buildParsePrompt(userMessage, todayStr);

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // ลบ markdown code block ถ้ามี
    const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleaned);

    return parsed;
  } catch (err) {
    console.error('Gemini parse error:', err.message);
    return null;
  }
}

module.exports = { parseTransaction };
