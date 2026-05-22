const { createApp } = require('./app');
const { config } = require('./config');

const app = createApp();

app.listen(config.port, () => {
  console.log(`💰 ManageMoney Bot running on port ${config.port}`);
});
