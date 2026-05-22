const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`💰 ManageMoney Bot running on port ${config.port}`);
});
