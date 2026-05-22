const line = require('@line/bot-sdk');
const config = require('../config');

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

module.exports = { client, replyMessage, pushMessage };
