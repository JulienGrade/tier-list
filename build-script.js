const fs = require('fs');
const path = require('path');

const configContent = `const config = {
  API_URL: "${process.env.API_URL}",
  API_KEY: "${process.env.API_KEY}"
};`;

fs.writeFileSync(path.join(__dirname, 'config.js'), configContent);
