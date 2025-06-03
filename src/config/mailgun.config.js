import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import dotenv from 'dotenv';

dotenv.config();

const mailgun = new Mailgun(FormData);

const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
  url: process.env.MAILGUN_BASE_URL || 'https://api.mailgun.net'
});

export default mg;

// Use real domain if available, fallback to sandbox
export const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || process.env.MAILGUN_SANDBOX_DOMAIN;

// Check if we should use sandbox mode
export const USE_SANDBOX = process.env.NODE_ENV !== 'production' || !process.env.MAILGUN_DOMAIN;
