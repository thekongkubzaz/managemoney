const express = require('express');
const line = require('@line/bot-sdk');
const { config } = require('./config');
const { handleEvent } = require('./services/lineService');
const { sendDailyReminder } = require('./cron/dailyReminder');

function createApp() {
  const app = express();
  const lineMiddleware = line.middleware({
    channelSecret: config.line.channelSecret,
  });
  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      name: 'ManageMoney LINE Bot',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Cron endpoint — เรียกโดย Render Cron Job หรือ UptimeRobot
  app.post('/cron/daily-reminder', async (req, res) => {
    const secret = req.headers['x-cron-secret'];
    if (secret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const result = await sendDailyReminder();
      return res.json({ status: 'ok', ...result });
    } catch (err) {
      console.error('❌ Cron error:', err);
      return res.status(500).json({ status: 'error', message: err.message });
    }
  });
  app.post('/webhook', lineMiddleware, async (req, res) => {
    try {
      const events = req.body.events || [];
      if (events.length === 0) {
        return res.status(200).json({ status: 'no events' });
      }
      const results = await Promise.allSettled(
        events.map((event) => handleEvent(event))
      );
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`❌ Event ${index} failed:`, result.reason);
        }
      });
      return res.status(200).json({ status: 'ok' });
    } catch (error) {
      console.error('❌ Webhook error:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  });
  return app;
}
module.exports = { createApp };
