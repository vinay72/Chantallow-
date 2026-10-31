// backend/mailer.js
// Sends transactional emails (currently just password-reset) over SMTP.
// Configure SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS in backend/.env
// (see .env.example). If they're not set, sendMail logs a warning and does
// nothing — the app still runs, it just can't deliver email yet.

const nodemailer = require('nodemailer');

const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM, CLIENT_ORIGIN } = process.env;

const isConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: SMTP_SECURE === 'true', // true for port 465, false for 587/25 (uses STARTTLS)
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

if (!isConfigured) {
  console.warn('SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS) — password-reset emails will not be sent.');
}

async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    throw Object.assign(new Error('Email sending is not configured on the server.'), { status: 503 });
  }
  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}

// The link a password-reset email points to.
const resetLink = (token) => `${(CLIENT_ORIGIN || 'http://localhost:5173').split(',')[0].trim()}/reset-password?token=${token}`;

async function sendPasswordResetEmail(user, token) {
  const link = resetLink(token);
  await sendMail({
    to: user.email,
    subject: 'Reset your Chantallow password',
    text: `Hi ${user.name || ''},\n\nWe received a request to reset your Chantallow password. Open this link to choose a new one (it expires in 1 hour):\n\n${link}\n\nIf you didn't ask for this, you can ignore this email — your password will stay the same.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1c1c1a;">
        <h2 style="color: #1b4d3e;">Reset your password</h2>
        <p>Hi ${user.name || ''},</p>
        <p>We received a request to reset your Chantallow password. Click the button below to choose a new one. This link expires in 1 hour.</p>
        <p style="margin: 28px 0;">
          <a href="${link}" style="background: #1b4d3e; color: #fff; padding: 12px 28px; border-radius: 4px; text-decoration: none; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color: #6b7a70; font-size: 13px;">If you didn't ask for this, you can ignore this email — your password will stay the same.</p>
        <p style="color: #6b7a70; font-size: 13px;">Or copy this link: <br>${link}</p>
      </div>
    `,
  });
}

module.exports = { isConfigured, sendMail, sendPasswordResetEmail, resetLink };
