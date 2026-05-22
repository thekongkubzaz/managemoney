const { GoogleGenerativeAI } = require('@google/generative-ai');
const { config } = require('../config');
const { buildParsePrompt, buildSystemPrompt, buildUserPrompt } = require('../constants/prompts');
const { getTodayStr, getToday, getYesterday } = require('../utils/dateParser');
const { sanitizeResult, fallbackParse } = require('../utils/moneyParser');

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
const model = genAI.getGenerativeModel({
  model: config.gemini.model,
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.15,
  },
});

async function parseTransaction(userMessage) {
  try {
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

async function parseExpenseMessage(userMessage) {
  try {
    const today = getToday();
    const yesterday = getYesterday();

    const systemPrompt = buildSystemPrompt(today, yesterday);
    const userPrompt = buildUserPrompt(userMessage);
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt + '\n\n' + userPrompt }],
        },
      ],
    });
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);
    return sanitizeResult(parsed, userMessage);
  } catch (error) {
    console.error('❌ Gemini AI Error:', error.message);
    return fallbackParse(userMessage);
  }
}

module.exports = { parseTransaction, parseExpenseMessage };
