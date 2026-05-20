import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

export async function sendOtpEmail(toEmail, otp, type) {
  const subjects = {
    email_verification: 'Verify your SmartMoney account',
    password_reset: 'Reset your SmartMoney password',
  };

  const bodies = {
    email_verification: `
      <p>Welcome to SmartMoney!</p>
      <p>Your email verification code is:</p>
      <h2 style="letter-spacing: 6px; font-size: 32px;">${otp}</h2>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not create an account, you can ignore this email.</p>
    `,
    password_reset: `
      <p>You requested a password reset for your SmartMoney account.</p>
      <p>Your password reset code is:</p>
      <h2 style="letter-spacing: 6px; font-size: 32px;">${otp}</h2>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  };

  const msg = {
    to: toEmail,
    from: FROM_EMAIL,
    subject: subjects[type],
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1a1a1a; font-size: 20px;">SmartMoney</h1>
        ${bodies[type]}
        <p style="color: #888; font-size: 12px; margin-top: 32px;">
          Do not share this code with anyone.
        </p>
      </div>
    `,
  };

  await sgMail.send(msg);
}