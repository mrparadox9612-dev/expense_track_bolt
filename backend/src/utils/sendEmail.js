const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // TODO: EMAIL - Configure email transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // TODO: EMAIL - Define email options
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message.replace(/\n/g, '<br>'),
  };

  // TODO: EMAIL - Send email
  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
  return info;
};

module.exports = sendEmail;