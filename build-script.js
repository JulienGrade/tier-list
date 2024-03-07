const fs = require('fs');
const configContent = `
const config = {
  API_URL: "${process.env.API_URL}",
  API_KEY: "${process.env.API_KEY}"
};
`;
fs.writeFileSync('./public/config.js', configContent);