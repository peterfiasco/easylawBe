const dotenv = require('dotenv');
dotenv.config();

// Temporary mock for deployment
const mg = {
  messages: {
    create: async (domain, data) => {
      console.log('📧 Email would be sent:', data.subject, 'to:', data.to);
      return { id: 'mock-email-id', message: 'Email queued' };
    }
  }
};

module.exports = mg;
module.exports.MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || process.env.MAILGUN_SANDBOX_DOMAIN;
module.exports.USE_SANDBOX = process.env.NODE_ENV !== 'production' || !process.env.MAILGUN_DOMAIN;
