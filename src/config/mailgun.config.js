const FormData = require('form-data');
const Mailgun = require('mailgun.js');
const dotenv = require('dotenv');

dotenv.config();

const mailgun = new Mailgun(FormData);

const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
  url: process.env.MAILGUN_BASE_URL || 'https://api.mailgun.net'
});

module.exports = mg;
module.exports.MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || process.env.MAILGUN_SANDBOX_DOMAIN;
module.exports.USE_SANDBOX = process.env.NODE_ENV !== 'production' || !process.env.MAILGUN_DOMAIN;
