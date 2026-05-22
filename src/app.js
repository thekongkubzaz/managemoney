const express = require('express');
const line = require('@line/bot-sdk');
const config = require('./config');
const { handleMessage } = require('./handlers/messageHandler');

const app = express();

const lineConfig = {
  channelAccessToken: config.line.channelAccessToken,
  channelSecret: config.line.channelSecret,
};

// LINE webhook endpoint
app.post(
  '/webhook',
  line.middleware(lineConfig),
  async (req, res) => {
    const events = req.body.events;

    await Promise.all(
      events.map(event => {
        if (event.type === 'message' && event.message.type === 'text') {
          return handleMessage(event);
        }
        return Promise.resolve();
      })
    );

    res.json({ status: 'ok' });
  }
);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ManageMoney Bot is running 💰' });
});

module.exports = app;
