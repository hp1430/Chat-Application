import nodemailer from 'nodemailer';

import { MAIL_ID, MAIL_PASSWORD } from './serverConfig.js';

export default nodemailer.createTransport({
  host: 'smtp.zoho.in',
  secure: true,
  port: 465,
  auth: {
    user: MAIL_ID,
    pass: MAIL_PASSWORD
  },
  debug: true,
  logger: true
});
