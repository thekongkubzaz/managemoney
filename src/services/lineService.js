const line = require('@line/bot-sdk');
const { config } = require('../config');

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.line.channelAccessToken,
});

async function replyMessage(replyToken, messages) {
  const msgs = Array.isArray(messages) ? messages : [messages];
  return client.replyMessage({ replyToken, messages: msgs });
}

async function pushMessage(userId, messages) {
  const msgs = Array.isArray(messages) ? messages : [messages];
  return client.pushMessage({ to: userId, messages: msgs });
}

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') return;

  const { handleTextMessage } = require('../handlers/messageHandler');
  const userId = event.source.userId;
  const userMessage = event.message.text.trim();
  const replyToken = event.replyToken;

  const reply = await handleTextMessage(userId, userMessage);

  if (!reply) return;

  const messages = typeof reply === 'string'
    ? [{ type: 'text', text: reply }]
    : Array.isArray(reply) ? reply : [reply];

  return client.replyMessage({ replyToken, messages });
}

module.exports = { client, replyMessage, pushMessage, handleEvent };
